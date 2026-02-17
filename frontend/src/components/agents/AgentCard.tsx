import { Pencil, Trash2 } from "lucide-react";
import Avatar from "../shared/Avatar";
import type { Agent } from "../../types";
import { displayModel } from "../../types";

interface AgentCardProps {
  agent: Agent;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  return (
    <div className="bg-cosmic-card group rounded-xl p-4 transition-all hover:border-cosmic-purple/30">
      <div className="flex items-start gap-3">
        <Avatar avatarId={agent.avatar_id} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-star-white truncate">
            {agent.name}
          </h3>
          <p className="mt-0.5 text-xs text-cosmic-purple">{displayModel(agent.model)}</p>
          <p className="mt-2 text-sm text-nebula-300 line-clamp-2">
            {agent.system_prompt}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}
