import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-nebula-400">{icon}</div>
      <h3 className="mb-2 text-lg font-medium text-star-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-nebula-300">{description}</p>
      {action}
    </div>
  );
}
