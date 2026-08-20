# Modernstäd.se – PRD

## Original problem statement
Animated Swedish cleaning-service booking website for Modernstäd.se: cartoon-illustrated animated
landing page ("Rent hem. Mer tid för dig."), Privat/Företag split, service selection, 8-step animated
booking wizard, data-driven pricing, travel-zone fees, RUT handling, booking summary, backend booking
logic, confirmation system.

## Stack
React 19 + Vite 5 + TypeScript + Tailwind + Framer Motion + React Hook Form + Zod (frontend, port 3000)
FastAPI + MongoDB (backend, /api prefix) + Emergent-managed Resend for confirmation email.

## User personas
- Privatkund i Malmöområdet som vill boka hemstädning med RUT-avdrag.
- Företagskund som behöver kontors-/lokalstädning, fakturaalternativ, ingen RUT.

## Core requirements (static)
- Swedish UI, mobile-first Scandinavian/cartoon visual identity.
- Data-driven services (name, pricePerHour, minimumHours, rutEligible, days, description).
- Travel zones: Centrala Malmö 0, Zon 1 49, Zon 2 99, Zon 3 149, Zon 4 199 SEK.
- 8-step wizard: Uppgifter, Adress, RUT, Städning, Datum, Resa & faktura, Övrigt (CAPTCHA + villkor), Bekräfta.
- Live price summary; 50 % RUT-avdrag on labour for eligible services.
- Bookings persisted; confirmation email to customer; reference MS-XXXXXX.

## Implemented (2026-06)
- Animated hero with parallax bubbles/blobs, original generated cartoon artwork, trust bar.
- Home page: service preview, "Så funkar det", RUT CTA, footer.
- /privat and /foretag flows: service selector -> wizard -> confirmation.
- Zod validation per step, math CAPTCHA, terms consent.
- Backend: GET /api/services, /api/travel-zones, POST /api/quote, POST /api/bookings,
  GET /api/bookings/{reference}; server-side price calculation and guardrailed Resend email.
- Full QA: backend 16/16 pytest, frontend privat + företag flows, mobile 390px – all pass.

## Backlog
- P1: Adminvy för bokningar, server-side regex för personnummer/postnummer/telefon.
- P1: Bokningsuppslag via referens i UI, notismail till Modernstäd.
- P2: Priser/tjänster i databasen med redigering, checklistor per tjänst, kalender med lediga tider.
