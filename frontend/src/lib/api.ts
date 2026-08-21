const BASE = import.meta.env.REACT_APP_BACKEND_URL as string;
export const API = `${BASE}/api`;

function detailToMessage(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    const first: any = detail[0];
    const field = Array.isArray(first?.loc) ? first.loc[first.loc.length - 1] : '';
    return `${field ? `${field}: ` : ''}${first?.msg || fallback}`;
  }
  return fallback;
}

export async function createBooking(payload: Record<string, unknown>) {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      detailToMessage(
        (data as any)?.detail,
        `Bokningen kunde inte skickas (fel ${res.status}). Försök igen eller ring 0736200637.`
      )
    );
  }
  return data;
}
