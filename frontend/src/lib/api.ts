const BASE = import.meta.env.REACT_APP_BACKEND_URL as string;
export const API = `${BASE}/api`;

export async function createBooking(payload: Record<string, unknown>) {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as any)?.detail;
    throw new Error(
      typeof detail === 'string' ? detail : 'Något gick fel när bokningen skulle skickas.'
    );
  }
  return data;
}
