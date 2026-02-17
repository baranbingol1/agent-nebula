import { useNavigate } from "react-router-dom";
import { Users, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import Avatar from "../shared/Avatar";
import type { Room } from "../../types";

interface RoomCardProps {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-cosmic-card group cursor-pointer rounded-xl p-4 transition-all hover:border-cosmic-purple/30"
      onClick={() => navigate(`/rooms/${room.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-star-white truncate">
              {room.name}
            </h3>
            <StatusBadge status={room.status} />
          </div>
          {room.description && (
            <p className="mt-1 text-sm text-nebula-300 line-clamp-1">
              {room.description}
            </p>
          )}
        </div>
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-nebula-300 hover:bg-nebula-600/50 hover:text-star-white"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-nebula-300 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-nebula-400" />
          <span className="text-xs text-nebula-300">
            {room.agents.length} agent{room.agents.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex -space-x-2">
          {room.agents.slice(0, 4).map((ra) => (
            <Avatar key={ra.agent_id} name={ra.agent.name} size="sm" />
          ))}
          {room.agents.length > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nebula-600 border border-nebula-500/30 text-xs text-nebula-200">
              +{room.agents.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-nebula-400">
        Max turns: {room.max_turns} | Current: {room.current_turn_index}
      </div>
    </div>
  );
}
