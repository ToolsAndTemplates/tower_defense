import { GameState, GameStatus, TowerType } from "@/types/game";
import { TOWER_STATS } from "@/lib/constants";

interface GameUIProps {
  gameState: GameState;
  onTowerSelect: (towerType: TowerType | null) => void;
  onPause: () => void;
  onRestart: () => void;
}

export default function GameUI({
  gameState,
  onTowerSelect,
  onPause,
  onRestart,
}: GameUIProps) {
  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-3 md:p-4 mb-3 md:mb-4 shadow-lg border border-slate-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 md:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
              <span className="text-red-400 text-xl">❤️</span>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Health</span>
                <span className="text-white font-bold text-lg">{gameState.health}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
              <span className="text-yellow-400 text-xl">💰</span>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Gold</span>
                <span className="text-white font-bold text-lg">{gameState.gold}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
              <span className="text-blue-400 text-xl">🌊</span>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Wave</span>
                <span className="text-white font-bold text-lg">{gameState.wave}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
              <span className="text-purple-400 text-xl">⭐</span>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Score</span>
                <span className="text-white font-bold text-lg">{gameState.score}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onPause}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {gameState.gameStatus === GameStatus.PAUSED ? "▶️ Resume" : "⏸️ Pause"}
            </button>
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              🔄 Restart
            </button>
          </div>
        </div>
      </div>

      {/* Tower Shop */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-3 md:p-4 shadow-lg border border-slate-600">
        <h3 className="text-white font-bold mb-3 text-lg md:text-xl flex items-center gap-2">
          <span className="text-2xl">🏰</span>
          Tower Shop
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(TOWER_STATS).map((tower) => {
            const canAfford = gameState.gold >= tower.cost;
            const isSelected = gameState.selectedTowerType === tower.type;

            return (
              <button
                key={tower.type}
                onClick={() => onTowerSelect(isSelected ? null : tower.type)}
                disabled={!canAfford}
                className={`p-3 md:p-4 rounded-xl transition-all transform hover:scale-105 ${
                  isSelected
                    ? "ring-4 ring-yellow-400 bg-gradient-to-br from-slate-600 to-slate-500 shadow-xl scale-105"
                    : canAfford
                    ? "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-md"
                    : "bg-gradient-to-br from-slate-800 to-slate-900 opacity-50 cursor-not-allowed"
                }`}
                style={{
                  borderLeft: `6px solid ${tower.color}`,
                }}
              >
                <div className="text-left">
                  <div className="font-bold text-white text-sm md:text-base mb-1 flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tower.color }}></div>
                    {tower.name}
                  </div>
                  <div className="text-yellow-400 text-sm font-bold mb-2 flex items-center gap-1">
                    <span>💰</span>
                    <span>{tower.cost}</span>
                    <span className="text-xs text-gray-400">gold</span>
                  </div>
                  <div className="text-gray-300 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>⚔️ Damage:</span>
                      <span className="font-semibold text-white">{tower.damage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🎯 Range:</span>
                      <span className="font-semibold text-white">{tower.range}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚡ Rate:</span>
                      <span className="font-semibold text-white">{(1000 / tower.fireRate).toFixed(1)}/s</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {gameState.selectedTowerType && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700/30 animate-pulse">
            <p className="text-blue-200 text-sm md:text-base text-center font-semibold">
              👆 Click on a green tile to place your tower
            </p>
          </div>
        )}
      </div>

      {/* Game Over Overlay */}
      {gameState.gameStatus === GameStatus.GAME_OVER && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-10 rounded-2xl text-center max-w-md w-full shadow-2xl border-4 border-red-500/50 animate-fadeIn">
            <div className="text-6xl md:text-7xl mb-4 animate-bounce">💀</div>
            <h2 className="text-4xl md:text-5xl font-bold text-red-500 mb-4 drop-shadow-lg">Game Over!</h2>
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-white text-2xl md:text-3xl mb-2 font-bold">
                <span className="text-purple-400">⭐</span> {gameState.score}
              </p>
              <p className="text-gray-400 text-sm md:text-base">Final Score</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-white text-xl md:text-2xl mb-1 font-bold">
                <span className="text-blue-400">🌊</span> {gameState.wave - 1}
              </p>
              <p className="text-gray-400 text-sm md:text-base">Waves Survived</p>
            </div>
            <button
              onClick={onRestart}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg md:text-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {gameState.gameStatus === GameStatus.PAUSED && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-10 rounded-2xl text-center shadow-2xl border-4 border-yellow-500/50 animate-fadeIn">
            <div className="text-6xl md:text-7xl mb-4">⏸️</div>
            <h2 className="text-4xl md:text-5xl font-bold text-yellow-500 mb-6 drop-shadow-lg">Paused</h2>
            <button
              onClick={onPause}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg md:text-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ▶️ Resume Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
