import { PROVIDERS, parseModelString, buildModelString } from "../../types";

interface ModelSelectProps {
  value: string;
  onChange: (model: string) => void;
}

export default function ModelSelect({ value, onChange }: ModelSelectProps) {
  const { providerId, model } = parseModelString(value);
  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];

  function handleProviderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newProvider = PROVIDERS.find((p) => p.id === e.target.value) ?? PROVIDERS[0];
    onChange(buildModelString(newProvider.id, model));
  }

  function handleModelChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(buildModelString(provider.id, e.target.value));
  }

  return (
    <div>
      <div className="flex">
        <select
          value={provider.id}
          onChange={handleProviderChange}
          className="rounded-l-lg border border-r-0 border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={model}
          onChange={handleModelChange}
          placeholder={provider.placeholder}
          className="flex-1 rounded-r-lg border border-nebula-500/30 bg-nebula-700/50 px-3 py-2 text-sm text-star-white placeholder-nebula-400 outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple"
        />
      </div>
      <p className="mt-1.5 text-[11px] text-nebula-400">
        {provider.examples}
      </p>
    </div>
  );
}
