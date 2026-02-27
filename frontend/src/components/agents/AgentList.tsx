import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Bot } from "lucide-react";
import { agentsApi } from "../../api/agents";
import AgentCard from "./AgentCard";
import AgentForm from "./AgentForm";
import EmptyState from "../shared/EmptyState";
import ConfirmDialog from "../shared/ConfirmDialog";
import type { Agent, AgentCreate } from "../../types";

export default function AgentList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: agentsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: agentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgentCreate }) =>
      agentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setEditAgent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: agentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-purple border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-star-white">AI Agents</h2>
          <p className="mt-1 text-sm text-nebula-300">
            Create and manage your AI agents
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          icon={<Bot className="h-12 w-12" />}
          title="No agents yet"
          description="Create your first AI agent to start building conversations"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80"
            >
              Create Agent
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => setEditAgent(agent)}
              onDelete={() => setDeleteAgent(agent)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AgentForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editAgent && (
        <AgentForm
          agent={editAgent}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editAgent.id, data })
          }
          onCancel={() => setEditAgent(null)}
        />
      )}

      {deleteAgent && (
        <ConfirmDialog
          title="Delete Agent"
          message={`Are you sure you want to delete "${deleteAgent.name}"? This cannot be undone.`}
          onConfirm={() => {
            deleteMutation.mutate(deleteAgent.id);
            setDeleteAgent(null);
          }}
          onCancel={() => setDeleteAgent(null)}
        />
      )}
    </div>
  );
}
