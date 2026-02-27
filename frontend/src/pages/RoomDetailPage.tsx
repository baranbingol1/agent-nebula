import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Play, Settings } from "lucide-react";
import { roomsApi } from "../api/rooms";
import { useToastStore } from "../stores/toastStore";
import AgentAssignment from "../components/rooms/AgentAssignment";
import StatusBadge from "../components/shared/StatusBadge";
import { useState } from "react";
import RoomForm from "../components/rooms/RoomForm";
import type { RoomCreate } from "../types";

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [showEdit, setShowEdit] = useState(false);

  const { data: room, isLoading } = useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomsApi.get(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: RoomCreate) => roomsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", id] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setShowEdit(false);
      addToast("success", "Room updated");
    },
    onError: () => addToast("error", "Failed to update room"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-purple border-t-transparent" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-nebula-300">Room not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/rooms")}
          className="flex items-center gap-1.5 text-sm text-nebula-300 hover:text-star-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-star-white">{room.name}</h2>
              <StatusBadge status={room.status} />
            </div>
            {room.description && (
              <p className="mt-1 text-sm text-nebula-300">{room.description}</p>
            )}
            <p className="mt-1 text-xs text-nebula-400">
              Max turns: {room.max_turns} | Current turn: {room.current_turn_index}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 rounded-lg border border-nebula-500/30 px-3 py-1.5 text-sm text-nebula-200 hover:bg-nebula-600/50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <Link
              to={`/rooms/${room.id}/conversation`}
              className="flex items-center gap-2 rounded-lg bg-cosmic-purple px-4 py-1.5 text-sm font-medium text-white hover:bg-cosmic-purple/80 transition-colors"
            >
              <Play className="h-4 w-4" />
              Open Conversation
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-cosmic-card rounded-xl border border-nebula-500/20 p-5">
        <AgentAssignment room={room} />
      </div>

      {showEdit && (
        <RoomForm
          room={room}
          onSubmit={(data) => updateMutation.mutate(data)}
          onCancel={() => setShowEdit(false)}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}
