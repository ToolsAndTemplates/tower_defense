import { TowerType, TowerStats, EnemyType, CellType, Cell } from "@/types/game";

export const GRID_SIZE = 20;
export const CELL_SIZE = 32;
export const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

export const INITIAL_HEALTH = 20;
export const INITIAL_GOLD = 200;

export const TOWER_STATS: Record<TowerType, TowerStats> = {
  [TowerType.BASIC]: {
    type: TowerType.BASIC,
    name: "Basic Tower",
    cost: 50,
    damage: 10,
    range: 3,
    fireRate: 1000,
    description: "A basic tower with balanced stats",
    color: "#4A90E2",
  },
  [TowerType.SNIPER]: {
    type: TowerType.SNIPER,
    name: "Sniper Tower",
    cost: 100,
    damage: 40,
    range: 6,
    fireRate: 2000,
    description: "Long range, high damage, slow fire rate",
    color: "#50C878",
  },
  [TowerType.CANNON]: {
    type: TowerType.CANNON,
    name: "Cannon Tower",
    cost: 80,
    damage: 25,
    range: 4,
    fireRate: 1500,
    description: "Heavy hitting tower with moderate range",
    color: "#E74C3C",
  },
  [TowerType.LASER]: {
    type: TowerType.LASER,
    name: "Laser Tower",
    cost: 120,
    damage: 8,
    range: 5,
    fireRate: 300,
    description: "Rapid fire laser with continuous damage",
    color: "#9B59B6",
  },
};

export const ENEMY_STATS = {
  [EnemyType.BASIC]: {
    health: 50,
    speed: 1,
    reward: 10,
    color: "#FF6B6B",
  },
  [EnemyType.FAST]: {
    health: 30,
    speed: 2,
    reward: 15,
    color: "#FFD93D",
  },
  [EnemyType.TANK]: {
    health: 150,
    speed: 0.5,
    reward: 25,
    color: "#6BCB77",
  },
  [EnemyType.BOSS]: {
    health: 500,
    speed: 0.3,
    reward: 100,
    color: "#9B59B6",
  },
};

// Define the path that enemies will follow (snake pattern)
export const GAME_MAP: Cell[][] = [
  ...Array(GRID_SIZE).fill(null).map((_, y) =>
    Array(GRID_SIZE).fill(null).map((_, x) => {
      // Create a snake-like path
      let isPath = false;

      // Row 2
      if (y === 2 && x >= 0 && x <= 14) isPath = true;
      // Column 14
      if (x === 14 && y >= 2 && y <= 6) isPath = true;
      // Row 6
      if (y === 6 && x >= 5 && x <= 14) isPath = true;
      // Column 5
      if (x === 5 && y >= 6 && y <= 10) isPath = true;
      // Row 10
      if (y === 10 && x >= 5 && x <= 17) isPath = true;
      // Column 17
      if (x === 17 && y >= 10 && y <= 14) isPath = true;
      // Row 14
      if (y === 14 && x >= 2 && x <= 17) isPath = true;
      // Column 2
      if (x === 2 && y >= 14 && y <= 18) isPath = true;
      // Row 18 (to end)
      if (y === 18 && x >= 2 && x <= 10) isPath = true;

      let type = CellType.BUILDABLE;
      if (isPath) type = CellType.PATH;
      if (y === 2 && x === 0) type = CellType.START;
      if (y === 18 && x === 10) type = CellType.END;

      return { x, y, type };
    })
  )
];

// Calculate path positions for enemy movement
export const PATH_POSITIONS: { x: number; y: number }[] = [];

// Helper function to add path positions
const addPathSegment = (startX: number, startY: number, endX: number, endY: number) => {
  if (startX === endX) {
    // Vertical line
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    for (let y = minY; y <= maxY; y++) {
      PATH_POSITIONS.push({ x: startX, y });
    }
  } else {
    // Horizontal line
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    for (let x = minX; x <= maxX; x++) {
      PATH_POSITIONS.push({ x, y: startY });
    }
  }
};

// Build the path
addPathSegment(0, 2, 14, 2);
addPathSegment(14, 2, 14, 6);
addPathSegment(14, 6, 5, 6);
addPathSegment(5, 6, 5, 10);
addPathSegment(5, 10, 17, 10);
addPathSegment(17, 10, 17, 14);
addPathSegment(17, 14, 2, 14);
addPathSegment(2, 14, 2, 18);
addPathSegment(2, 18, 10, 18);
