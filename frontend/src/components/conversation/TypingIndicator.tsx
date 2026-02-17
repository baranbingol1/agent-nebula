import Avatar from "../shared/Avatar";

interface TypingIndicatorProps {
  agentName: string;
}

export default function TypingIndicator({ agentName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Avatar name={agentName} size="sm" />
      <div className="flex items-center gap-1.5 rounded-2xl bg-nebula-700/50 border border-nebula-500/20 px-4 py-2.5">
        <span className="text-xs text-nebula-300 mr-2">{agentName} is thinking</span>
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-cosmic-purple" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-cosmic-purple" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-cosmic-purple" />
      </div>
    </div>
  );
}
