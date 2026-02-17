import { AVATARS } from "../../avatars";

interface AvatarPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all ${
            value === avatar.id
              ? "bg-cosmic-purple/30 ring-2 ring-cosmic-purple scale-110"
              : "bg-nebula-700/40 hover:bg-nebula-600/50"
          }`}
          title={avatar.label}
        >
          {avatar.emoji}
        </button>
      ))}
    </div>
  );
}
