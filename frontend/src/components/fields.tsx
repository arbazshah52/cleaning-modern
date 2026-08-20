import { ReactNode } from 'react';

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="err">{error}</span>}
    </label>
  );
}

export function StepHeader({ index, title, subtitle }: { index: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky">Steg {index}</p>
      <h3 className="font-display text-2xl font-extrabold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

export function OptionCards({
  options,
  value,
  onChange,
  testid,
}: {
  options: { value: string; label: string; sub?: string }[];
  value?: string;
  onChange: (v: string) => void;
  testid: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            data-testid={`${testid}-${o.value}`}
            onClick={() => onChange(o.value)}
            className={`rounded-2xl border p-4 text-left transition-colors duration-200 ${
              active ? 'border-mint bg-mint-soft ring-2 ring-mint/20' : 'border-line bg-white hover:border-sky/50'
            }`}
          >
            <span className="block text-sm font-semibold text-ink">{o.label}</span>
            {o.sub && <span className="mt-0.5 block text-xs text-muted">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
