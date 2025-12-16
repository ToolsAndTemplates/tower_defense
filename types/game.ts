export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  reward: number;
  type: EnemyType;
}

export enum EnemyType {
  BASIC = "BASIC",
  FAST = "FAST",
  TANK = "TANK",
  BOSS = "BOSS",
}

export interface Tower {
  id: string;
  position: Position;
  type: TowerType;
  range: number;
  damage: number;
  fireRate: number;
  lastFireTime: number;
  cost: number;
  targetId: string | null;
}

export enum TowerType {
  BASIC = "BASIC",
  SNIPER = "SNIPER",
  CANNON = "CANNON",
  LASER = "LASER",
}

export interface Projectile {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
  towerId: string;
}

export interface Wave {
  number: number;
  enemies: {
    type: EnemyType;
    count: number;
    spawnInterval: number;
  }[];
  completed: boolean;
}

export interface GameState {
  health: number;
  gold: number;
  wave: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  selectedTowerType: TowerType | null;
  gameStatus: GameStatus;
  score: number;
}

export enum GameStatus {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
  WON = "WON",
}

export interface Cell {
  x: number;
  y: number;
  type: CellType;
}

export enum CellType {
  PATH = "PATH",
  BUILDABLE = "BUILDABLE",
  START = "START",
  END = "END",
}

export interface TowerStats {
  type: TowerType;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  description: string;
  color: string;
}
