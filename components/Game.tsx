import { useEffect, useRef, useState, useCallback } from "react";
import {
  GameState,
  GameStatus,
  Tower,
  TowerType,
  EnemyType,
} from "@/types/game";
import {
  INITIAL_HEALTH,
  INITIAL_GOLD,
  GAME_MAP,
  TOWER_STATS,
  PATH_POSITIONS,
  CELL_SIZE,
} from "@/lib/constants";
import {
  generateWave,
  createEnemy,
  moveEnemy,
  findTargetEnemy,
  getDistance,
  canPlaceTower,
} from "@/lib/gameUtils";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    health: INITIAL_HEALTH,
    gold: INITIAL_GOLD,
    wave: 1,
    enemies: [],
    towers: [],
    projectiles: [],
    selectedTowerType: null,
    gameStatus: GameStatus.PLAYING,
    score: 0,
  });

  const waveInProgressRef = useRef(false);
  const enemiesToSpawnRef = useRef<{ type: EnemyType; time: number }[]>([]);
  const enemyIdCounterRef = useRef(0);
  const towerIdCounterRef = useRef(0);
  const projectileIdCounterRef = useRef(0);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== GameStatus.PLAYING) return;

    let lastTime = Date.now();
    let animationId: number;

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setGameState((prevState) => {
        let newState = { ...prevState };

        // Move enemies
        newState.enemies = newState.enemies.map((enemy) => moveEnemy(enemy, deltaTime));

        // Check if enemies reached the end
        const reachedEnd = newState.enemies.filter(
          (enemy) => enemy.pathIndex >= PATH_POSITIONS.length - 1
        );

        if (reachedEnd.length > 0) {
          newState.health -= reachedEnd.length;
          newState.enemies = newState.enemies.filter(
            (enemy) => enemy.pathIndex < PATH_POSITIONS.length - 1
          );

          if (newState.health <= 0) {
            newState.health = 0;
            newState.gameStatus = GameStatus.GAME_OVER;
          }
        }

        // Tower targeting and shooting
        newState.towers = newState.towers.map((tower) => {
          const target = findTargetEnemy(tower, newState.enemies);

          if (target && currentTime - tower.lastFireTime >= tower.fireRate) {
            // Create projectile
            const projectileId = `proj-${projectileIdCounterRef.current++}`;
            newState.projectiles.push({
              id: projectileId,
              position: { ...tower.position },
              targetId: target.id,
              damage: tower.damage,
              speed: 200,
              towerId: tower.id,
            });

            return { ...tower, targetId: target.id, lastFireTime: currentTime };
          }

          return { ...tower, targetId: target?.id || null };
        });

        // Move and update projectiles
        const projectilesToRemove: string[] = [];
        const enemiesToDamage: Map<string, number> = new Map();

        newState.projectiles = newState.projectiles
          .map((projectile) => {
            const target = newState.enemies.find((e) => e.id === projectile.targetId);

            if (!target) {
              projectilesToRemove.push(projectile.id);
              return projectile;
            }

            const distance = getDistance(projectile.position, target.position);

            if (distance < 10) {
              // Hit the target
              enemiesToDamage.set(
                target.id,
                (enemiesToDamage.get(target.id) || 0) + projectile.damage
              );
              projectilesToRemove.push(projectile.id);
              return projectile;
            }

            // Move towards target
            const dx = target.position.x - projectile.position.x;
            const dy = target.position.y - projectile.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ratio = (projectile.speed * deltaTime) / dist;

            return {
              ...projectile,
              position: {
                x: projectile.position.x + dx * ratio,
                y: projectile.position.y + dy * ratio,
              },
            };
          })
          .filter((p) => !projectilesToRemove.includes(p.id));

        // Apply damage to enemies
        let goldEarned = 0;
        let scoreEarned = 0;

        newState.enemies = newState.enemies
          .map((enemy) => {
            const damage = enemiesToDamage.get(enemy.id) || 0;
            if (damage > 0) {
              return { ...enemy, health: enemy.health - damage };
            }
            return enemy;
          })
          .filter((enemy) => {
            if (enemy.health <= 0) {
              goldEarned += enemy.reward;
              scoreEarned += enemy.reward * 10;
              return false;
            }
            return true;
          });

        newState.gold += goldEarned;
        newState.score += scoreEarned;

        return newState;
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState.gameStatus]);

  const startNextWave = useCallback(() => {
    const wave = generateWave(gameState.wave);
    const spawnQueue: { type: EnemyType; time: number }[] = [];
    let currentTime = Date.now() + 2000; // 2 second delay before first enemy

    wave.enemies.forEach((enemyGroup) => {
      for (let i = 0; i < enemyGroup.count; i++) {
        spawnQueue.push({
          type: enemyGroup.type,
          time: currentTime + i * enemyGroup.spawnInterval,
        });
      }
    });

    enemiesToSpawnRef.current = spawnQueue;
    waveInProgressRef.current = true;

    setGameState((prev) => ({
      ...prev,
      wave: prev.wave + 1,
    }));
  }, [gameState.wave]);

  // Wave spawning
  useEffect(() => {
    if (gameState.gameStatus !== GameStatus.PLAYING) return;

    const spawnInterval = setInterval(() => {
      const currentTime = Date.now();

      // Check if we should start a new wave
      if (
        !waveInProgressRef.current &&
        gameState.enemies.length === 0 &&
        enemiesToSpawnRef.current.length === 0
      ) {
        startNextWave();
      }

      // Spawn enemies from queue
      if (enemiesToSpawnRef.current.length > 0) {
        const toSpawn = enemiesToSpawnRef.current.filter(
          (e) => currentTime >= e.time
        );

        if (toSpawn.length > 0) {
          setGameState((prev) => ({
            ...prev,
            enemies: [
              ...prev.enemies,
              ...toSpawn.map((e) =>
                createEnemy(e.type, `enemy-${enemyIdCounterRef.current++}`)
              ),
            ],
          }));

          enemiesToSpawnRef.current = enemiesToSpawnRef.current.filter(
            (e) => currentTime < e.time
          );

          if (enemiesToSpawnRef.current.length === 0) {
            waveInProgressRef.current = false;
          }
        }
      }
    }, 100);

    return () => clearInterval(spawnInterval);
  }, [gameState.gameStatus, gameState.enemies.length, startNextWave]);

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (
        gameState.selectedTowerType &&
        gameState.gameStatus === GameStatus.PLAYING
      ) {
        const towerStats = TOWER_STATS[gameState.selectedTowerType];

        if (gameState.gold >= towerStats.cost) {
          const gridX = Math.floor(x / CELL_SIZE);
          const gridY = Math.floor(y / CELL_SIZE);

          if (canPlaceTower(x, y, gameState.towers, GAME_MAP)) {
            const newTower: Tower = {
              id: `tower-${towerIdCounterRef.current++}`,
              position: {
                x: gridX * CELL_SIZE + CELL_SIZE / 2,
                y: gridY * CELL_SIZE + CELL_SIZE / 2,
              },
              type: gameState.selectedTowerType,
              range: towerStats.range,
              damage: towerStats.damage,
              fireRate: towerStats.fireRate,
              lastFireTime: 0,
              cost: towerStats.cost,
              targetId: null,
            };

            setGameState((prev) => ({
              ...prev,
              towers: [...prev.towers, newTower],
              gold: prev.gold - towerStats.cost,
              selectedTowerType: null,
            }));
          }
        }
      }
    },
    [gameState.selectedTowerType, gameState.gold, gameState.towers, gameState.gameStatus]
  );

  const handleTowerSelect = useCallback((towerType: TowerType | null) => {
    setGameState((prev) => ({
      ...prev,
      selectedTowerType: towerType,
    }));
  }, []);

  const handlePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameStatus:
        prev.gameStatus === GameStatus.PLAYING
          ? GameStatus.PAUSED
          : GameStatus.PLAYING,
    }));
  }, []);

  const handleRestart = useCallback(() => {
    enemyIdCounterRef.current = 0;
    towerIdCounterRef.current = 0;
    projectileIdCounterRef.current = 0;
    waveInProgressRef.current = false;
    enemiesToSpawnRef.current = [];

    setGameState({
      health: INITIAL_HEALTH,
      gold: INITIAL_GOLD,
      wave: 1,
      enemies: [],
      towers: [],
      projectiles: [],
      selectedTowerType: null,
      gameStatus: GameStatus.PLAYING,
      score: 0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2">
            🏰 Tower Defense 🏰
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Defend your base from endless waves of enemies!</p>
        </div>

        {/* Game Container */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 border border-slate-700">
          <GameUI
            gameState={gameState}
            onTowerSelect={handleTowerSelect}
            onPause={handlePause}
            onRestart={handleRestart}
          />
          <div className="flex justify-center mt-3 md:mt-4">
            <GameCanvas
              gameState={gameState}
              onCanvasClick={handleCanvasClick}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs md:text-sm">
            💡 Tip: Place towers strategically to maximize coverage and survive longer!
          </p>
        </div>
      </div>
    </div>
  );
}
