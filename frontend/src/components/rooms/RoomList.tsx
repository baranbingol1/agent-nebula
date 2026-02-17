import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquare } from "lucide-react";
import { roomsApi } from "../../api/rooms";
import RoomCard from "./RoomCard";
import RoomForm from "./RoomForm";
import EmptyState from "../shared/EmptyState";
import type { Room, RoomCreate } from "../../types";

export default function RoomList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomCreate }) =>
      roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setEditRoom(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
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
          <h2 className="text-xl font-bold text-star-white">Rooms</h2>
          <p className="mt-1 text-sm text-nebula-300">
            Create rooms and watch your agents converse
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No rooms yet"
          description="Create a room to start multi-agent conversations"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80"
            >
              Create Room
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => setEditRoom(room)}
              onDelete={() => {
                if (confirm(`Delete room "${room.name}"?`)) {
                  deleteMutation.mutate(room.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <RoomForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editRoom && (
        <RoomForm
          room={editRoom}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editRoom.id, data })
          }
          onCancel={() => setEditRoom(null)}
        />
      )}
    </div>
  );
}
