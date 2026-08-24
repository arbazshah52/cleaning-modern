import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { API } from '../lib/api';

export type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string };
export type CustomerType = 'privat' | 'foretag';

export const AI_MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { id: 'gpt-5.5', label: 'GPT-5.5' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
];

const GREETING =
  'Hej! Jag är Stella, prisagent på Modernstäd.se. Berätta hur många kvadratmeter och rum du har – då räknar jag ut ett fastpris istället för timpris.';

const newId = () => Math.random().toString(36).slice(2, 10);

const errorFrom = (data: any, status: number, fallback: string) =>
  typeof data?.detail === 'string' ? data.detail : `${fallback} (fel ${status})`;

const REQUIRED_DETAILS = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'street',
  'postalCode',
  'city',
  'preferredDate',
];

const detailsComplete = (details: Record<string, string>) =>
  REQUIRED_DETAILS.every((k) => Boolean(details[k]));

export function useAiAgent() {
  const [model, setModel] = useState(AI_MODELS[0].id);
  const [customerType, setCustomerType] = useState<CustomerType>('privat');
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'greeting', role: 'assistant', content: GREETING },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [price, setPrice] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const send = useCallback(
    async (text: string) => {
      setMessages((m) => [...m, { id: newId(), role: 'user', content: text }]);
      setLoading(true);
      try {
        const res = await fetch(`${API}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: text, customerType, model }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(errorFrom(data, res.status, 'AI-agenten svarade inte'));
        setSessionId(data.sessionId);
        setMessages((m) => [...m, { id: newId(), role: 'assistant', content: data.reply }]);
        if (data.price) setPrice(data.price);
        if (data.offer) setOffer(data.offer);
        if (data.details) setDetails((d) => ({ ...d, ...data.details }));
        setReady(Boolean(data.readyToBook));
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [customerType, model, sessionId]
  );

  const confirm = useCallback(async () => {
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          errorFrom(data, res.status, 'Bokningen kunde inte skapas – komplettera uppgifterna')
        );
      }
      setBooking(data);
      toast.success('Bokningen är bekräftad!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [customerType, details, offer, sessionId]);

  return {
    model,
    setModel,
    customerType,
    setCustomerType,
    messages,
    price,
    ready: ready && detailsComplete(details),
    loading,
    booking,
    send,
    confirm,
  };
}
