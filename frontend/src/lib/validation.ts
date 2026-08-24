import { z } from 'zod';

const req = (msg: string) => z.string().trim().min(1, msg);

export const bookingSchema = z.object({
  firstName: req('Ange förnamn'),
  lastName: req('Ange efternamn'),
  personalNumber: req('Ange personnummer').regex(
    /^\d{6,8}[- ]?\d{4}$/,
    'Ange personnummer som ÅÅMMDD-XXXX'
  ),
  phone: req('Ange mobilnummer').regex(/^[+0-9 ()-]{6,20}$/, 'Ange ett giltigt mobilnummer'),
  email: req('Ange e-post').email('Ange en giltig e-postadress'),

  street: req('Ange gatuadress'),
  city: req('Ange stad'),
  postalCode: req('Ange postnummer').regex(/^\d{3}\s?\d{2}$/, 'Ange postnummer som 211 34'),
  floor: z.string().optional(),
  doorCode: z.string().optional(),

  rut: z.enum(['ja', 'nej'], { message: 'Välj ja eller nej' }),

  serviceId: req('Välj erbjudande'),
  hours: z.coerce.number().min(1, 'Välj antal timmar'),
  homeSize: req('Välj storlek'),
  frequency: req('Välj hur ofta'),
  startTime: req('Välj starttid'),

  preferredDate: req('Välj önskat datum'),
  alternativeDate: z.string().optional(),

  travelZoneId: req('Välj resezon'),
  invoiceOption: req('Välj faktureringsalternativ'),

  message: z.string().max(2000).optional(),
  contactPreference: z.string().optional(),
  termsAccepted: z.literal(true, { message: 'Du måste godkänna villkoren' }),
  captcha: req('Svara på kontrollfrågan'),
});

export type BookingForm = z.input<typeof bookingSchema>;

export const stepFields: (keyof BookingForm)[][] = [
  ['firstName', 'lastName', 'personalNumber', 'phone', 'email'],
  ['street', 'city', 'postalCode', 'floor', 'doorCode'],
  ['rut'],
  ['serviceId', 'hours', 'homeSize', 'frequency', 'startTime'],
  ['preferredDate', 'alternativeDate'],
  ['travelZoneId', 'invoiceOption'],
  ['message', 'contactPreference', 'termsAccepted', 'captcha'],
  [],
];
