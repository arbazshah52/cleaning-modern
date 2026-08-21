export interface Faq {
  q: string;
  a: string;
}

// AEO: korta, direkta svar som svarsmotorer och röstassistenter kan citera.
export const faqs: Faq[] = [
  {
    q: 'Vad kostar hemstädning i Malmö?',
    a: 'Hemstädning hos Modernstäd.se kostar från 226 kr per timme inkl. moms, före RUT-avdrag. Väljer du fastpris räknar vi 25 kr per kvadratmeter plus 150 kr per rum, lägst 900 kr. En lägenhet på 72 m² med 3 rum kostar 2 250 kr, eller 1 125 kr efter RUT-avdrag.',
  },
  {
    q: 'Hur fungerar RUT-avdraget för städning?',
    a: 'Som privatperson får du 50 procent i RUT-avdrag på arbetskostnaden. Du anger bara ditt personnummer i bokningen – Modernstäd.se drar av avdraget direkt på fakturan och sköter all administration mot Skatteverket.',
  },
  {
    q: 'Kan jag få fastpris i stället för timpris?',
    a: 'Ja. Vår AI-prisagent Stella räknar fram ett fastpris utifrån bostadens kvadratmeter och antal rum, och kan ge upp till 10 procent rabatt. Du får priset direkt i chatten och kan boka på plats.',
  },
  {
    q: 'Vilka områden städar ni i?',
    a: 'Vi städar i Malmö, Arlöv, Limhamn, Lund, Staffanstorp, Bjärred, Kävlinge, Trelleborg och Ystad. Resekostnaden är 0 kr i centrala Malmö och därefter 49–199 kr beroende på zon.',
  },
  {
    q: 'Städar ni även kontor och företag?',
    a: 'Ja, vi erbjuder kontorsstädning, företagsstädning, regelbunden städning och specialstädning som bygg- och flyttstädning. Företagspriser börjar på 285 kr per timme, eller fastpris från 30 kr per kvadratmeter plus 200 kr per rum.',
  },
  {
    q: 'Hur bokar jag städning?',
    a: 'Du bokar på modernstad.se i åtta korta steg, eller direkt i chatten med vår AI-prisagent. Du får en bekräftelse med referensnummer på e-post, och vi kontaktar dig innan första städtillfället.',
  },
  {
    q: 'Använder ni miljövänliga städprodukter?',
    a: 'Ja, vi städar med miljömärkta och parfymfria produkter som är skonsamma för allergiker, barn och husdjur.',
  },
  {
    q: 'Kan jag avboka eller flytta min städning?',
    a: 'Ja, kontakta oss på arbazshah11@gmail.com eller 0736200637 senast 24 timmar innan bokad tid, då flyttar eller avbokar vi utan kostnad.',
  },
];
