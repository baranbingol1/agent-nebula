import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, GripVertical } from "lucide-react";
import { agentsApi } from "../../api/agents";
import { roomsApi } from "../../api/rooms";
import Avatar from "../shared/Avatar";
import type { Room } from "../../types";
import { displayModel } from "../../types";

interface AgentAssignmentProps {
  room: Room;
}

export default function AgentAssignment({ room }: AgentAssignmentProps) {
  const queryClient = useQueryClient();

  const { data: allAgents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: agentsApi.list,
  });

  const addMutation = useMutation({
    mutationFn: (agentId: string) => roomsApi.addAgent(room.id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", room.id] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (agentId: string) => roomsApi.removeAgent(room.id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", room.id] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const assignedIds = new Set(room.agents.map((ra) => ra.agent_id));
  const unassigned = allAgents.filter((a) => !assignedIds.has(a.id));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-nebula-200 uppercase tracking-wider">
        Assigned Agents ({room.agents.length})
      </h3>

      {room.agents.length === 0 ? (
        <p className="text-sm text-nebula-400 py-4">
          No agents assigned. Add agents to start a conversation.
        </p>
      ) : (
        <div className="space-y-2">
          {room.agents.map((ra, i) => (
            <div
              key={ra.agent_id}
              className="flex items-center gap-3 rounded-lg bg-nebula-700/30 border border-nebula-500/20 px-3 py-2.5"
            >
              <GripVertical className="h-4 w-4 text-nebula-500 cursor-grab" />
              <span className="text-xs font-mono text-nebula-400 w-4">
                {i + 1}
              </span>
              <Avatar avatarId={ra.agent.avatar_id} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-star-white truncate">
                  {ra.agent.name}
                </p>
                <p className="text-xs text-nebula-400">
                  {displayModel(ra.agent.model)}
                </p>
              </div>
              <button
                onClick={() => removeMutation.mutate(ra.agent_id)}
                className="rounded-lg p-1 text-nebula-400 hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {unassigned.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-semibold text-nebula-200 uppercase tracking-wider">
            Available Agents
          </h3>
          <div className="space-y-2">
            {unassigned.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 rounded-lg bg-nebula-800/50 border border-nebula-600/20 px-3 py-2.5"
              >
                <Avatar avatarId={agent.avatar_id} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-nebula-200 truncate">
                    {agent.name}
                  </p>
                </div>
                <button
                  onClick={() => addMutation.mutate(agent.id)}
                  className="flex items-center gap-1 rounded-lg bg-cosmic-purple/20 px-2.5 py-1 text-xs font-medium text-cosmic-purple hover:bg-cosmic-purple/30"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
