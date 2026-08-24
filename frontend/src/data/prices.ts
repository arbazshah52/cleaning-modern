import { serviceById } from './services';
import { zoneById } from './travelZones';

export const hourOptions = [2, 3, 4, 5, 6, 7, 8];

export const homeSizes = [
  'Under 50 m²',
  '50–75 m²',
  '76–100 m²',
  '101–150 m²',
  'Över 150 m²',
];

export const frequencies = ['Varje vecka', 'Varannan vecka', 'En gång i månaden', 'Endast en gång'];

export const startTimes = ['Morgon (08–10)', 'Förmiddag (10–12)', 'Eftermiddag (12–16)', 'Kväll (16–19)'];

export const invoiceOptions = ['E-faktura', 'Faktura via e-post', 'Pappersfaktura', 'Autogiro'];

export interface Quote {
  pricePerHour: number;
  labourCost: number;
  rutApplied: boolean;
  rutDiscount: number;
  travelFee: number;
  total: number;
}

export function calculateQuote(
  serviceId: string,
  hours: number,
  travelZoneId: string,
  rut: boolean
): Quote {
  const service = serviceById(serviceId);
  const zone = zoneById(travelZoneId);
  const pricePerHour = service?.pricePerHour ?? 0;
  const labourCost = pricePerHour * (hours || 0);
  const rutApplied = Boolean(rut && service?.rutEligible);
  const rutDiscount = rutApplied ? Math.round(labourCost * 0.5) : 0;
  const travelFee = zone?.fee ?? 0;
  return {
    pricePerHour,
    labourCost,
    rutApplied,
    rutDiscount,
    travelFee,
    total: labourCost - rutDiscount + travelFee,
  };
}

export const sek = (n: number) => `${n.toLocaleString('sv-SE')} SEK`;
