// @ts-nocheck
// CleaningTurntable — animated, draggable hero illustration for Modernstäd.se.
// Pure React + SVG, no extra dependencies. Drop into frontend/src/components/.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const Easing = {
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const animate = ({ from, to, start, end, ease }) => (T) => from + (to - from) * ease(clamp((T - start) / (end - start), 0, 1));

// variant: 'all' (home page) | 'privat' (home cleaning) | 'foretag' (office cleaning)
const VARIANT_SCENES = {
  all: [['Opening', 3], ['Chair', 3], ['Table', 3], ['Floor', 3.5], ['Mirror', 3.5], ['Home', 3.5], ['Office', 4.5], ['Close', 3]],
  privat: [['Opening', 3], ['Chair', 3], ['Table', 3], ['Floor', 3.5], ['Mirror', 3.5], ['Home', 4], ['Close', 3]],
  foretag: [['Opening', 3], ['Chair', 3], ['Table', 3], ['Floor', 3.5], ['Office', 5], ['Close', 3]],
};
const TIMELINES = {};
Object.entries(VARIANT_SCENES).forEach(([v, list]) => {
  const cues = {}; let total = 0;
  list.forEach(([n, d]) => { cues[n] = total; total += d; });
  TIMELINES[v] = { cues, total, names: list.map(([n]) => n) };
});

const K = {
  ink: '#1F2937', muted: '#4B5563', cream: '#FAFAFA', line: '#E5E7EB',
  skySoft: '#E0F2FE', sky: '#3B82F6', skyDeep: '#1E3A8A', skyLite: '#93C5FD', skyPale: '#BFDBFE',
  mint: '#10B981', mintDark: '#059669', mintSoft: '#ECFDF5', mintLite: '#A7F3D0',
  coral: '#FB7185', amber: '#FBBF24', amberDeep: '#F59E0B', wood: '#E0A15E', woodLite: '#F2C48D',
  lav: '#A78BFA', brick: '#E07A5F', white: '#FFFFFF', walls: '#FFF4DE', stone: '#A8A29E', slate: '#CBD5E1',
};
const FD = '"Outfit", system-ui, sans-serif';
const FS = '"Manrope", system-ui, sans-serif';
const W = 1080, H = 1080;

const MOTION = {
  enter: (a, b) => (T) => clamp(animate({ from: 0, to: 1, start: a, end: b, ease: Easing.easeOutCubic })(T), 0, 1),
  glide: (a, b) => (T) => clamp(animate({ from: 0, to: 1, start: a, end: b, ease: Easing.easeInOutCubic })(T), 0, 1),
  pop: (a, b) => (T) => (T <= a ? 0 : T >= b ? 1 : animate({ from: 0, to: 1, start: a, end: b, ease: Easing.easeOutBack })(T)),
};

// ---------- color ----------
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const SHADOW = hx(K.skyDeep), DUST = hx(K.stone), WHITE = hx(K.white);
const dusty = (c) => mixc(mixc(c, DUST, 0.78), WHITE, 0.12);

// ---------- geometry (convex parts with outward faces) ----------
const avg = (pts) => { const s = [0, 0, 0]; pts.forEach((p) => { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; }); return s.map((v) => v / pts.length); };
function part(faces, color, opts = {}) {
  const all = faces.flat(), c = avg(all);
  const minY = Math.min(...all.map((p) => p[1]));
  const cols = Array.isArray(color) ? color : faces.map(() => color);
  const F = faces.map((pts, i) => {
    const [a, b, d] = pts, u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const fc = avg(pts), L = Math.hypot(...n) || 1; n = n.map((x) => x / L);
    if (n[0] * (fc[0] - c[0]) + n[1] * (fc[1] - c[1]) + n[2] * (fc[2] - c[2]) < 0) n = n.map((x) => -x);
    return { pts, n, cy: fc[1], col: hx(cols[i]) };
  });
  return { F, c, minY, base: [c[0], minY, c[2]], decals: (opts.decals || []).map((d) => ({ ...d, col: d.color ? hx(d.color) : null })), op: opts.op ?? 1, floor: !!opts.floor, ns: !!opts.noStroke };
}
function boxF(x0, y0, z0, x1, y1, z1) {
  const v = [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
  return [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].map((f) => f.map((i) => v[i]));
}
const B = (x0, y0, z0, x1, y1, z1, color, opts) => part(boxF(x0, y0, z0, x1, y1, z1), color, opts);
const qz = (x0, x1, y0, y1, z) => [[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]];
const qx = (z0, z1, y0, y1, x) => [[x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0]];

function chair() {
  const P = [];
  [[-0.42,-0.42],[0.42,-0.42],[-0.42,0.42],[0.42,0.42]].forEach(([x, z]) => P.push(B(x-0.05, 0, z-0.05, x+0.05, 0.85, z+0.05, K.wood)));
  [-0.42, 0.42].forEach((x) => P.push(B(x-0.035, 0.27, -0.38, x+0.035, 0.33, 0.38, K.wood)));
  P.push(B(-0.5, 0.85, -0.5, 0.5, 1.04, 0.5, K.coral));
  [-0.42, 0.42].forEach((x) => P.push(B(x-0.05, 1.04, -0.48, x+0.05, 2.0, -0.38, K.wood)));
  [-0.2, 0, 0.2].forEach((x) => P.push(B(x-0.04, 1.04, -0.46, x+0.04, 1.74, -0.4, K.woodLite)));
  P.push(B(-0.52, 1.74, -0.5, 0.52, 2.0, -0.36, K.wood));
  return P;
}
function table() {
  const P = [];
  [[-1,-0.5],[1,-0.5],[-1,0.5],[1,0.5]].forEach(([x, z]) => P.push(B(x-0.07, 0, z-0.07, x+0.07, 1.3, z+0.07, K.mint)));
  P.push(B(-1.05, 1.3, -0.55, 1.05, 1.45, 0.55, K.mintDark));
  P.push(B(-1.2, 1.45, -0.7, 1.2, 1.56, 0.7, K.woodLite));
  P.push(B(-0.14, 1.56, -0.14, 0.14, 1.9, 0.14, K.coral));
  P.push(B(-0.24, 1.9, -0.2, 0.08, 2.18, 0.12, K.mint), B(-0.02, 1.95, -0.08, 0.26, 2.3, 0.2, K.mintLite));
  P.push(B(0.55, 1.56, 0.1, 0.85, 1.66, 0.4, K.amber));
  return P;
}
const LANES = [-1.2, 0, 1.2];
function mopU(x, z) { const li = z < -0.6 ? 0 : z < 0.6 ? 1 : 2; const f = li % 2 === 0 ? (x + 1.8) / 3.6 : (1.8 - x) / 3.6; return (li + f) / 3; }
function mopPos(u) {
  const lp = clamp(u, 0, 1) * 3, li = Math.min(2, Math.floor(lp)), f = lp - li, dir = li % 2 === 0 ? 1 : -1;
  const x = dir > 0 ? -1.8 + f * 3.6 : 1.8 - f * 3.6;
  let z = LANES[li]; if (f > 0.92 && li < 2) z += (LANES[li + 1] - LANES[li]) * ((f - 0.92) / 0.08);
  return { x, z, tilt: dir * Math.min(1, Math.min(f, 1 - f) * 10) };
}
function floorM() {
  const P = [], n = 6, t = 0.6, g = 0.02;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x0 = -1.8 + i * t, z0 = -1.8 + j * t;
    const p = B(x0 + g, 0, z0 + g, x0 + t - g, 0.1, z0 + t - g, (i + j) % 2 ? K.wood : K.woodLite, { floor: true });
    p.u = mopU(x0 + t / 2, z0 + t / 2); P.push(p);
  }
  return P;
}
function mirror() {
  const P = [];
  [-0.62, 0.62].forEach((x) => P.push(B(x - 0.1, 0, -0.45, x + 0.1, 0.18, 0.45, K.wood)));
  P.push(B(-0.82, 0.18, -0.11, 0.82, 3.02, -0.05, K.wood));
  const n = 10, y0 = 0.36, y1 = 2.84, h = (y1 - y0) / n;
  for (let i = 0; i < n; i++) P.push(B(-0.66, y0 + i * h, -0.05, 0.66, y0 + (i + 1) * h, 0.03, i % 2 ? K.skyLite : '#A5CFFC', { noStroke: true }));
  P.push(B(-0.82, 0.18, -0.05, -0.66, 3.02, 0.08, K.coral), B(0.66, 0.18, -0.05, 0.82, 3.02, 0.08, K.coral));
  P.push(B(-0.66, 0.18, -0.05, 0.66, 0.36, 0.08, K.coral), B(-0.66, 2.84, -0.05, 0.66, 3.02, 0.08, K.coral));
  return P;
}
function house() {
  const P = [];
  P.push(B(-2.45, -0.1, -1.95, 2.45, 0, 2.35, K.mintLite, { floor: true }));
  const win = (pts, n) => [{ pts, n, color: K.skyLite }];
  const d = [];
  d.push({ pts: qz(-0.36, 0.36, 0, 1.3, 1.52), n: [0,0,1], color: K.mint });
  [[-1.6,-0.8],[0.8,1.6]].forEach(([a, b]) => { d.push(...win(qz(a, b, 0.8, 1.5, 1.52), [0,0,1]), ...win(qz(a, b, 0.8, 1.5, -1.52), [0,0,-1])); });
  d.push(...win(qx(-0.5, 0.5, 0.8, 1.5, 2.02), [1,0,0]), ...win(qx(-0.5, 0.5, 0.8, 1.5, -2.02), [-1,0,0]));
  P.push(B(-2, 0, -1.5, 2, 2, 1.5, K.walls, { decals: d }));
  const e0 = [-2.2,1.9,-1.75], e1 = [2.2,1.9,-1.75], e2 = [2.2,1.9,1.75], e3 = [-2.2,1.9,1.75], r0 = [-2.2,3.2,0], r1 = [2.2,3.2,0];
  P.push(part([[e0,e1,e2,e3],[e0,e1,r1,r0],[e3,e2,r1,r0],[e0,e3,r0],[e1,e2,r1]], [K.walls, K.coral, K.coral, K.walls, K.walls]));
  P.push(B(1.0, 2.6, -0.95, 1.4, 3.5, -0.55, K.brick));
  P.push(B(-0.55, 0, 1.5, 0.55, 0.1, 2.1, K.slate));
  P.push(B(-2.3, 0, 1.75, -1.75, 0.5, 2.25, K.mint), B(1.75, 0, 1.75, 2.3, 0.42, 2.25, K.mintDark));
  return P;
}
function office() {
  const P = [];
  P.push(B(-4, -0.12, -3, 4, 0, 3, K.woodLite, { floor: true }));
  P.push(B(-4, 0, -3, 4, 0.7, -2.86, K.skyLite), B(-4, 0, -2.86, -3.86, 0.7, 3, K.skyLite));
  const glass = { op: 0.55 };
  P.push(B(-3.86, 0, -0.88, -2.4, 0.7, -0.78, K.skyPale, glass), B(-1.6, 0, -0.88, -1.2, 0.7, -0.78, K.skyPale, glass), B(-1.26, 0, -2.86, -1.16, 0.7, -0.88, K.skyPale, glass));
  P.push(B(-2.6, 0, -1.9, -2.5, 0.55, -1.8, K.ink), B(-3.1, 0.55, -2.3, -2.0, 0.62, -1.4, K.amber));
  const chairO = (cx, cz, dz, dx, col) => {
    P.push(B(cx-0.16, 0, cz-0.16, cx+0.16, 0.04, cz+0.16, K.ink), B(cx-0.03, 0.04, cz-0.03, cx+0.03, 0.36, cz+0.03, K.ink));
    P.push(B(cx-0.2, 0.36, cz-0.2, cx+0.2, 0.44, cz+0.2, col));
    if (dz) P.push(B(cx-0.2, 0.44, cz + (dz > 0 ? 0.14 : -0.2), cx+0.2, 0.9, cz + (dz > 0 ? 0.2 : -0.14), col));
    else P.push(B(cx + (dx > 0 ? 0.14 : -0.2), 0.44, cz-0.2, cx + (dx > 0 ? 0.2 : -0.14), 0.9, cz+0.2, col));
  };
  chairO(-2.55, -2.62, -1, 0, K.coral); chairO(-2.55, -1.08, 1, 0, K.coral); chairO(-3.42, -1.85, 0, -1, K.coral); chairO(-1.68, -1.85, 0, 1, K.coral);
  const desk = (cx, cz, face, col) => {
    [cx-0.55, cx+0.55].forEach((x) => P.push(B(x-0.03, 0, cz-0.3, x+0.03, 0.6, cz+0.3, K.sky)));
    P.push(B(cx-0.6, 0.6, cz-0.35, cx+0.6, 0.66, cz+0.35, K.white));
    const mz = cz - face * 0.22;
    P.push(B(cx-0.03, 0.66, mz-0.03, cx+0.03, 0.72, mz+0.03, K.ink), B(cx-0.28, 0.72, mz-0.03, cx+0.28, 1.0, mz+0.03, K.ink));
    chairO(cx, cz + face * 0.62, face, 0, col);
  };
  [0.6, 2.4].forEach((cx, i) => { desk(cx, -1.95, -1, i ? K.mint : K.amber); desk(cx, -1.2, 1, i ? K.amber : K.mint); desk(cx, 0.95, -1, i ? K.mint : K.lav); desk(cx, 1.7, 1, i ? K.lav : K.mint); });
  P.push(B(-3.6, 0, 1.7, -2.0, 0.35, 2.5, K.lav), B(-3.6, 0.35, 2.32, -2.0, 0.75, 2.5, K.lav));
  P.push(B(-3.75, 0, 1.7, -3.6, 0.55, 2.5, K.lav), B(-2.0, 0, 1.7, -1.85, 0.55, 2.5, K.lav));
  P.push(B(-3.2, 0, 0.6, -2.4, 0.28, 1.1, K.wood));
  [[3.5, 2.5], [-0.6, -2.5]].forEach(([x, z]) => P.push(B(x-0.18, 0, z-0.18, x+0.18, 0.35, z+0.18, K.coral), B(x-0.28, 0.35, z-0.28, x+0.28, 0.95, z+0.28, K.mint)));
  return P;
}

function prep(parts, s, sparks, foot, info) {
  const order = parts.map((p, i) => i).sort((a, b) => (parts[a].floor ? -1 : 0) - (parts[b].floor ? -1 : 0) || parts[a].minY - parts[b].minY);
  const b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 };
  parts.forEach((p) => p.F.forEach((f) => f.pts.forEach(([x, y, z]) => {
    b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x); b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y); b.z0 = Math.min(b.z0, z); b.z1 = Math.max(b.z1, z);
  })));
  let seed = parts.length * 97 + 13; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dust = Array.from({ length: 16 }, () => [b.x0 - 0.2 + rnd() * (b.x1 - b.x0 + 0.4), b.y0 + 0.1 + rnd() * (b.y1 - b.y0), b.z0 - 0.2 + rnd() * (b.z1 - b.z0 + 0.4), rnd()]);
  const rank = []; order.forEach((pi, r) => (rank[pi] = r));
  return { parts, rank, s, sparks, foot, info, b, dust };
}
const COPY = {
  sv: {
    right: 'Privat & Företag', kick0: 'Städning i Malmö', t0a: 'Rent hem.', t0b: 'Mer tid för dig.',
    dusty: 'Dammigt', cleaning: 'Städar…', clean: 'Skinande rent',
    Chair: ['01 / 06 — Möbler', 'Stolar', 'Sits, ben och ryggstöd – från alla håll.'],
    Table: ['02 / 06 — Ytor', 'Bord', 'Skivor, kanter och undersidan.'],
    Floor: ['03 / 06 — Golv', 'Golv', 'Dammsugning och moppning, kant till kant.'],
    Mirror: ['04 / 06 — Speglar', 'Speglar', 'Blanka och helt utan ränder.'],
    Home: ['05 / 06 — Hemstädning', 'Hem', 'Varje rum, från tak till golv.'],
    Office: ['06 / 06 — Företag', 'Kontor', 'Hela kontoret, skrivbord för skrivbord.'],
    c1: 'Privat eller företag', c2: 'Boka din städning', cta: 'Boka nu →', url: 'modernstad.se',
  },
  en: {
    right: 'Home & Business', kick0: 'Cleaning in Malmö', t0a: 'A clean home.', t0b: 'More time for you.',
    dusty: 'Dusty', cleaning: 'Cleaning…', clean: 'Spotless',
    Chair: ['01 / 06 — Furniture', 'Chairs', 'Seats, frames and legs. Every side.'],
    Table: ['02 / 06 — Surfaces', 'Tables', 'Tops, edges and underneath too.'],
    Floor: ['03 / 06 — Floors', 'Floors', 'Vacuumed and mopped, edge to edge.'],
    Mirror: ['04 / 06 — Mirrors', 'Mirrors', 'Streak-free shine, edge to edge.'],
    Home: ['05 / 06 — Home cleaning', 'Homes', 'Every room, top to bottom.'],
    Office: ['06 / 06 — Business', 'Offices', 'The whole floor, desk by desk.'],
    c1: 'Home or office', c2: 'Book your clean', cta: 'Book now →', url: 'modernstad.se',
  },
};
const MODELS = {
  Chair: prep(chair(), 205, [[0.52,2,-0.43],[-0.5,1.04,0.5],[0.42,0.3,0.42]], 0.75),
  Table: prep(table(), 190, [[-1.2,1.56,0.7],[1.2,1.56,-0.7],[0.1,2.3,0.1]], 1.3),
  Floor: Object.assign(prep(floorM(), 112, [[-1.2,0.1,-1.2],[0.6,0.1,0.6],[1.5,0.1,-0.9],[-0.9,0.1,1.2]], 2.6), { mode: 'mop' }),
  Mirror: Object.assign(prep(mirror(), 108, [[0.66,2.84,0.08],[-0.4,2.2,0.04],[0.3,1.0,0.04]], 0.95), { mode: 'squeegee' }),
  Home: prep(house(), 96, [[-2.2,3.2,0],[2,2,1.5],[1.2,3.5,-0.75],[-2,1.5,-1.5]], 2.9),
  Office: prep(office(), 64, [[2.4,1.0,-1.95],[-2.55,0.62,-1.85],[-4,0.7,-3],[4,0,3],[3.5,0.95,2.5]], 4.6),
};
const ORDER = ['Chair', 'Table', 'Floor', 'Mirror', 'Home', 'Office'];
const CAM_P = { Chair: 24, Table: 28, Floor: 40, Mirror: 24, Home: 26, Office: 38, Close: 24 };
const CAM_Y = { Chair: 700, Table: 690, Floor: 660, Mirror: 700, Home: 700, Office: 630, Close: 700 };
const VARIANT_COPY = {
  privat: {
    sv: { right: 'Privat', kick0: 'Hemstädning i Malmö', c1: 'Hemstädning', c2: 'Boka städning', Home: ['Hemstädning', 'Hem', 'Varje rum, från tak till golv.'] },
    en: { right: 'Private', kick0: 'Home cleaning in Malmö', c1: 'Home cleaning', c2: 'Book your clean', Home: ['Home cleaning', 'Homes', 'Every room, top to bottom.'] },
  },
  foretag: {
    sv: { right: 'Företag', kick0: 'Kontorsstädning i Malmö', t0a: 'Rent kontor.', t0b: 'Mer fokus på jobbet.', c1: 'Kontorsstädning', c2: 'Boka städning',
      Chair: ['Möbler', 'Kontorsstolar', 'Sits, ben och ryggstöd – från alla håll.'], Table: ['Ytor', 'Skrivbord', 'Skivor, kanter och undersidan.'],
      Floor: ['Golv', 'Golv', 'Dammsugning och moppning, kant till kant.'], Office: ['Kontorsstädning', 'Kontor', 'Hela kontoret, skrivbord för skrivbord.'] },
    en: { right: 'Business', kick0: 'Office cleaning in Malmö', t0a: 'A clean office.', t0b: 'More focus on work.', c1: 'Office cleaning', c2: 'Book your clean',
      Chair: ['Furniture', 'Office chairs', 'Seats, frames and legs. Every side.'], Table: ['Surfaces', 'Desks', 'Tops, edges and underneath too.'],
      Floor: ['Floors', 'Floors', 'Vacuumed and mopped, edge to edge.'], Office: ['Office cleaning', 'Offices', 'The whole floor, desk by desk.'] },
  },
};

// ---------- camera ----------
function mkCam(aDeg, pDeg, s, cx, cy) {
  const a = aDeg * Math.PI / 180, p = pDeg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(p), sp = Math.sin(p);
  const rot = (q) => [q[0] * ca + q[2] * sa, q[1], -q[0] * sa + q[2] * ca];
  const proj = (q) => { const r = rot(q); return [cx + s * r[0], cy - s * (r[1] * cp - r[2] * sp), r[1] * sp + r[2] * cp]; };
  return { rot, proj, sp, cp };
}
const LIGHT = (() => { const l = [-0.45, 0.78, 0.45], n = Math.hypot(...l); return l.map((x) => x / n); })();

function Solid({ m, cam, T, t0, t1, o0, o1, hs, keyP, cleanOf, extra, extraK }) {
  const N = m.parts.length, items = [];
  m.parts.forEach((pt, i) => {
    const r = m.rank[i], st = t0 + (t1 - t0) * 0.75 * (r / N), so = o0 + (o1 - o0) * 0.7 * ((N - 1 - r) / N);
    const k = MOTION.pop(st, st + (t1 - t0) * 0.25 + 0.12)(T) * (1 - MOTION.glide(so, so + (o1 - o0) * 0.3 + 0.08)(T));
    if (k <= 0.002) return;
    const tp = (q) => cam.proj([pt.base[0] + (q[0] - pt.base[0]) * k, pt.base[1] + (q[1] - pt.base[1]) * k, pt.base[2] + (q[2] - pt.base[2]) * k]);
    items.push({ pt, i, k, tp, d: (pt.floor ? -1e6 : 0) + cam.proj(pt.c)[2] });
  });
  if (extra && extraK > 0.002) extra.forEach((pt, i) => {
    const k = extraK, tp = (q) => cam.proj([pt.base[0] + (q[0] - pt.base[0]) * k, pt.base[1] + (q[1] - pt.base[1]) * k, pt.base[2] + (q[2] - pt.base[2]) * k]);
    items.push({ pt, i: 'x' + i, k, tp, d: cam.proj(pt.c)[2] });
  });
  items.sort((a, b) => a.d - b.d);
  const out = [];
  const shade = (col, n, cy, pt) => {
    const r = cam.rot(n), lit = Math.max(0, r[0] * LIGHT[0] + r[1] * LIGHT[1] + r[2] * LIGHT[2]);
    const kc = pt.always ? 1 : cleanOf ? cleanOf(pt) : clamp((cy - hs) / 0.35 + 0.5, 0, 1);
    return css(mixc(mixc(dusty(col), col, kc), SHADOW, (1 - lit) * 0.42));
  };
  const faces = (n) => { const r = cam.rot(n); return r[1] * cam.sp + r[2] * cam.cp > 0.02; };
  items.forEach(({ pt, i, tp }) => {
    pt.F.forEach((f, j) => {
      if (!faces(f.n)) return;
      out.push(<polygon key={keyP + i + 'f' + j} points={f.pts.map((q) => { const p = tp(q); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ')}
        fill={shade(f.col, f.n, f.cy, pt)} fillOpacity={pt.op} stroke={pt.ns ? 'none' : K.ink} strokeOpacity={0.75} strokeWidth={1.4} strokeLinejoin="round" />);
    });
    pt.decals.forEach((dc, j) => {
      if (!faces(dc.n)) return;
      const cy = avg(dc.pts)[1];
      out.push(<polygon key={keyP + i + 'd' + j} points={dc.pts.map((q) => { const p = tp(q); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ')}
        fill={shade(dc.col, dc.n, cy, pt)} stroke={K.ink} strokeOpacity={0.75} strokeWidth={1.3} strokeLinejoin="round" />);
    });
  });
  return <g>{out}</g>;
}

// ---------- cleaner character ----------
const SKIN = '#F2C29B', HAIR = '#4A2C2A';
const nrm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function limb(p0, p1, w, color) {
  const a = nrm([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
  const u = nrm(crs(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = crs(a, u), h = w / 2;
  const c = (p, su, sv) => [p[0] + (u[0] * su + v[0] * sv) * h, p[1] + (u[1] * su + v[1] * sv) * h, p[2] + (u[2] * su + v[2] * sv) * h];
  const A = [c(p0, -1, -1), c(p0, 1, -1), c(p0, 1, 1), c(p0, -1, 1)], Bq = [c(p1, -1, -1), c(p1, 1, -1), c(p1, 1, 1), c(p1, -1, 1)];
  return part([A, Bq, [A[0], A[1], Bq[1], Bq[0]], [A[1], A[2], Bq[2], Bq[1]], [A[2], A[3], Bq[3], Bq[2]], [A[3], A[0], Bq[0], Bq[3]]], color);
}
const addv = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];
function arm(P, sh, dir, len) {
  const d = nrm(dir), el = addv(sh, d, len * 0.34), hand = addv(sh, d, len);
  P.push(limb(sh, el, 0.21, K.mint), limb(el, hand, 0.15, SKIN));
  return hand;
}
function girlParts(T, work, cheer, bob) {
  const P = [], y0 = bob;
  [-0.16, 0.16].forEach((x) => { P.push(B(x - 0.1, y0 + 0.12, -0.09, x + 0.1, y0 + 1.08, 0.09, K.skyDeep)); P.push(B(x - 0.12, y0, -0.12, x + 0.12, y0 + 0.14, 0.24, K.white)); });
  P.push(B(-0.44, y0 + 1.02, -0.28, 0.44, y0 + 1.5, 0.3, K.mintDark, { decals: [{ pts: qz(-0.26, 0.26, y0 + 1.05, y0 + 1.48, 0.31), n: [0, 0, 1], color: K.white }] }));
  P.push(B(-0.35, y0 + 1.46, -0.2, 0.35, y0 + 2.38, 0.22, K.mint, { decals: [{ pts: qz(-0.22, 0.22, y0 + 1.5, y0 + 2.1, 0.23), n: [0, 0, 1], color: K.white }] }));
  P.push(B(-0.09, y0 + 2.36, -0.07, 0.09, y0 + 2.48, 0.09, SKIN));
  const hz = 0.305, face = [
    { pts: qz(-0.19, -0.08, y0 + 2.74, y0 + 2.86, hz), n: [0, 0, 1], color: K.ink },
    { pts: qz(0.08, 0.19, y0 + 2.74, y0 + 2.86, hz), n: [0, 0, 1], color: K.ink },
    { pts: qz(-0.09, 0.09, y0 + 2.58, y0 + 2.63, hz), n: [0, 0, 1], color: K.coral },
    { pts: qz(-0.3, -0.2, y0 + 2.62, y0 + 2.7, hz), n: [0, 0, 1], color: '#F9A8A8' },
    { pts: qz(0.2, 0.3, y0 + 2.62, y0 + 2.7, hz), n: [0, 0, 1], color: '#F9A8A8' },
  ];
  P.push(B(-0.3, y0 + 2.46, -0.28, 0.3, y0 + 3.04, 0.3, SKIN, { decals: face }));
  P.push(B(-0.33, y0 + 2.94, -0.33, 0.33, y0 + 3.2, 0.33, HAIR), B(-0.33, y0 + 2.5, -0.33, 0.33, y0 + 2.94, -0.2, HAIR));
  P.push(B(-0.33, y0 + 2.7, -0.2, -0.29, y0 + 2.94, 0.26, HAIR), B(0.29, y0 + 2.7, -0.2, 0.33, y0 + 2.94, 0.26, HAIR));
  P.push(B(-0.34, y0 + 3.02, -0.34, 0.34, y0 + 3.1, 0.34, K.coral));
  const sw = 0.25 * Math.sin(T * 7);
  P.push(B(-0.08, y0 + 2.62 + sw * 0.1, -0.62, 0.08, y0 + 3.0, -0.33, HAIR), B(-0.1, y0 + 2.9, -0.4, 0.1, y0 + 3.02, -0.32, K.coral));
  // work arm (local -x, toward the object)
  const wig = Math.sin(T * 11), wav = Math.sin(T * 13);
  const idleD = [-0.18, -1, 0.12], workD = [-0.25 + 0.35 * wig, 0.55 + 0.35 * Math.cos(T * 11), 1], cheerD = [-0.35 + 0.35 * wav, 1, 0.15];
  const wd = idleD.map((v, i) => v + (workD[i] - v) * work + (cheerD[i] - v) * cheer * (1 - work));
  const hand = arm(P, [-0.44, y0 + 2.3, 0], wd, 1.05);
  P.push(B(hand[0] - 0.13, hand[1] - 0.1, hand[2] - 0.13, hand[0] + 0.13, hand[1] + 0.1, hand[2] + 0.13, K.amber));
  // bottle arm
  const bd = [0.2, -0.55 + 0.5 * work, 0.8];
  const bh = arm(P, [0.44, y0 + 2.3, 0], bd, 0.8);
  P.push(B(bh[0] - 0.1, bh[1] - 0.05, bh[2] - 0.1, bh[0] + 0.1, bh[1] + 0.34, bh[2] + 0.1, K.sky), B(bh[0] - 0.06, bh[1] + 0.34, bh[2] - 0.05, bh[0] + 0.06, bh[1] + 0.44, bh[2] + 0.12, K.white));
  return { P, nozzle: [bh[0], bh[1] + 0.4, bh[2] + 0.14] };
}
function Girl({ T, pitch, gx, gy, s, k, work, cheer, hop }) {
  if (k <= 0.002) return null;
  const bob = work * 0.05 * Math.abs(Math.sin(T * 11)) + hop;
  const { P, nozzle } = girlParts(T, work, cheer, bob);
  const cam = mkCam(-53 + 10 * cheer, pitch, s * k, gx, gy);
  const items = P.map((pt, i) => ({ pt, i, d: cam.proj(pt.c)[2] })).sort((a, b) => a.d - b.d);
  const vis = (n) => { const r = cam.rot(n); return r[1] * cam.sp + r[2] * cam.cp > 0.02; };
  const shade = (col, n) => { const r = cam.rot(n), lit = Math.max(0, r[0] * LIGHT[0] + r[1] * LIGHT[1] + r[2] * LIGHT[2]); return css(mixc(col, SHADOW, (1 - lit) * 0.38)); };
  const pts = (q) => q.map((p) => { const v = cam.proj(p); return v[0].toFixed(1) + ',' + v[1].toFixed(1); }).join(' ');
  const out = [];
  items.forEach(({ pt, i }) => {
    pt.F.forEach((f, j) => vis(f.n) && out.push(<polygon key={'g' + i + 'f' + j} points={pts(f.pts)} fill={shade(f.col, f.n)} stroke={K.ink} strokeOpacity={0.75} strokeWidth={1.3} strokeLinejoin="round" />));
    pt.decals.forEach((dc, j) => vis(dc.n) && out.push(<polygon key={'g' + i + 'd' + j} points={pts(dc.pts)} fill={css(dc.col)} stroke={dc.col[0] === 255 ? K.ink : 'none'} strokeOpacity={0.5} strokeWidth={1} />));
  });
  const nz = cam.proj(nozzle), mist = [];
  if (work > 0.3) for (let i = 0; i < 5; i++) {
    const ph = ((T * 3 + i / 5) % 1), a = cam.proj(addv(nozzle, [-0.6, 0.1, 0.8], ph * 1.1));
    mist.push(<circle key={'m' + i} cx={a[0]} cy={a[1] - ph * 10} r={3 + ph * 9} fill={K.white} fillOpacity={(1 - ph) * 0.8 * work} stroke={K.sky} strokeOpacity={(1 - ph) * 0.6 * work} />);
  }
  return <g>
    <ellipse cx={gx} cy={gy + 2} rx={48 * k} ry={48 * k * cam.sp} fill={K.skyDeep} fillOpacity={0.14} />
    {out}{mist}
  </g>;
}

const starPath = (x, y, r) => `M${x},${y - r}Q${x},${y} ${x + r},${y}Q${x},${y} ${x},${y + r}Q${x},${y} ${x - r},${y}Q${x},${y} ${x},${y - r}Z`;

function Piece({ tw, T, spin, bookTo, variant }) {
  const TL = TIMELINES[variant] || TIMELINES.all;
  const CUES = TL.cues, authoredTotal = TL.total;
  const lk = tw.lang === 'EN' ? 'en' : 'sv', vc = VARIANT_COPY[variant];
  const L = { ...COPY[lk], ...(vc ? vc[lk] : {}) };
  const ord = ORDER.filter((n) => TL.names.includes(n));
  const cue = (n) => (ord.includes(n) || n === 'Close' ? CUES[n] : null);
  const gl = (at, a, b) => (at == null ? 0 : MOTION.glide(at + a, at + b)(T));
  const turns = parseInt(tw.turns, 10) || 2;
  const ang = 30 + spin + T * (turns * 360) / authoredTotal;
  const dust = tw.dustPass !== false;
  const brand = tw.brand || 'Modernstäd.se';

  const tr = (at, d) => d * gl(at, -0.35, 0.45);
  let pitch = 24, cy = 700, pp = 24, pc = 700;
  [...ord, 'Close'].forEach((n) => { pitch += tr(cue(n), CAM_P[n] - pp); cy += tr(cue(n), CAM_Y[n] - pc); pp = CAM_P[n]; pc = CAM_Y[n]; });
  const cx = 540, R = 310, TH = 26;
  const psin = Math.sin(pitch * Math.PI / 180);
  const ring = mkCam(ang, pitch, 1, cx, cy);

  const scenes = ord.map((name, idx) => {
    const c = CUES[name], D = CUES[ord[idx + 1] || 'Close'] - c, m = MODELS[name];
    const sw0 = c + 0.36 * D, sw1 = c + 0.68 * D;
    const swRaw = (T - sw0) / (sw1 - sw0), sw = MOTION.glide(sw0, sw1)(T);
    const range = m.b.y1 - m.b.y0 + 0.1;
    const hs = !dust ? -1e9 : sw <= 0 ? 1e9 : sw >= 1 ? -1e9 : m.b.y1 + 0.05 - sw * range;
    const hsLin = m.b.y1 + 0.05 - swRaw * range;
    const zoom = name === 'Office' ? 1 + 0.15 * (1 - MOTION.glide(c, c + D)(T)) : 1;
    const cam = mkCam(ang, pitch, m.s * zoom, cx, cy);
    const build = MOTION.glide(c - 0.05, c + 0.5)(T) * (1 - MOTION.glide(c + D - 0.5, c + D - 0.05)(T));
    const mopMode = m.mode === 'mop', uNow = clamp(swRaw, 0, 1);
    const tAt = (u) => sw0 + u * (sw1 - sw0);
    const cleanOf = mopMode ? (pt) => (dust ? clamp((T - tAt(pt.u)) / 0.25, 0, 1) : 1) : null;
    const mop = mopMode ? mopPos(uNow) : null;
    const extra = mop ? [Object.assign(B(mop.x - 0.16, 0.1, mop.z - 0.56, mop.x + 0.16, 0.22, mop.z + 0.56, K.mint), { always: true })] : null;
    const sq = m.mode === 'squeegee';
    let ex = extra;
    if (sq && dust && sw > 0 && sw < 1) {
      const y = clamp(hs, 0.42, 2.8);
      ex = [Object.assign(B(-0.7, y - 0.05, 0.05, 0.7, y + 0.05, 0.17, K.mint), { always: true }),
            Object.assign(B(-0.05, y - 0.62, 0.1, 0.05, y - 0.05, 0.17, K.sky), { always: true })];
    }
    const shine = sq ? MOTION.enter(sw1, sw1 + 0.5)(T) * (1 - MOTION.glide(c + D - 0.55, c + D - 0.25)(T)) : 0;
    return { name, c, D, m, sw, hs, hsLin, cam, build, zoom, mopMode, tAt, cleanOf, mop, extra: ex, sq, shine };
  });

  const labelAnim = (c, D) => { const i = MOTION.enter(c + 0.1, c + 0.7)(T), o = MOTION.glide(c + D - 0.55, c + D - 0.1)(T); return { op: i * (1 - o), y: (1 - i) * 50 - o * 30 }; };
  const oA = MOTION.enter(0.15, 0.85)(T), oB = MOTION.enter(0.35, 1.05)(T), oX = gl(CUES[ord[0]], -0.5, 0);
  const cl = CUES.Close, cA = MOTION.enter(cl + 0.2, cl + 0.8)(T), cB = MOTION.enter(cl + 0.4, cl + 1.0)(T),
    cBtn = MOTION.pop(cl + 0.7, cl + 1.2)(T), cX = MOTION.glide(authoredTotal - 0.6, authoredTotal - 0.1)(T);
  let work = 0, cheer = MOTION.glide(1.1, 1.5)(T) * (1 - gl(CUES[ord[0]], -0.4, 0)) + MOTION.glide(cl + 0.9, cl + 1.3)(T);
  scenes.forEach((s) => {
    const a = s.c + 0.36 * s.D, b = s.c + 0.68 * s.D;
    work += MOTION.glide(a - 0.35, a)(T) * (1 - MOTION.glide(b - 0.1, b + 0.2)(T));
    cheer += MOTION.glide(b + 0.05, b + 0.3)(T) * (1 - MOTION.glide(s.c + s.D - 0.5, s.c + s.D - 0.2)(T));
  });
  cheer = clamp(cheer, 0, 1);
  const hop = 0.25 * Math.max(0, Math.sin(clamp((T - 1.1) / 0.45, 0, 1) * Math.PI)) + scenes.reduce((h, s) => { const b = s.c + 0.68 * s.D; return h + 0.18 * Math.max(0, Math.sin(clamp((T - b) / 0.4, 0, 1) * Math.PI)); }, 0);
  const gk = tw.cleaner === false ? 0 : MOTION.pop(0.8, 1.3)(T) * (1 - MOTION.glide(authoredTotal - 0.7, authoredTotal - 0.2)(T));
  const gMul = 1 - 0.22 * gl(cue('Home'), -0.35, 0.45) + 0.1 * MOTION.glide(cl - 0.35, cl + 0.45)(T);
  const gOut = gl(cue('Office'), -0.35, 0.45) * (1 - MOTION.glide(cl - 0.35, cl + 0.45)(T));
  const gClose = MOTION.glide(cl - 0.35, cl + 0.45)(T);
  const gx = cx + 235 + 90 * gOut + 60 * gClose, gy = cy + 185 * psin + 40 * gOut + 70 * gClose;
  const act = scenes.find((s) => T >= s.c - 0.2 && T < s.c + s.D) || null;
  const loop = (k) => Math.sin((T / authoredTotal) * Math.PI * 2 * k);
  const blobs = [[170, 250, 120, 1, 0], [930, 330, 90, 2, 1], [880, 820, 150, 1, 2], [120, 760, 80, 2, 3], [560, 150, 60, 3, 4]];

  return (
    <div style={{ position: 'absolute', inset: 0, background: K.skySoft, fontFamily: FS, color: K.ink, overflow: 'hidden' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {blobs.map(([x, y, r, k, ph], i) => (
          <circle key={i} cx={x + 24 * loop(k) * (ph % 2 ? 1 : -1)} cy={y + 30 * Math.cos((T / authoredTotal) * Math.PI * 2 * k + ph)} r={r} fill={K.white} fillOpacity={0.55} />
        ))}
        <ellipse cx={cx} cy={cy + TH + 14} rx={R + 20} ry={(R + 20) * psin} fill={K.skyDeep} fillOpacity={0.08} />
        <ellipse cx={cx} cy={cy + TH} rx={R} ry={R * psin} fill={K.sky} />
        <rect x={cx - R} y={cy} width={2 * R} height={TH} fill={K.sky} />
        <ellipse cx={cx} cy={cy} rx={R} ry={R * psin} fill={K.white} stroke={K.ink} strokeOpacity={0.12} />
        <ellipse cx={cx} cy={cy} rx={R - 34} ry={(R - 34) * psin} fill="none" stroke={K.skyPale} strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" />
        {Array.from({ length: 12 }, (_, i) => {
          const t = i / 12 * Math.PI * 2, p = ring.proj([(R - 16) * Math.cos(t), 0, (R - 16) * Math.sin(t)]);
          return <circle key={i} cx={p[0]} cy={p[1]} r={i % 3 === 0 ? 5 : 3} fill={i % 3 === 0 ? K.mint : K.skyLite} />;
        })}
        {scenes.map((s) => s.build > 0.001 && (
          <ellipse key={'sh' + s.name} cx={cx} cy={cy} rx={s.m.foot * s.m.s * s.zoom * s.build} ry={s.m.foot * s.m.s * s.zoom * s.build * psin} fill={K.skyDeep} fillOpacity={0.1} />
        ))}
        {scenes.map((s) => {
          const on = s.sw > 0 && s.sw < 1 && dust && !s.mopMode && !s.sq, b = s.m.b, pad = 0.14, y = s.hs;
          const pl = on ? [[b.x0 - pad, y, b.z0 - pad], [b.x1 + pad, y, b.z0 - pad], [b.x1 + pad, y, b.z1 + pad], [b.x0 - pad, y, b.z1 + pad]].map((q) => s.cam.proj(q)) : null;
          return (
            <g key={s.name}>
              <Solid m={s.m} cam={s.cam} T={T} t0={s.c - 0.05} t1={s.c + 0.32 * s.D} o0={s.c + s.D - 0.6} o1={s.c + s.D - 0.05} hs={s.hs} keyP={s.name} cleanOf={s.cleanOf} extra={s.extra} extraK={s.build} />
              {s.sq && s.shine > 0.01 && s.cam.rot([0, 0, 1])[1] * s.cam.sp + s.cam.rot([0, 0, 1])[2] * s.cam.cp > 0.05 && (
                <g opacity={s.shine}>
                  {[[-0.5, 0.22, 0.95, 2.55], [-0.1, 0.1, 1.25, 2.3]].map(([a, w, ya, yb], i) => {
                    const z = 0.035, pts = [[a, ya, z], [a + w, ya, z], [a + w + 0.4, yb, z], [a + 0.4, yb, z]].map((q) => s.cam.proj(q));
                    return <polygon key={i} points={pts.map((p) => p[0] + ',' + p[1]).join(' ')} fill={K.white} fillOpacity={i ? 0.55 : 0.75} />;
                  })}
                </g>
              )}
              {s.mop && s.build > 0.01 && (() => {
                const k = s.build, a = s.cam.proj([s.mop.x, 0.2, s.mop.z]), b = s.cam.proj([s.mop.x - s.mop.tilt * 0.9 * k, 0.2 + 2.1 * k, s.mop.z]);
                return <g><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={K.ink} strokeOpacity={0.75} strokeWidth={11} strokeLinecap="round" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={K.sky} strokeWidth={7} strokeLinecap="round" /><circle cx={b[0]} cy={b[1]} r={8} fill={K.coral} stroke={K.ink} strokeOpacity={0.75} strokeWidth={1.4} /></g>;
              })()}
              {pl && <polygon points={pl.map((p) => p[0] + ',' + p[1]).join(' ')} fill={K.mint} fillOpacity={0.22} stroke={K.mint} strokeWidth={2.5} strokeLinejoin="round" />}
              {dust && s.m.dust.map((q, i) => {
                const vis = s.build;
                if (vis <= 0.01) return null;
                const pr = s.mopMode ? clamp((T - s.tAt(mopU(q[0], q[2]))) / 0.6, 0, 1) : clamp((q[1] - s.hsLin) / 0.9, 0, 1);
                if (pr >= 1) return null;
                const p = s.cam.proj([q[0], q[1] + pr * 1.4 + 0.05 * Math.sin(T * 2 + i), q[2]]);
                if (pr <= 0) return <circle key={'d' + i} cx={p[0]} cy={p[1]} r={2.5 + q[3] * 2.5} fill={K.stone} fillOpacity={0.7 * vis} />;
                const r = 5 + pr * 12 + q[3] * 4;
                return <g key={'d' + i} opacity={(1 - pr) * vis}><circle cx={p[0]} cy={p[1]} r={r} fill={K.white} fillOpacity={0.5} stroke={i % 2 ? K.sky : K.mint} strokeWidth={2} /><circle cx={p[0] - r * 0.35} cy={p[1] - r * 0.35} r={r * 0.22} fill={K.white} /></g>;
              })}
              {tw.sparkles !== false && s.m.sparks.map((q, i) => {
                const a = s.c + 0.66 * s.D + i * 0.12, k = MOTION.pop(a, a + 0.35)(T) * (1 - MOTION.glide(a + 0.55, a + 0.95)(T));
                if (k <= 0.001) return null;
                const p = s.cam.proj(q);
                return <g key={'s' + i}><path d={starPath(p[0], p[1], 22 * k)} fill={K.amber} stroke={K.ink} strokeOpacity={0.6} strokeWidth={1.2} /><path d={starPath(p[0] + 22 * k, p[1] - 20 * k, 9 * k)} fill={i % 2 ? K.mint : K.coral} /></g>;
              })}
            </g>
          );
        })}
        <Girl T={T} pitch={pitch} gx={gx} gy={gy} s={82 * gMul} k={gk} work={clamp(work, 0, 1)} cheer={cheer} hop={hop} />
      </svg>

      <div style={{ position: 'absolute', left: 72, right: 72, top: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: K.mint }}></div>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 34, letterSpacing: '-0.02em', color: K.skyDeep }}>{brand}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: K.skyDeep, background: K.white, borderRadius: 999, padding: '10px 20px', whiteSpace: 'nowrap', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>{L.right}</div>
      </div>

      <div style={{ position: 'absolute', left: 72, right: 72, top: 200, textAlign: 'center', opacity: 1 - oX, transform: `translateY(${-50 * oX}px)` }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: K.mintDark, opacity: oA }}>{L.kick0}</div>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 124, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 12, whiteSpace: 'nowrap' }}>
          <div style={{ opacity: oA, transform: `translateY(${(1 - oA) * 50}px)`, color: K.skyDeep }}>{L.t0a}</div>
          <div style={{ opacity: oB, transform: `translateY(${(1 - oB) * 50}px)`, color: K.sky }}>{L.t0b}</div>
        </div>
      </div>

      {scenes.map((s, si) => {
        const l = labelAnim(s.c, s.D), info = L[s.name], p2 = (n) => String(n).padStart(2, '0');
        const kick = `${p2(si + 1)} / ${p2(scenes.length)} — ${info[0].split('— ').pop()}`;
        return (
          <div key={s.name} style={{ position: 'absolute', left: 72, top: 812, width: 660, opacity: l.op, transform: `translateY(${l.y}px)` }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: K.mintDark }}>{kick}</div>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 116, lineHeight: 1, letterSpacing: '-0.03em', color: K.skyDeep, marginTop: 4 }}>{info[1]}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: K.muted, marginTop: 8 }}>{info[2]}</div>
          </div>
        );
      })}

      {(() => {
        const s = act || scenes[0], l = act ? labelAnim(s.c, s.D) : { op: 0 };
        const clean = !dust || s.sw >= 1, st = MOTION.pop(s.c + 0.68 * s.D, s.c + 0.68 * s.D + 0.35)(T);
        const chip = { fontSize: 20, fontWeight: 700, borderRadius: 999, padding: '12px 22px', whiteSpace: 'nowrap' };
        return (
          <div style={{ position: 'absolute', right: 72, top: 944, opacity: l.op }}>
            {clean
              ? <div style={{ ...chip, background: K.mint, color: K.white, boxShadow: '0 18px 50px rgba(16,185,129,0.25)', transform: `scale(${dust ? 0.8 + 0.2 * st : 1})` }}>✓ {L.clean}</div>
              : s.sw > 0
                ? <div style={{ ...chip, background: K.white, color: K.skyDeep, border: `2px solid ${K.sky}` }}>{L.cleaning}</div>
                : <div style={{ ...chip, background: K.white, color: K.muted, border: `2px solid ${K.line}` }}>{L.dusty}</div>}
          </div>
        );
      })()}

      <div style={{ position: 'absolute', left: 72, right: 72, top: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - cX, transform: `translateY(${-40 * cX}px)` }}>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: '-0.03em', textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{ opacity: cA, transform: `translateY(${(1 - cA) * 50}px)`, color: K.skyDeep }}>{L.c1}</div>
          <div style={{ opacity: cB, transform: `translateY(${(1 - cB) * 50}px)`, color: K.sky }}>{L.c2}</div>
        </div>
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20, opacity: clamp(cBtn, 0, 1), transform: `scale(${0.6 + 0.4 * cBtn})` }}>
          <Link to={bookTo} onPointerDown={(e) => e.stopPropagation()} style={{ textDecoration: 'none', pointerEvents: cBtn > 0.5 ? 'auto' : 'none', background: K.mint, color: K.white, fontSize: 28, fontWeight: 700, padding: '20px 44px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 18px 50px rgba(16,185,129,0.3)' }}>{L.cta}</Link>
          <div style={{ fontSize: 24, fontWeight: 700, color: K.skyDeep }}>{L.url}</div>
        </div>
      </div>
    </div>
  );
}


type Props = {
  lang?: 'SV' | 'EN';
  brand?: string;
  turns?: 1 | 2 | 3;
  bookTo?: string;
  className?: string;
  variant?: 'all' | 'privat' | 'foretag';
};

export default function CleaningTurntable({ lang = 'SV', brand = 'Modernstäd.se', turns = 2, bookTo = '/privat', className = '', variant = 'all', ...rest }: Props & Record<string, unknown>) {
  const wrap = useRef(null);
  const drag = useRef(null);
  const onScreen = useRef(true);
  const [scale, setScale] = useState(0.5);
  const [T, setT] = useState(0);
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { onScreen.current = e.isIntersecting; });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  useEffect(() => {
    const TL = TIMELINES[variant] || TIMELINES.all, TOTAL = TL.total;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(TL.cues.Close - 1.1); return; }
    let raf = 0, last = performance.now(), time = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (onScreen.current && !document.hidden && !drag.current?.moved) { time = (time + dt) % TOTAL; setT(time); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const onPointerDown = (e) => { drag.current = { x: e.clientX, s: spin, moved: false, id: e.pointerId }; };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) { d.moved = true; wrap.current?.setPointerCapture(d.id); }
    if (d.moved) setSpin(d.s + dx * 0.6);
  };
  const endDrag = () => { drag.current = null; };

  return (
    <div
      {...rest}
      ref={wrap}
      className={className}
      role="img"
      aria-label={lang === 'EN' ? 'A cleaner cleans a chair, table, floor, mirror, home and office on a rotating turntable' : 'En städare rengör stol, bord, golv, spegel, hem och kontor på en roterande skiva'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', touchAction: 'pan-y', cursor: drag.current?.moved ? 'grabbing' : 'grab', userSelect: 'none' }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <Piece tw={{ lang, brand, turns: String(turns), dustPass: true, sparkles: true, cleaner: true }} T={T} spin={spin} bookTo={bookTo} variant={variant} />
      </div>
    </div>
  );
}
