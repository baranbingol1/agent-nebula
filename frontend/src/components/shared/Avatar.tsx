import { getAvatar } from "../../avatars";

interface AvatarProps {
  avatarId: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-8 h-8 text-lg",
  md: "w-10 h-10 text-xl",
  lg: "w-14 h-14 text-3xl",
};

export default function Avatar({ avatarId, size = "md" }: AvatarProps) {
  const avatar = getAvatar(avatarId);
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-nebula-700/60 border border-nebula-500/30 ${sizes[size]}`}
    >
      <span>{avatar.emoji}</span>
    </div>
  );
}
