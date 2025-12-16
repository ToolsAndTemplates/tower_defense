import { useEffect, useRef } from "react";
import { GameState, CellType } from "@/types/game";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CELL_SIZE,
  GAME_MAP,
  TOWER_STATS,
  ENEMY_STATS,
} from "@/lib/constants";

interface GameCanvasProps {
  gameState: GameState;
  onCanvasClick: (x: number, y: number) => void;
}

export default function GameCanvas({ gameState, onCanvasClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid and path
    for (let y = 0; y < GAME_MAP.length; y++) {
      for (let x = 0; x < GAME_MAP[y].length; x++) {
        const cell = GAME_MAP[y][x];
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        // Draw cell background
        if (cell.type === CellType.PATH) {
          ctx.fillStyle = "#8B4513";
        } else if (cell.type === CellType.START) {
          ctx.fillStyle = "#4CAF50";
        } else if (cell.type === CellType.END) {
          ctx.fillStyle = "#F44336";
        } else {
          ctx.fillStyle = "#2d5016";
        }

        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        // Draw grid lines
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw tower ranges for placed towers
    gameState.towers.forEach((tower) => {
      ctx.beginPath();
      ctx.arc(
        tower.position.x,
        tower.position.y,
        tower.range * CELL_SIZE,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw placement preview
    if (gameState.selectedTowerType && mousePositionRef.current) {
      const gridX = Math.floor(mousePositionRef.current.x / CELL_SIZE);
      const gridY = Math.floor(mousePositionRef.current.y / CELL_SIZE);
      const px = gridX * CELL_SIZE;
      const py = gridY * CELL_SIZE;
      const centerX = px + CELL_SIZE / 2;
      const centerY = py + CELL_SIZE / 2;

      const towerStats = TOWER_STATS[gameState.selectedTowerType];

      // Draw range preview
      ctx.beginPath();
      ctx.arc(centerX, centerY, towerStats.range * CELL_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(74, 144, 226, 0.2)";
      ctx.fill();
      ctx.strokeStyle = "rgba(74, 144, 226, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw tower preview
      ctx.fillStyle = towerStats.color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(px + 4, py + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      ctx.globalAlpha = 1;
    }

    // Draw towers
    gameState.towers.forEach((tower) => {
      const towerStats = TOWER_STATS[tower.type];
      const size = CELL_SIZE - 8;
      const x = tower.position.x - size / 2;
      const y = tower.position.y - size / 2;

      // Tower body
      ctx.fillStyle = towerStats.color;
      ctx.fillRect(x, y, size, size);

      // Tower border
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size);

      // Draw targeting line
      if (tower.targetId) {
        const target = gameState.enemies.find((e) => e.id === tower.targetId);
        if (target) {
          ctx.beginPath();
          ctx.moveTo(tower.position.x, tower.position.y);
          ctx.lineTo(target.position.x, target.position.y);
          ctx.strokeStyle = "rgba(255, 255, 0, 0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    // Draw projectiles
    gameState.projectiles.forEach((projectile) => {
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD700";
      ctx.fill();
      ctx.strokeStyle = "#FFA500";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw enemies
    gameState.enemies.forEach((enemy) => {
      const enemyStats = ENEMY_STATS[enemy.type];
      const radius = 12;

      // Enemy body
      ctx.beginPath();
      ctx.arc(enemy.position.x, enemy.position.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = enemyStats.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Health bar
      const healthBarWidth = 24;
      const healthBarHeight = 4;
      const healthPercentage = enemy.health / enemy.maxHealth;

      ctx.fillStyle = "#000";
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - radius - 8,
        healthBarWidth,
        healthBarHeight
      );

      ctx.fillStyle = healthPercentage > 0.5 ? "#4CAF50" : healthPercentage > 0.25 ? "#FFC107" : "#F44336";
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - radius - 8,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    });
  }, [gameState]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePositionRef.current = { x, y };

    // Force re-render for preview
    if (gameState.selectedTowerType) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // This will trigger a re-render via the useEffect
        canvas.dispatchEvent(new Event("mousemove"));
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onCanvasClick(x, y);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-slate-600 rounded-xl cursor-crosshair bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl max-w-full h-auto"
        style={{
          maxWidth: '640px',
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated'
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}
