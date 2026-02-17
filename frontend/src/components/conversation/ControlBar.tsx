import { Play, Pause, Square, RotateCcw } from "lucide-react";

interface ControlBarProps {
  status: string;
  currentTurn: number;
  maxTurns: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function ControlBar({
  status,
  currentTurn,
  maxTurns,
  onStart,
  onPause,
  onResume,
  onStop,
}: ControlBarProps) {
  const progress = maxTurns > 0 ? (currentTurn / maxTurns) * 100 : 0;

  return (
    <div className="border-b border-nebula-600/30 bg-nebula-800/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(status === "idle" || status === "stopped") && (
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-lg bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
            >
              <Play className="h-4 w-4" />
              {status === "stopped" ? "Restart" : "Start"}
            </button>
          )}
          {status === "running" && (
            <>
              <button
                onClick={onPause}
                className="flex items-center gap-2 rounded-lg bg-yellow-500/20 px-3 py-1.5 text-sm font-medium text-yellow-400 hover:bg-yellow-500/30 transition-colors border border-yellow-500/30"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
              >
                <Square className="h-4 w-4" />
                Stop
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button
                onClick={onResume}
                className="flex items-center gap-2 rounded-lg bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
              >
                <RotateCcw className="h-4 w-4" />
                Resume
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
              >
                <Square className="h-4 w-4" />
                Stop
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-nebula-300">
            Turn {currentTurn} / {maxTurns}
          </span>
          <div className="w-32 h-1.5 rounded-full bg-nebula-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-blue transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
