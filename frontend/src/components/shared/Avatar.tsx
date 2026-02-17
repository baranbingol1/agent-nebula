import { generateIdenticon } from "../../lib/identicon";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const pixelSizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

const cssSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

export default function Avatar({ name, size = "md" }: AvatarProps) {
  const svg = generateIdenticon(name, pixelSizes[size]);
  return (
    <div
      className={`flex-shrink-0 rounded-full overflow-hidden ${cssSizes[size]}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
