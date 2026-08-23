import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatMsg } from '../../hooks/useAiAgent';
import { AiPriceCard, AiBookingConfirmed } from './AiPriceCard';

interface Props {
  messages: ChatMsg[];
  price: any;
  booking: any;
  ready: boolean;
  loading: boolean;
  onConfirm: () => void;
}

export default function ChatMessages({ messages, price, booking, ready, loading, onConfirm }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, price, booking, loading]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" data-testid="ai-messages">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
            m.role === 'user' ? 'ml-auto bg-sky text-white' : 'bg-cream text-ink'
          }`}
        >
          {m.content}
        </div>
      ))}

      {price && !booking && (
        <AiPriceCard price={price} ready={ready} loading={loading} onConfirm={onConfirm} />
      )}
      {booking && <AiBookingConfirmed booking={booking} />}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted" data-testid="ai-loading">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Stella skriver…
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
