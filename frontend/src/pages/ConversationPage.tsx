import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Settings } from "lucide-react";
import { roomsApi } from "../api/rooms";
import ConversationView from "../components/conversation/ConversationView";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: room, isLoading } = useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomsApi.get(id!),
    enabled: !!id,
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="flex items-center gap-1.5 text-sm text-nebula-300 hover:text-star-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-star-white">{room.name}</h2>
          <span className="text-xs text-nebula-400">
            {room.agents.length} agent{room.agents.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => navigate(`/rooms/${room.id}`)}
          className="flex items-center gap-1.5 rounded-lg border border-nebula-500/30 px-3 py-1.5 text-sm text-nebula-300 hover:bg-nebula-600/50"
        >
          <Settings className="h-4 w-4" />
          Room Setup
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ConversationView room={room} />
      </div>
    </div>
  );
}
