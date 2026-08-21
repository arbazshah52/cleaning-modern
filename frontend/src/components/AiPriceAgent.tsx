import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '../lib/api';
import { sek } from '../data/prices';

type Msg = { role: 'user' | 'assistant'; content: string };

const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { id: 'gpt-5.5', label: 'GPT-5.5' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
];

const GREETING =
  'Hej! Jag är Stella, prisagent på Modernstäd.se. Berätta hur många kvadratmeter och rum du har – då räknar jag ut ett fastpris istället för timpris.';

export default function AiPriceAgent() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);
  const [customerType, setCustomerType] = useState<'privat' | 'foretag'>('privat');
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [price, setPrice] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [details, setDetails] = useState<any>({});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, price, booking]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, customerType, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'AI-agenten svarade inte');
      setSessionId(data.sessionId);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      if (data.price) setPrice(data.price);
      if (data.offer) setOffer(data.offer);
      if (data.details) setDetails((d: any) => ({ ...d, ...data.details }));
      setReady(Boolean(data.readyToBook));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!offer || !sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerType,
          serviceId: offer.serviceId,
          sqm: Number(offer.sqm),
          rooms: Number(offer.rooms),
          travelZoneId: offer.travelZoneId || 'central-malmo',
          rut: Boolean(offer.rut),
          discountPct: Number(offer.discountPct || 0),
          firstName: details.firstName,
          lastName: details.lastName,
          personalNumber: details.personalNumber || '',
          phone: details.phone,
          email: details.email,
          street: details.street,
          postalCode: details.postalCode,
          city: details.city,
          preferredDate: details.preferredDate,
          startTime: details.startTime || 'Förmiddag (10–12)',
          message: details.message || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const d = data?.detail;
        throw new Error(
          typeof d === 'string'
            ? d
            : `Bokningen kunde inte skapas (fel ${res.status}). Kontrollera uppgifterna i chatten.`
        );
      }
      setBooking(data);
      toast.success('Bokningen är bekräftad!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="ai-agent-toggle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-lift transition-colors duration-200 hover:bg-sky-deep"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? 'Stäng' : 'AI-prisagent'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            data-testid="ai-agent-panel"
            className="fixed bottom-24 right-3 z-[60] flex max-h-[76vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-4xl border border-line bg-white shadow-lift sm:right-5 sm:w-[26rem]"
          >
            <div className="border-b border-line bg-sky-soft px-5 py-4">
              <p className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
                <Sparkles className="h-4 w-4 text-sky" /> Stella – prisagent
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Fastpris på kvm & rum, förhandla upp till 10 % rabatt.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as any)}
                  data-testid="ai-customer-type"
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  <option value="privat">Privat</option>
                  <option value="foretag">Företag</option>
                </select>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  data-testid="ai-model-select"
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" data-testid="ai-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-sky text-white'
                      : 'bg-cream text-ink'
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {price && !booking && (
                <div className="rounded-2xl border border-mint/40 bg-mint-soft p-4 text-sm" data-testid="ai-price-card">
                  <p className="font-display font-bold text-ink">
                    Fastpris – {price.sqm} m², {price.rooms} rum
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-muted">
                    <div className="flex justify-between">
                      <span>Grundpris</span>
                      <span className="font-semibold text-ink">{sek(price.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rabatt ({price.discountPct} %)</span>
                      <span className="font-semibold text-ink">−{sek(price.negotiationDiscount)}</span>
                    </div>
                    {price.rutApplied && (
                      <div className="flex justify-between">
                        <span>RUT-avdrag</span>
                        <span className="font-semibold text-ink">−{sek(price.rutDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Resekostnad</span>
                      <span className="font-semibold text-ink">{sek(price.travelFee)}</span>
                    </div>
                  </div>
                  <p className="mt-3 flex items-baseline justify-between font-display">
                    <span className="text-sm font-bold text-ink">Att betala</span>
                    <span className="text-xl font-extrabold text-mint-dark" data-testid="ai-price-total">
                      {sek(price.total)}
                    </span>
                  </p>
                  {ready && (
                    <button
                      type="button"
                      onClick={confirm}
                      disabled={loading}
                      data-testid="ai-confirm-booking-btn"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-mint-dark disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Acceptera & boka
                    </button>
                  )}
                </div>
              )}

              {booking && (
                <div className="rounded-2xl border border-mint bg-white p-4 text-sm" data-testid="ai-booking-confirmed">
                  <p className="flex items-center gap-2 font-display font-bold text-mint-dark">
                    <CheckCircle2 className="h-4 w-4" /> Bokning bekräftad
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Referens{' '}
                    <strong className="text-ink" data-testid="ai-booking-reference">
                      {booking.reference}
                    </strong>{' '}
                    · {sek(booking.price.total)} ·{' '}
                    {booking.emailSent
                      ? `bekräftelse skickad till ${booking.email}`
                      : 'bekräftelse via e-post kunde inte skickas'}
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted" data-testid="ai-loading">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Stella skriver…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-line px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="T.ex. 3 rum, 72 m² i Malmö"
                data-testid="ai-input"
                className="field !py-2.5"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading}
                data-testid="ai-send-btn"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky text-white transition-colors duration-200 hover:bg-sky-deep disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
