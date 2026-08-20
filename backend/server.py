import os
import re
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
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

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
    personalNumber: str = Field(min_length=6, max_length=20)
    phone: str = Field(min_length=6, max_length=25)
    email: EmailStr
    street: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=60)
    postalCode: str = Field(min_length=4, max_length=10)
    floor: Optional[str] = Field(default="", max_length=20)
    doorCode: Optional[str] = Field(default="", max_length=20)
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
    contactPreference: Optional[str] = Field(default="", max_length=200)
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


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
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
    return stored


@api.get("/bookings/{reference}")
async def get_booking(reference: str):
    doc = await db.bookings.find_one({"reference": reference}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Bokningen hittades inte")
    return doc


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
