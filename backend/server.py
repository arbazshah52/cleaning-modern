import os
import re
import json
import uuid
import ipaddress
import logging
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from typing import Optional, Literal
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, field_validator

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("modernstad")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME") or "Modernstäd.se"
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL") or "arbazshah11@gmail.com"
ADMIN_PHONE = os.environ.get("ADMIN_PHONE") or "0736200637"
ORG_NUMBER = os.environ.get("ORG_NUMBER") or "559391-4392"

MAX_DISCOUNT_PCT = 10

ALLOWED_MODELS = {
    "claude-sonnet-4-6": "anthropic",
    "claude-opus-4-7": "anthropic",
    "claude-haiku-4-5-20251001": "anthropic",
    "gpt-5.5": "openai",
    "gemini-3.1-pro-preview": "gemini",
}
DEFAULT_MODEL = "claude-sonnet-4-6"

FIXED_PRICE_RULES = {
    "privat": {"perSqm": 25, "perRoom": 150, "minimum": 900},
    "foretag": {"perSqm": 30, "perRoom": 200, "minimum": 1500},
}

app = FastAPI(title="Modernstäd.se API")
api = APIRouter(prefix="/api")

# ---------------------------------------------------------------- catalog data

SERVICES = [
    {"id": "hemstadning", "customerType": "privat", "name": "Hemstädning",
     "pricePerHour": 226, "minimumHours": 3, "rutEligible": True,
     "description": "Regelbunden städning av ditt hem – kök, badrum, damning och golv.",
     "days": "Mån–Fre"},
    {"id": "allman-stadning", "customerType": "privat", "name": "Allmän städning",
     "pricePerHour": 236, "minimumHours": 3, "rutEligible": True,
     "description": "Flexibel städning efter dina önskemål och egen checklista.",
     "days": "Mån–Lör"},
    {"id": "engangsstadning", "customerType": "privat", "name": "Engångsstädning",
     "pricePerHour": 289, "minimumHours": 4, "rutEligible": True,
     "description": "En djupare städning vid ett enskilt tillfälle, t.ex. inför gäster.",
     "days": "Mån–Lör"},
    {"id": "aterkommande-stadning", "customerType": "privat", "name": "Återkommande städning",
     "pricePerHour": 226, "minimumHours": 3, "rutEligible": True,
     "description": "Fast tid varje vecka eller varannan vecka med samma städare.",
     "days": "Mån–Fre"},
    {"id": "kontorsstadning", "customerType": "foretag", "name": "Kontorsstädning",
     "pricePerHour": 295, "minimumHours": 2, "rutEligible": False,
     "description": "Daglig eller veckovis städning av kontor och mötesrum.",
     "days": "Mån–Fre"},
    {"id": "foretagsstadning", "customerType": "foretag", "name": "Företagsstädning",
     "pricePerHour": 315, "minimumHours": 3, "rutEligible": False,
     "description": "Anpassad städning för butik, lokal eller verksamhet.",
     "days": "Mån–Lör"},
    {"id": "regelbunden-stadning", "customerType": "foretag", "name": "Regelbunden städning",
     "pricePerHour": 285, "minimumHours": 2, "rutEligible": False,
     "description": "Löpande avtal med fasta tider och samma personal.",
     "days": "Mån–Fre"},
    {"id": "specialstadning", "customerType": "foretag", "name": "Specialstädning",
     "pricePerHour": 345, "minimumHours": 4, "rutEligible": False,
     "description": "Bygg-, flytt- och fönsterstädning samt andra specialuppdrag.",
     "days": "Mån–Sön"},
]

TRAVEL_ZONES = [
    {"id": "central-malmo", "name": "Centrala Malmö", "fee": 0},
    {"id": "zone-1", "name": "Zon 1 – Arlöv, Limhamn", "fee": 49},
    {"id": "zone-2", "name": "Zon 2 – Lund, Staffanstorp", "fee": 99},
    {"id": "zone-3", "name": "Zon 3 – Bjärred, Kävlinge", "fee": 149},
    {"id": "zone-4", "name": "Zon 4 – Trelleborg, Ystad", "fee": 199},
]

SERVICE_BY_ID = {s["id"]: s for s in SERVICES}
ZONE_BY_ID = {z["id"]: z for z in TRAVEL_ZONES}


# -------------------------------------------------------------------- models

class BookingCreate(BaseModel):
    customerType: Literal["privat", "foretag"]
    serviceId: str
    firstName: str = Field(min_length=1, max_length=60)
    lastName: str = Field(min_length=1, max_length=60)
    personalNumber: str = Field(min_length=6, max_length=30)
    phone: str = Field(min_length=6, max_length=30)
    email: EmailStr
    street: str = Field(min_length=2, max_length=160)
    city: str = Field(min_length=2, max_length=80)
    postalCode: str = Field(min_length=4, max_length=12)
    floor: Optional[str] = Field(default="", max_length=80)
    doorCode: Optional[str] = Field(default="", max_length=80)
    rut: bool = False
    hours: int = Field(ge=1, le=24)
    homeSize: str = Field(min_length=1, max_length=40)
    frequency: str = Field(min_length=1, max_length=40)
    startTime: str = Field(min_length=1, max_length=40)
    preferredDate: str
    alternativeDate: Optional[str] = ""
    travelZoneId: str
    invoiceOption: str = Field(min_length=1, max_length=60)
    message: Optional[str] = Field(default="", max_length=2000)
    contactPreference: Optional[str] = Field(default="", max_length=300)
    termsAccepted: bool

    @field_validator("serviceId")
    @classmethod
    def _svc(cls, v: str) -> str:
        if v not in SERVICE_BY_ID:
            raise ValueError("Okänd tjänst")
        return v

    @field_validator("travelZoneId")
    @classmethod
    def _zone(cls, v: str) -> str:
        if v not in ZONE_BY_ID:
            raise ValueError("Okänd resezon")
        return v

    @field_validator("termsAccepted")
    @classmethod
    def _terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Villkoren måste godkännas")
        return v


def quote(service: dict, hours: int, zone: dict, rut: bool) -> dict:
    labour = service["pricePerHour"] * hours
    rut_applied = bool(rut and service["rutEligible"])
    discount = round(labour * 0.5) if rut_applied else 0
    return {
        "pricePerHour": service["pricePerHour"],
        "hours": hours,
        "labourCost": labour,
        "rutApplied": rut_applied,
        "rutDiscount": discount,
        "travelFee": zone["fee"],
        "total": labour - discount + zone["fee"],
        "currency": "SEK",
    }


# --------------------------------------------------------------- email helpers

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _check_email_links(scan: "_EmailScan") -> None:
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")


def _check_email_anchors(scan: "_EmailScan") -> None:
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")


def _check_email_body(subject: str, html: str, scan: "_EmailScan") -> None:
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    _check_email_body(subject, html, scan)
    _check_email_links(scan)
    _check_email_anchors(scan)


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    if not EMAIL_KEY:
        logger.error("EMERGENT_EMAIL_KEY saknas – hoppar över e-postutskick")
        return None
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None


def _row(label: str, value: str) -> str:
    return (f'<tr><td style="padding:6px 0;color:#4B5563;font-size:14px">{escape(label)}</td>'
            f'<td style="padding:6px 0;color:#1F2937;font-size:14px;text-align:right">'
            f'<strong>{escape(value)}</strong></td></tr>')


def confirmation_html(b: dict) -> str:
    p = b["price"]
    rows = "".join([
        _row("Tjänst", b["serviceName"]),
        _row("Antal timmar", f'{b["hours"]} h'),
        _row("Bostadens storlek", b["homeSize"]),
        _row("Hur ofta", b["frequency"]),
        _row("Önskat datum", b["preferredDate"]),
        _row("Starttid", b["startTime"]),
        _row("Adress", f'{b["street"]}, {b["postalCode"]} {b["city"]}'),
        _row("RUT-avdrag", "Ja" if p["rutApplied"] else "Nej"),
        _row("Resekostnad", f'{p["travelFee"]} SEK'),
        _row("Beräknat pris", f'{p["total"]} SEK'),
    ])
    return (
        '<table role="presentation" width="100%" style="background:#FAFAFA;padding:24px">'
        '<tr><td align="center"><table role="presentation" width="560" '
        'style="background:#FFFFFF;border-radius:16px;padding:32px;font-family:Arial,Helvetica,sans-serif">'
        f'<tr><td><p style="font-size:20px;color:#1F2937;margin:0 0 8px">Tack {escape(b["firstName"])}!</p>'
        f'<p style="font-size:14px;color:#4B5563;margin:0 0 20px">Vi har tagit emot din bokningsförfrågan '
        f'(referens <strong>{escape(b["reference"])}</strong>). Vi återkommer inom kort med en bekräftelse.</p>'
        f'<table role="presentation" width="100%">{rows}</table>'
        '<p style="font-size:13px;color:#4B5563;margin:20px 0 0">Priset är beräknat och kan justeras efter '
        'en genomgång av uppdraget. Ingen betalning sker via e-post.</p>'
        f'<p style="font-size:12px;color:#888;margin:18px 0 0">Skickat av {escape(EMAIL_FROM_NAME)}. '
        'Vi frågar aldrig efter lösenord eller kortuppgifter via e-post.</p>'
        '</td></tr></table></td></tr></table>'
    )


# -------------------------------------------------------------------- routes

@api.get("/")
async def root():
    return {"status": "ok", "service": "Modernstäd.se API"}


@api.get("/services")
async def get_services(customerType: Optional[str] = None):
    if customerType:
        return [s for s in SERVICES if s["customerType"] == customerType]
    return SERVICES


@api.get("/travel-zones")
async def get_travel_zones():
    return TRAVEL_ZONES


class QuoteRequest(BaseModel):
    serviceId: str
    hours: int = Field(ge=1, le=24)
    travelZoneId: str
    rut: bool = False


@api.post("/quote")
async def post_quote(req: QuoteRequest):
    service = SERVICE_BY_ID.get(req.serviceId)
    zone = ZONE_BY_ID.get(req.travelZoneId)
    if not service or not zone:
        raise HTTPException(status_code=400, detail="Okänd tjänst eller resezon")
    return quote(service, req.hours, zone, req.rut)


@api.post("/bookings")
async def create_booking(payload: BookingCreate):
    service = SERVICE_BY_ID[payload.serviceId]
    zone = ZONE_BY_ID[payload.travelZoneId]
    if service["customerType"] != payload.customerType:
        raise HTTPException(status_code=400, detail="Tjänsten matchar inte kundtypen")
    if payload.hours < service["minimumHours"]:
        raise HTTPException(
            status_code=400,
            detail=f'Minst {service["minimumHours"]} timmar krävs för {service["name"]}',
        )

    reference = "MS-" + uuid.uuid4().hex[:6].upper()
    doc = payload.model_dump()
    doc.update({
        "booking_id": str(uuid.uuid4()),
        "reference": reference,
        "serviceName": service["name"],
        "travelZoneName": zone["name"],
        "price": quote(service, payload.hours, zone, payload.rut),
        "status": "mottagen",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.bookings.insert_one(dict(doc))

    stored = await db.bookings.find_one({"reference": reference}, {"_id": 0})
    email_id = await send_email(
        to=stored["email"],
        subject=f'Din bokningsförfrågan {reference} – {EMAIL_FROM_NAME}',
        html=confirmation_html(stored),
    )
    stored["emailSent"] = email_id is not None
    await notify_admin(stored, "Ny bokning via formuläret")
    return stored


@api.get("/health")
async def health():
    try:
        await db.command("ping")
        db_ok = True
    except Exception as e:
        logger.error(f"DB ping failed: {e}")
        db_ok = False
    return {
        "status": "ok" if db_ok else "degraded",
        "database": db_ok,
        "emailConfigured": bool(EMAIL_KEY),
        "aiConfigured": bool(LLM_KEY),
    }


@api.get("/company")
async def company_info():
    return {
        "name": "Modernstäd.se",
        "email": ADMIN_EMAIL,
        "phone": ADMIN_PHONE,
        "orgNumber": ORG_NUMBER,
        "maxDiscountPct": MAX_DISCOUNT_PCT,
        "fixedPriceRules": FIXED_PRICE_RULES,
        "models": list(ALLOWED_MODELS.keys()),
    }


@api.get("/bookings/{reference}")
async def get_booking(reference: str):
    doc = await db.bookings.find_one({"reference": reference}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Bokningen hittades inte")
    return doc


# ------------------------------------------------------- fixed price & AI agent

def fixed_quote(
    customer_type: str,
    sqm: int,
    rooms: int,
    travel_zone_id: str,
    rut: bool,
    discount_pct: float = 0,
) -> dict:
    rules = FIXED_PRICE_RULES[customer_type]
    zone = ZONE_BY_ID.get(travel_zone_id) or ZONE_BY_ID["central-malmo"]
    base = max(rules["perSqm"] * sqm + rules["perRoom"] * rooms, rules["minimum"])
    pct = max(0.0, min(float(discount_pct), float(MAX_DISCOUNT_PCT)))
    discount = round(base * pct / 100)
    negotiated = base - discount
    rut_applied = bool(rut and customer_type == "privat")
    rut_discount = round(negotiated * 0.5) if rut_applied else 0
    return {
        "model": "fixed",
        "sqm": sqm,
        "rooms": rooms,
        "basePrice": base,
        "discountPct": round(pct, 1),
        "negotiationDiscount": discount,
        "negotiatedPrice": negotiated,
        "rutApplied": rut_applied,
        "rutDiscount": rut_discount,
        "travelFee": zone["fee"],
        "total": negotiated - rut_discount + zone["fee"],
        "currency": "SEK",
    }


class FixedQuoteRequest(BaseModel):
    customerType: Literal["privat", "foretag"]
    sqm: int = Field(ge=10, le=2000)
    rooms: int = Field(ge=1, le=40)
    travelZoneId: str = "central-malmo"
    rut: bool = False
    discountPct: float = 0


@api.post("/fixed-quote")
async def post_fixed_quote(req: FixedQuoteRequest):
    return fixed_quote(req.customerType, req.sqm, req.rooms, req.travelZoneId, req.rut, req.discountPct)


def admin_html(b: dict, heading: str) -> str:
    p = b.get("price", {})
    rows = "".join([
        _row("Referens", b.get("reference", "")),
        _row("Kund", f'{b.get("firstName","")} {b.get("lastName","")}'),
        _row("E-post", b.get("email", "")),
        _row("Telefon", b.get("phone", "")),
        _row("Tjänst", b.get("serviceName", "")),
        _row("Prismodell", "Fastpris (AI)" if p.get("model") == "fixed" else "Timpris"),
        _row("Kvm / rum", f'{p.get("sqm", "–")} m² / {p.get("rooms", "–")} rum')
        if p.get("model") == "fixed" else _row("Antal timmar", f'{b.get("hours", "–")} h'),
        _row("Rabatt", f'{p.get("discountPct", 0)} %') if p.get("model") == "fixed" else "",
        _row("Adress", f'{b.get("street","")}, {b.get("postalCode","")} {b.get("city","")}'),
        _row("Önskat datum", b.get("preferredDate", "")),
        _row("Starttid", b.get("startTime", "")),
        _row("RUT", "Ja" if p.get("rutApplied") else "Nej"),
        _row("Resekostnad", f'{p.get("travelFee", 0)} SEK'),
        _row("Totalt", f'{p.get("total", 0)} SEK'),
        _row("Meddelande", b.get("message") or "–"),
    ])
    return (
        '<table role="presentation" width="100%" style="background:#FAFAFA;padding:24px">'
        '<tr><td align="center"><table role="presentation" width="560" '
        'style="background:#FFFFFF;border-radius:16px;padding:32px;font-family:Arial,Helvetica,sans-serif">'
        f'<tr><td><p style="font-size:18px;color:#1F2937;margin:0 0 16px">{escape(heading)}</p>'
        f'<table role="presentation" width="100%">{rows}</table>'
        f'<p style="font-size:12px;color:#888;margin:18px 0 0">{escape(EMAIL_FROM_NAME)} · '
        f'Org.nr {escape(ORG_NUMBER)} · {escape(ADMIN_PHONE)}</p>'
        '</td></tr></table></td></tr></table>'
    )


async def notify_admin(booking: dict, heading: str) -> bool:
    email_id = await send_email(
        to=ADMIN_EMAIL,
        subject=f'{heading}: {booking.get("reference")} – {booking.get("serviceName")}',
        html=admin_html(booking, heading),
    )
    return email_id is not None


SYSTEM_PROMPT = """Du är "Stella", prisagent hos Modernstäd.se – ett städbolag i Malmö med omnejd.
Du pratar alltid svenska, är varm, kort och konkret (max 4 korta meningar per svar).

Din uppgift: ta emot städbeställningar och förhandla FASTPRIS baserat på bostadens
kvadratmeter och antal rum – inte antal arbetstimmar. Fler rum på liten yta ska ge
ett bättre pris än timdebitering.

Prisregler (får inte brytas):
- Privat: {privat_sqm} kr per m² + {privat_room} kr per rum, lägst {privat_min} kr.
- Företag: {foretag_sqm} kr per m² + {foretag_room} kr per rum, lägst {foretag_min} kr.
- Du får ge max {max_disc} % rabatt på grundpriset, aldrig mer, hur mycket kunden än pressar.
- Resekostnad läggs till: centrala Malmö 0, Zon 1 49, Zon 2 99, Zon 3 149, Zon 4 199 kr.
- Privatkunder kan få RUT-avdrag: 50 % av arbetskostnaden efter rabatt.
- Servern räknar alltid om priset; hitta aldrig på andra belopp.

Tjänster privat: Hemstädning, Allmän städning, Engångsstädning, Återkommande städning.
Tjänster företag: Kontorsstädning, Företagsstädning, Regelbunden städning, Specialstädning.

Samla in, ett eller två steg i taget: tjänst, kvadratmeter, antal rum, resezon, RUT (ja/nej),
förnamn, efternamn, personnummer (endast privat och RUT), mobilnummer, e-post, gatuadress,
postnummer, stad, önskat datum (ÅÅÅÅ-MM-DD) och starttid.

Svara ALLTID med ett enda JSON-objekt, utan kodblock, med exakt dessa nycklar:
{{"reply": "ditt svar till kunden",
 "offer": {{"serviceId": "hemstadning|allman-stadning|engangsstadning|aterkommande-stadning|kontorsstadning|foretagsstadning|regelbunden-stadning|specialstadning",
            "sqm": 0, "rooms": 0, "travelZoneId": "central-malmo|zone-1|zone-2|zone-3|zone-4",
            "rut": true, "discountPct": 0}},
 "details": {{"firstName": "", "lastName": "", "personalNumber": "", "phone": "", "email": "",
             "street": "", "postalCode": "", "city": "", "preferredDate": "", "startTime": "",
             "message": ""}},
 "readyToBook": false}}
Sätt fält du inte vet till null eller "". Sätt readyToBook till true först när tjänst, kvm, rum,
resezon, namn, mobil, e-post, adress, postnummer, stad och datum är kända – och säg då i "reply"
att kunden kan bekräfta bokningen med knappen."""


def _system_prompt() -> str:
    p, f = FIXED_PRICE_RULES["privat"], FIXED_PRICE_RULES["foretag"]
    return SYSTEM_PROMPT.format(
        privat_sqm=p["perSqm"], privat_room=p["perRoom"], privat_min=p["minimum"],
        foretag_sqm=f["perSqm"], foretag_room=f["perRoom"], foretag_min=f["minimum"],
        max_disc=MAX_DISCOUNT_PCT,
    )


class ChatRequest(BaseModel):
    sessionId: Optional[str] = None
    message: str = Field(min_length=1, max_length=2000)
    customerType: Literal["privat", "foretag"] = "privat"
    model: str = DEFAULT_MODEL


def _parse_ai(raw: str) -> dict:
    fallback = {"reply": raw.strip(), "offer": None, "details": {}, "readyToBook": False}
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?|```$", "", text).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return fallback
    data: Optional[dict] = None
    try:
        loaded = json.loads(text[start:end + 1])
        data = loaded if isinstance(loaded, dict) else None
    except json.JSONDecodeError:
        data = None
    if data is None:
        return fallback
    return {
        "reply": data.get("reply") or "",
        "offer": data.get("offer") or None,
        "details": data.get("details") or {},
        "readyToBook": bool(data.get("readyToBook")),
    }


def _chat_system_message(customer_type: str, history: list) -> str:
    transcript = "\n".join(
        f'{"Kund" if m["role"] == "user" else "Stella"}: {m["content"]}' for m in history[-16:]
    )
    return (
        f'{_system_prompt()}\n\nKundtyp: {customer_type}.'
        + (f'\n\nTidigare konversation:\n{transcript}' if transcript else "")
    )


def _price_from_offer(customer_type: str, offer: dict) -> Optional[dict]:
    if not (offer.get("sqm") and offer.get("rooms")):
        return None
    try:
        return fixed_quote(
            customer_type,
            int(offer["sqm"]),
            int(offer["rooms"]),
            offer.get("travelZoneId") or "central-malmo",
            bool(offer.get("rut")),
            float(offer.get("discountPct") or 0),
        )
    except (TypeError, ValueError) as e:
        logger.error(f"Ogiltigt AI-erbjudande: {offer} ({e})")
        return None


async def _store_turn(
    session_id: str, req: "ChatRequest", model: str, parsed: dict, offer: dict
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    await db.ai_sessions.update_one(
        {"session_id": session_id},
        {
            "$setOnInsert": {"session_id": session_id, "created_at": now,
                             "customerType": req.customerType},
            "$set": {"model": model, "updated_at": now, "lastOffer": offer,
                     "lastDetails": parsed["details"]},
            "$push": {"messages": {"$each": [
                {"role": "user", "content": req.message, "at": now},
                {"role": "assistant", "content": parsed["reply"], "at": now},
            ]}},
        },
        upsert=True,
    )


async def _ask_agent(model: str, session_id: str, system: str, message: str) -> str:
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    chat = LlmChat(api_key=LLM_KEY, session_id=session_id, system_message=system).with_model(
        ALLOWED_MODELS[model], model
    )
    try:
        raw = await chat.send_message(UserMessage(text=message))
    except Exception as e:
        logger.error(f"AI error: {e}")
        raise HTTPException(status_code=502, detail="AI-agenten är inte tillgänglig just nu.")
    return raw if isinstance(raw, str) else str(raw)


@api.post("/ai/chat")
async def ai_chat(req: ChatRequest):
    if not LLM_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI-agenten är inte konfigurerad (EMERGENT_LLM_KEY saknas).",
        )

    model = req.model if req.model in ALLOWED_MODELS else DEFAULT_MODEL
    session_id = req.sessionId or str(uuid.uuid4())
    session = await db.ai_sessions.find_one({"session_id": session_id}, {"_id": 0})
    history: list = session["messages"] if session else []

    raw = await _ask_agent(
        model, session_id, _chat_system_message(req.customerType, history), req.message
    )
    parsed = _parse_ai(raw)
    offer = parsed["offer"] or {}
    price = _price_from_offer(req.customerType, offer)
    await _store_turn(session_id, req, model, parsed, offer)

    return {
        "sessionId": session_id,
        "model": model,
        "reply": parsed["reply"],
        "offer": offer or None,
        "details": parsed["details"],
        "price": price,
        "readyToBook": parsed["readyToBook"] and price is not None,
    }


class AiBookingCreate(BaseModel):
    sessionId: str
    customerType: Literal["privat", "foretag"]
    serviceId: str
    sqm: int = Field(ge=10, le=2000)
    rooms: int = Field(ge=1, le=40)
    travelZoneId: str
    rut: bool = False
    discountPct: float = 0
    firstName: str = Field(min_length=1, max_length=60)
    lastName: str = Field(min_length=1, max_length=60)
    personalNumber: Optional[str] = ""
    phone: str = Field(min_length=6, max_length=30)
    email: EmailStr
    street: str = Field(min_length=2, max_length=160)
    postalCode: str = Field(min_length=4, max_length=12)
    city: str = Field(min_length=2, max_length=80)
    preferredDate: str
    startTime: Optional[str] = "Förmiddag (10–12)"
    message: Optional[str] = Field(default="", max_length=2000)

    @field_validator("serviceId")
    @classmethod
    def _svc(cls, v: str) -> str:
        if v not in SERVICE_BY_ID:
            raise ValueError("Okänd tjänst")
        return v

    @field_validator("travelZoneId")
    @classmethod
    def _zone(cls, v: str) -> str:
        if v not in ZONE_BY_ID:
            raise ValueError("Okänd resezon")
        return v


def fixed_confirmation_html(b: dict) -> str:
    p = b["price"]
    rows = "".join([
        _row("Tjänst", b["serviceName"]),
        _row("Bostad", f'{p["sqm"]} m², {p["rooms"]} rum'),
        _row("Grundpris (fastpris)", f'{p["basePrice"]} SEK'),
        _row("Rabatt från prisagenten", f'−{p["negotiationDiscount"]} SEK ({p["discountPct"]} %)'),
        _row("RUT-avdrag", f'−{p["rutDiscount"]} SEK' if p["rutApplied"] else "Nej"),
        _row("Resekostnad", f'{p["travelFee"]} SEK'),
        _row("Att betala", f'{p["total"]} SEK'),
        _row("Adress", f'{b["street"]}, {b["postalCode"]} {b["city"]}'),
        _row("Önskat datum", b["preferredDate"]),
        _row("Starttid", b.get("startTime") or "–"),
    ])
    return (
        '<table role="presentation" width="100%" style="background:#FAFAFA;padding:24px">'
        '<tr><td align="center"><table role="presentation" width="560" '
        'style="background:#FFFFFF;border-radius:16px;padding:32px;font-family:Arial,Helvetica,sans-serif">'
        f'<tr><td><p style="font-size:20px;color:#1F2937;margin:0 0 8px">Tack {escape(b["firstName"])}!</p>'
        f'<p style="font-size:14px;color:#4B5563;margin:0 0 20px">Vi har tagit emot din fastprisbokning '
        f'(referens <strong>{escape(b["reference"])}</strong>). Priset gäller enligt överenskommelsen '
        'med vår prisagent och bekräftas av oss innan städningen.</p>'
        f'<table role="presentation" width="100%">{rows}</table>'
        f'<p style="font-size:12px;color:#888;margin:18px 0 0">{escape(EMAIL_FROM_NAME)} · '
        f'Org.nr {escape(ORG_NUMBER)} · {escape(ADMIN_PHONE)} · Vi frågar aldrig efter lösenord '
        'eller kortuppgifter via e-post.</p>'
        '</td></tr></table></td></tr></table>'
    )


@api.post("/ai/bookings")
async def create_ai_booking(payload: AiBookingCreate):
    service = SERVICE_BY_ID[payload.serviceId]
    if service["customerType"] != payload.customerType:
        raise HTTPException(status_code=400, detail="Tjänsten matchar inte kundtypen")

    zone = ZONE_BY_ID[payload.travelZoneId]
    price = fixed_quote(
        payload.customerType, payload.sqm, payload.rooms,
        payload.travelZoneId, payload.rut, payload.discountPct,
    )
    reference = "MS-" + uuid.uuid4().hex[:6].upper()
    doc = payload.model_dump()
    doc.update({
        "booking_id": str(uuid.uuid4()),
        "reference": reference,
        "serviceName": service["name"],
        "travelZoneName": zone["name"],
        "price": price,
        "source": "ai-agent",
        "status": "mottagen",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.bookings.insert_one(dict(doc))

    stored = await db.bookings.find_one({"reference": reference}, {"_id": 0})
    email_id = await send_email(
        to=stored["email"],
        subject=f'Din fastprisbokning {reference} – {EMAIL_FROM_NAME}',
        html=fixed_confirmation_html(stored),
    )
    stored["emailSent"] = email_id is not None
    await notify_admin(stored, "Accepterad AI-offert")
    await db.ai_sessions.update_one(
        {"session_id": payload.sessionId}, {"$set": {"bookingReference": reference}}
    )
    return stored


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
