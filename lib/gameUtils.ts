import { Enemy, EnemyType, Position, Tower, Wave } from "@/types/game";
import { ENEMY_STATS, PATH_POSITIONS, CELL_SIZE } from "./constants";

export function generateWave(waveNumber: number): Wave {
  const waves: Wave[] = [
    // Wave 1
    {
      number: 1,
      enemies: [{ type: EnemyType.BASIC, count: 10, spawnInterval: 1000 }],
      completed: false,
    },
    // Wave 2
    {
      number: 2,
      enemies: [
        { type: EnemyType.BASIC, count: 15, spawnInterval: 800 },
        { type: EnemyType.FAST, count: 5, spawnInterval: 1000 },
      ],
      completed: false,
    },
    // Wave 3
    {
      number: 3,
      enemies: [
        { type: EnemyType.BASIC, count: 10, spawnInterval: 700 },
        { type: EnemyType.FAST, count: 8, spawnInterval: 900 },
        { type: EnemyType.TANK, count: 2, spawnInterval: 2000 },
      ],
      completed: false,
    },
    // Wave 4
    {
      number: 4,
      enemies: [
        { type: EnemyType.BASIC, count: 20, spawnInterval: 600 },
        { type: EnemyType.FAST, count: 10, spawnInterval: 800 },
        { type: EnemyType.TANK, count: 5, spawnInterval: 1500 },
      ],
      completed: false,
    },
    // Wave 5 - Boss wave
    {
      number: 5,
      enemies: [
        { type: EnemyType.BASIC, count: 15, spawnInterval: 500 },
        { type: EnemyType.FAST, count: 12, spawnInterval: 700 },
        { type: EnemyType.TANK, count: 5, spawnInterval: 1200 },
        { type: EnemyType.BOSS, count: 1, spawnInterval: 5000 },
      ],
      completed: false,
    },
  ];

  // If wave number exceeds predefined waves, generate increasingly difficult waves
  if (waveNumber > waves.length) {
    const difficulty = waveNumber - waves.length;
    return {
      number: waveNumber,
      enemies: [
        { type: EnemyType.BASIC, count: 10 + difficulty * 5, spawnInterval: Math.max(400, 600 - difficulty * 20) },
        { type: EnemyType.FAST, count: 5 + difficulty * 3, spawnInterval: Math.max(500, 800 - difficulty * 30) },
        { type: EnemyType.TANK, count: 2 + difficulty * 2, spawnInterval: Math.max(800, 1500 - difficulty * 50) },
        { type: EnemyType.BOSS, count: Math.floor(difficulty / 2), spawnInterval: 5000 },
      ],
      completed: false,
    };
  }

  return waves[waveNumber - 1];
}

export function createEnemy(type: EnemyType, id: string): Enemy {
  const stats = ENEMY_STATS[type];
  const startPos = PATH_POSITIONS[0];

  return {
    id,
    position: { x: startPos.x * CELL_SIZE + CELL_SIZE / 2, y: startPos.y * CELL_SIZE + CELL_SIZE / 2 },
    health: stats.health,
    maxHealth: stats.health,
    speed: stats.speed,
    pathIndex: 0,
    reward: stats.reward,
    type,
  };
}

export function moveEnemy(enemy: Enemy, deltaTime: number): Enemy {
  if (enemy.pathIndex >= PATH_POSITIONS.length - 1) {
    return enemy;
  }

  const currentTarget = PATH_POSITIONS[enemy.pathIndex + 1];
  const targetX = currentTarget.x * CELL_SIZE + CELL_SIZE / 2;
  const targetY = currentTarget.y * CELL_SIZE + CELL_SIZE / 2;

  const dx = targetX - enemy.position.x;
  const dy = targetY - enemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 2) {
    return {
      ...enemy,
      position: { x: targetX, y: targetY },
      pathIndex: enemy.pathIndex + 1,
    };
  }

  const moveDistance = enemy.speed * deltaTime;
  const ratio = Math.min(moveDistance / distance, 1);

  return {
    ...enemy,
    position: {
      x: enemy.position.x + dx * ratio,
      y: enemy.position.y + dy * ratio,
    },
  };
}

export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function findTargetEnemy(tower: Tower, enemies: Enemy[]): Enemy | null {
  let closestEnemy: Enemy | null = null;
  let maxProgress = -1;

  for (const enemy of enemies) {
    const distance = getDistance(tower.position, enemy.position);
    const rangeInPixels = tower.range * CELL_SIZE;

    if (distance <= rangeInPixels && enemy.pathIndex > maxProgress) {
      closestEnemy = enemy;
      maxProgress = enemy.pathIndex;
    }
  }

  return closestEnemy;
}

export function canPlaceTower(x: number, y: number, towers: Tower[], gameMap: any[][]): boolean {
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  if (gridX < 0 || gridX >= gameMap[0].length || gridY < 0 || gridY >= gameMap.length) {
    return false;
  }

  const cell = gameMap[gridY][gridX];
  if (cell.type !== "BUILDABLE") {
    return false;
  }

  // Check if tower already exists at this position
  for (const tower of towers) {
    const towerGridX = Math.floor(tower.position.x / CELL_SIZE);
    const towerGridY = Math.floor(tower.position.y / CELL_SIZE);
    if (towerGridX === gridX && towerGridY === gridY) {
      return false;
    }
  }

  return true;
}
