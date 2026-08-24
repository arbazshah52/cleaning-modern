export type CustomerType = 'privat' | 'foretag';

export interface Service {
  id: string;
  customerType: CustomerType;
  name: string;
  pricePerHour: number;
  minimumHours: number;
  rutEligible: boolean;
  description: string;
  days: string;
}

export const services: Service[] = [
  {
    id: 'hemstadning',
    customerType: 'privat',
    name: 'Hemstädning',
    pricePerHour: 226,
    minimumHours: 3,
    rutEligible: true,
    description: 'Regelbunden städning av ditt hem – kök, badrum, damning och golv.',
    days: 'Mån–Fre',
  },
  {
    id: 'allman-stadning',
    customerType: 'privat',
    name: 'Allmän städning',
    pricePerHour: 236,
    minimumHours: 3,
    rutEligible: true,
    description: 'Flexibel städning efter dina önskemål och egen checklista.',
    days: 'Mån–Lör',
  },
  {
    id: 'engangsstadning',
    customerType: 'privat',
    name: 'Engångsstädning',
    pricePerHour: 289,
    minimumHours: 4,
    rutEligible: true,
    description: 'En djupare städning vid ett enskilt tillfälle, t.ex. inför gäster.',
    days: 'Mån–Lör',
  },
  {
    id: 'aterkommande-stadning',
    customerType: 'privat',
    name: 'Återkommande städning',
    pricePerHour: 226,
    minimumHours: 3,
    rutEligible: true,
    description: 'Fast tid varje vecka eller varannan vecka med samma städare.',
    days: 'Mån–Fre',
  },
  {
    id: 'kontorsstadning',
    customerType: 'foretag',
    name: 'Kontorsstädning',
    pricePerHour: 295,
    minimumHours: 2,
    rutEligible: false,
    description: 'Daglig eller veckovis städning av kontor och mötesrum.',
    days: 'Mån–Fre',
  },
  {
    id: 'foretagsstadning',
    customerType: 'foretag',
    name: 'Företagsstädning',
    pricePerHour: 315,
    minimumHours: 3,
    rutEligible: false,
    description: 'Anpassad städning för butik, lokal eller verksamhet.',
    days: 'Mån–Lör',
  },
  {
    id: 'regelbunden-stadning',
    customerType: 'foretag',
    name: 'Regelbunden städning',
    pricePerHour: 285,
    minimumHours: 2,
    rutEligible: false,
    description: 'Löpande avtal med fasta tider och samma personal.',
    days: 'Mån–Fre',
  },
  {
    id: 'specialstadning',
    customerType: 'foretag',
    name: 'Specialstädning',
    pricePerHour: 345,
    minimumHours: 4,
    rutEligible: false,
    description: 'Bygg-, flytt- och fönsterstädning samt andra specialuppdrag.',
    days: 'Mån–Sön',
  },
];

export const servicesFor = (type: CustomerType) => services.filter((s) => s.customerType === type);
export const serviceById = (id: string) => services.find((s) => s.id === id);
