import { useState } from "react";
import { X } from "lucide-react";
import ModelSelect from "./ModelSelect";
import Avatar from "../shared/Avatar";
import type { Agent, AgentCreate } from "../../types";
import { DEFAULT_PROVIDER, DEFAULT_MODEL, buildModelString } from "../../types";
import { PERSONA_PRESETS } from "../../types/personas";

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: AgentCreate) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function AgentForm({ agent, onSubmit, onCancel, isPending }: AgentFormProps) {
  const [name, setName] = useState(agent?.name ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt ?? "");
  const [model, setModel] = useState(agent?.model ?? buildModelString(DEFAULT_PROVIDER.id, DEFAULT_MODEL));
  const [selectedPresetId, setSelectedPresetId] = useState("");

  const selectedPreset = PERSONA_PRESETS.find((preset) => preset.id === selectedPresetId);

  const applyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PERSONA_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSystemPrompt(preset.systemPrompt);
    setModel(preset.modelPairing.quality);
    if (!name.trim()) {
      setName(preset.defaultAgentName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;
    onSubmit({
      name: name.trim(),
      system_prompt: systemPrompt.trim(),
      model,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-cosmic-card w-full max-w-lg rounded-xl border border-nebula-500/20 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-star-white">
            {agent ? "Edit Agent" : "Create Agent"}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-nebula-300 hover:bg-nebula-600/50 hover:text-star-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              Persona Template
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple"
            >
              <option value="">Custom (no preset)</option>
              {PERSONA_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} · {preset.category}
                </option>
              ))}
            </select>
            {selectedPreset && (
              <div className="mt-2 rounded-lg border border-nebula-500/30 bg-nebula-700/30 p-3">
                <p className="text-sm text-nebula-100">{selectedPreset.summary}</p>
                <p className="mt-1 text-xs text-nebula-300">Best for: {selectedPreset.bestFor}</p>
                <p className="mt-1 text-xs text-nebula-300">
                  Recommended models: {selectedPreset.modelPairing.quality} (quality) · {selectedPreset.modelPairing.fast} (fast)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              Name
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Philosopher Bot"
                className="flex-1 rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white placeholder-nebula-400 outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple"
                required
              />
              {name.trim() && <Avatar name={name.trim()} size="md" />}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a philosophical AI who..."
              rows={4}
              className="w-full rounded-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white placeholder-nebula-400 outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple resize-none"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-nebula-200">
              Model
            </label>
            <ModelSelect value={model} onChange={setModel} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-nebula-500/30 px-4 py-2 text-sm text-nebula-200 hover:bg-nebula-600/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80 transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : agent ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
