export interface Review {
  id: string;
  name: string;
  city: string;
  service: string;
  rating: number;
  date: string;
  text: string;
}

// DEMOINNEHÅLL: påhittade exempelomdömen för designen – byt till riktiga kundomdömen före lansering.
export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Sofia Lindqvist',
    city: 'Malmö',
    service: 'Hemstädning',
    rating: 5,
    date: '2026-05-18',
    text: 'Fantastiskt noggrant jobb och samma städare varje gång. Köket har aldrig varit så rent, och RUT-avdraget skötte de helt själva.',
  },
  {
    id: 'r2',
    name: 'Johan Persson',
    city: 'Lund',
    service: 'Återkommande städning',
    rating: 5,
    date: '2026-05-02',
    text: 'Bokade via AI-agenten och fick ett fastpris direkt utifrån kvadratmeter och rum. Otroligt smidigt jämfört med timpris.',
  },
  {
    id: 'r3',
    name: 'Amina Yusuf',
    city: 'Arlöv',
    service: 'Engångsstädning',
    rating: 5,
    date: '2026-04-27',
    text: 'Behövde hjälp inför middag med gäster. De kom med kort varsel och lämnade lägenheten skinande ren.',
  },
  {
    id: 'r4',
    name: 'Erik Nilsson',
    city: 'Trelleborg',
    service: 'Allmän städning',
    rating: 4,
    date: '2026-04-11',
    text: 'Mycket bra städning och trevlig personal. Kom tio minuter sent första gången, annars felfritt.',
  },
  {
    id: 'r5',
    name: 'Camilla Berg',
    city: 'Bjärred',
    service: 'Hemstädning',
    rating: 5,
    date: '2026-03-29',
    text: 'Miljövänliga produkter som inte luktar starkt – perfekt för oss med allergi i familjen.',
  },
  {
    id: 'r6',
    name: 'Nordbygg Fastigheter AB',
    city: 'Malmö',
    service: 'Kontorsstädning',
    rating: 5,
    date: '2026-03-14',
    text: 'Städar vårt kontor tre gånger i veckan. Alltid samma team, tydlig faktura och lätt att nå på telefon.',
  },
  {
    id: 'r7',
    name: 'Mikael Ohlsson',
    city: 'Staffanstorp',
    service: 'Specialstädning',
    rating: 5,
    date: '2026-02-25',
    text: 'Byggstädning efter renovering av vår lokal. De tog hand om allt, även fönster och ventiler.',
  },
  {
    id: 'r8',
    name: 'Linnéa Ek',
    city: 'Malmö',
    service: 'Återkommande städning',
    rating: 5,
    date: '2026-02-08',
    text: 'Prisvärt, punktligt och alltid samma höga kvalitet. Bokningen tog två minuter på mobilen.',
  },
  {
    id: 'r9',
    name: 'Café Vinter & Co',
    city: 'Lund',
    service: 'Företagsstädning',
    rating: 4,
    date: '2026-01-21',
    text: 'Snabb start på avtalet och flexibla tider efter stängning. Önskar bara fler tider på söndagar.',
  },
];

export const reviewStats = () => {
  const total = reviews.length;
  const average = reviews.reduce((s, r) => s + r.rating, 0) / total;
  return { total, average: Math.round(average * 10) / 10 };
};
