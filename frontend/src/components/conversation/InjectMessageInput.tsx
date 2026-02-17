import { useState } from "react";
import { Send } from "lucide-react";

interface InjectMessageInputProps {
  disabled: boolean;
  onInject: (content: string) => void;
}

export default function InjectMessageInput({
  disabled,
  onInject,
}: InjectMessageInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    onInject(content.trim());
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-nebula-600/30 bg-nebula-800/50 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            disabled
              ? "Start the simulation to inject messages..."
              : "Inject a message into the conversation..."
          }
          disabled={disabled}
          className="flex-1 rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-4 py-2 text-sm text-star-white placeholder-nebula-400 outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="flex items-center justify-center rounded-lg bg-cosmic-purple p-2 text-white hover:bg-cosmic-purple/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
