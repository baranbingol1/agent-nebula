const statusStyles: Record<string, string> = {
  idle: "bg-nebula-600/50 text-nebula-200",
  running: "bg-green-500/20 text-green-400 border-green-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  stopped: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? statusStyles.idle
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "running"
            ? "bg-green-400 animate-pulse"
            : status === "paused"
              ? "bg-yellow-400"
              : status === "stopped"
                ? "bg-red-400"
                : "bg-nebula-400"
        }`}
      />
      {status}
    </span>
  );
}
