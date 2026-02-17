import Avatar from "../shared/Avatar";
import type { Message } from "../../types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = !message.agent_id;
  const name = message.agent_name ?? "User";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 mt-1">
        <Avatar name={name} size="sm" />
      </div>
      <div className={`max-w-[75%] min-w-0 ${isUser ? "items-end" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${isUser ? "text-cosmic-cyan" : "text-cosmic-purple"}`}>
            {name}
          </span>
          <span className="text-xs text-nebula-500">
            Turn {message.turn_number}
          </span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-cosmic-cyan/15 border border-cosmic-cyan/20 text-star-white"
              : "bg-nebula-700/50 border border-nebula-500/20 text-nebula-100"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
