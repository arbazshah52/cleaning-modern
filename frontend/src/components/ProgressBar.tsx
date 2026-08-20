import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  steps: string[];
  current: number;
}

export default function ProgressBar({ steps, current }: Props) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div data-testid="progress-bar">
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-mint"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <ol className="flex flex-wrap gap-x-5 gap-y-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={label}
              data-testid={`progress-step-${i + 1}`}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors duration-300 ${
                active ? 'text-mint' : done ? 'text-ink' : 'text-gray-400'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                  active
                    ? 'bg-mint text-white'
                    : done
                      ? 'bg-mint-soft text-mint-dark'
                      : 'bg-line text-gray-500'
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : String(i + 1).padStart(2, '0')}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
