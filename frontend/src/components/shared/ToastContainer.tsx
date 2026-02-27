import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToastStore, type Toast } from "../../stores/toastStore";

const icons: Record<Toast["type"], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors: Record<Toast["type"], string> = {
  success: "border-green-500/40 bg-green-500/15 text-green-200",
  error: "border-red-500/40 bg-red-500/15 text-red-200",
  info: "border-cosmic-cyan/40 bg-cosmic-cyan/15 text-cosmic-cyan",
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm animate-slide-in ${colors[t.type]}`}
          >
            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="hover:opacity-70 flex-shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}