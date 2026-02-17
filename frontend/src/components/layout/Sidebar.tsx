import { NavLink } from "react-router-dom";
import { MessageSquare, Bot, Sparkles } from "lucide-react";

const navItems = [
  { to: "/rooms", icon: MessageSquare, label: "Rooms" },
  { to: "/agents", icon: Bot, label: "Agents" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-60 flex-col border-r border-nebula-600/30 bg-nebula-800/50">
      <div className="flex items-center gap-2 px-5 py-5">
        <Sparkles className="h-6 w-6 text-cosmic-purple" />
        <h1 className="text-lg font-bold tracking-wide text-star-white glow-text">
          Agent Nebula
        </h1>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-cosmic-purple/20 text-cosmic-purple glow-purple"
                  : "text-nebula-200 hover:bg-nebula-700/50 hover:text-star-white"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-nebula-600/30 p-4">
        <p className="text-xs text-nebula-400">Multi-Agent Simulator</p>
      </div>
    </aside>
  );
}
