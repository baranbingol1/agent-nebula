import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/rooms": "Rooms",
  "/agents": "Agents",
};

export default function Header() {
  const location = useLocation();
  const title =
    titles[location.pathname] ??
    (location.pathname.includes("/conversation")
      ? "Conversation"
      : location.pathname.includes("/rooms/")
        ? "Room Setup"
        : "Agent Nebula");

  return (
    <header className="flex h-14 items-center border-b border-nebula-600/30 bg-nebula-800/30 px-6">
      <h2 className="text-base font-semibold text-star-white">{title}</h2>
    </header>
  );
}
