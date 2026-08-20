export interface TravelZone {
  id: string;
  name: string;
  fee: number;
}

export const travelZones: TravelZone[] = [
  { id: 'central-malmo', name: 'Centrala Malmö', fee: 0 },
  { id: 'zone-1', name: 'Zon 1 – Arlöv, Limhamn', fee: 49 },
  { id: 'zone-2', name: 'Zon 2 – Lund, Staffanstorp', fee: 99 },
  { id: 'zone-3', name: 'Zon 3 – Bjärred, Kävlinge', fee: 149 },
  { id: 'zone-4', name: 'Zon 4 – Trelleborg, Ystad', fee: 199 },
];

export const zoneById = (id: string) => travelZones.find((z) => z.id === id);
