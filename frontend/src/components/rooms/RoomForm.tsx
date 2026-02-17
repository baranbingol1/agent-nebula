import { useState } from "react";
import { X } from "lucide-react";
import type { Room, RoomCreate } from "../../types";

interface RoomFormProps {
  room?: Room;
  onSubmit: (data: RoomCreate) => void;
  onCancel: () => void;
}

export default function RoomForm({ room, onSubmit, onCancel }: RoomFormProps) {
  const [name, setName] = useState(room?.name ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [maxTurns, setMaxTurns] = useState(room?.max_turns ?? 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      max_turns: maxTurns,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-cosmic-card w-full max-w-md rounded-xl border border-nebula-500/20 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-star-white">
            {room ? "Edit Room" : "Create Room"}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-nebula-300 hover:bg-nebula-600/50 hover:text-star-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Philosophy Debate"
              className="w-full rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white placeholder-nebula-400 outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A room for philosophical debate..."
              rows={3}
              className="w-full rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white placeholder-nebula-400 outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              Max Turns
            </label>
            <input
              type="number"
              value={maxTurns}
              onChange={(e) => setMaxTurns(Number(e.target.value))}
              min={1}
              max={500}
              className="w-full rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple"
            />
            <p className="mt-1 text-xs text-nebula-400">
              Conversation auto-stops after this many turns
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-nebula-500/30 px-4 py-2 text-sm text-nebula-200 hover:bg-nebula-600/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80 transition-colors"
            >
              {room ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
