"""Regression tests for refactor iteration:
- /api/health reports database/emailConfigured/aiConfigured
- POST /api/bookings accepts long free-text fields (floor, doorCode,
  contactPreference, street, phone, personalNumber) after max_length relax fix.
"""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


# ---- health ----
class TestHealth:
    def test_health_reports_flags(self):
        r = requests.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        # required keys per refactor
        for k in ("database", "emailConfigured", "aiConfigured"):
            assert k in d, f"missing key {k} in /api/health -> {d}"


# ---- bug re-verify: long free-text no longer 422s ----
class TestLongFreeText:
    def _payload(self):
        return {
            "customerType": "privat",
            "serviceId": "hemstadning",
            "firstName": "Anna",
            "lastName": "Andersson",
            "personalNumber": "19850101-1234",
            "phone": "+46 70 123 45 67",
            "email": "delivered@resend.dev",
            "street": "Storgatan 12 lgh 1102",
            "city": "Malmö",
            "postalCode": "211 34",
            "floor": "ta trappan till höger och ring på dörren",
            "doorCode": "portkod 1234 sedan 5678",
            "rut": True,
            "hours": 3,
            "homeSize": "3 rum och kök",
            "frequency": "Varannan vecka",
            "startTime": "09:00",
            "preferredDate": "2026-02-15",
            "alternativeDate": "2026-02-16",
            "travelZoneId": "zone-2",
            "invoiceOption": "E-postfaktura",
            "message": "Testbokning – lång fritext för att verifiera bugfix.",
            "contactPreference": (
                "Ring gärna vardagar mellan 09 och 17, annars skicka SMS "
                "eller mejl. Undvik måndagar och fredag eftermiddag. "
                "Om ingen svarar, försök igen efter en timme tack."
            ),
            "termsAccepted": True,
        }

    def test_long_freetext_booking_succeeds(self):
        payload = self._payload()
        # Make contactPreference ~120 chars
        assert len(payload["contactPreference"]) >= 110
        r = requests.post(f"{API}/bookings", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["reference"].startswith("MS-")
        assert len(d["reference"]) == 9
        assert d["emailSent"] is True
        # persisted
        g = requests.get(f"{API}/bookings/{d['reference']}", timeout=15)
        assert g.status_code == 200
        fetched = g.json()
        assert fetched["floor"] == payload["floor"]
        assert fetched["doorCode"] == payload["doorCode"]
        assert fetched["contactPreference"] == payload["contactPreference"]
        assert "_id" not in fetched
