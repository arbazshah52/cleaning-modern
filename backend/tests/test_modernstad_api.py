"""Backend API tests for Modernstäd.se"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def valid_privat_payload():
    return {
        "customerType": "privat",
        "serviceId": "hemstadning",
        "firstName": "Anna",
        "lastName": "Andersson",
        "personalNumber": "850101-1234",
        "phone": "0701234567",
        "email": "delivered@resend.dev",
        "street": "Storgatan 12",
        "city": "Malmö",
        "postalCode": "211 34",
        "floor": "2",
        "doorCode": "1234",
        "rut": True,
        "hours": 3,
        "homeSize": "3 rum och kök",
        "frequency": "Varannan vecka",
        "startTime": "09:00",
        "preferredDate": "2026-02-15",
        "alternativeDate": "2026-02-16",
        "travelZoneId": "zone-2",
        "invoiceOption": "E-postfaktura",
        "message": "Testbokning",
        "contactPreference": "E-post",
        "termsAccepted": True,
    }


# ---- catalog endpoints ----
class TestCatalog:
    def test_get_all_services(self):
        r = requests.get(f"{API}/services", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 8
        ids = {s["id"] for s in data}
        assert "hemstadning" in ids and "kontorsstadning" in ids

    def test_get_privat_services(self):
        r = requests.get(f"{API}/services", params={"customerType": "privat"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 4
        assert all(s["customerType"] == "privat" for s in data)

    def test_get_foretag_services(self):
        r = requests.get(f"{API}/services", params={"customerType": "foretag"}, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) == 4

    def test_travel_zones(self):
        r = requests.get(f"{API}/travel-zones", timeout=15)
        assert r.status_code == 200
        zones = r.json()
        assert len(zones) == 5
        fees = sorted([z["fee"] for z in zones])
        assert fees == [0, 49, 99, 149, 199]


# ---- quote endpoint ----
class TestQuote:
    def test_quote_with_rut(self):
        r = requests.post(f"{API}/quote", json={
            "serviceId": "hemstadning", "hours": 4,
            "travelZoneId": "zone-2", "rut": True
        }, timeout=15)
        assert r.status_code == 200
        q = r.json()
        assert q["labourCost"] == 226 * 4
        assert q["rutApplied"] is True
        assert q["rutDiscount"] == round(226 * 4 * 0.5)
        assert q["travelFee"] == 99
        assert q["total"] == 226 * 4 - q["rutDiscount"] + 99

    def test_quote_without_rut(self):
        r = requests.post(f"{API}/quote", json={
            "serviceId": "hemstadning", "hours": 3,
            "travelZoneId": "central-malmo", "rut": False
        }, timeout=15)
        assert r.status_code == 200
        q = r.json()
        assert q["rutApplied"] is False
        assert q["rutDiscount"] == 0
        assert q["total"] == 226 * 3

    def test_quote_foretag_no_rut_even_if_requested(self):
        r = requests.post(f"{API}/quote", json={
            "serviceId": "kontorsstadning", "hours": 2,
            "travelZoneId": "zone-1", "rut": True
        }, timeout=15)
        assert r.status_code == 200
        q = r.json()
        assert q["rutApplied"] is False
        assert q["rutDiscount"] == 0
        assert q["total"] == 295 * 2 + 49


# ---- booking creation ----
class TestBookings:
    def test_create_and_retrieve_booking(self, valid_privat_payload):
        r = requests.post(f"{API}/bookings", json=valid_privat_payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["reference"].startswith("MS-") and len(data["reference"]) == 9
        assert data["status"] == "mottagen"
        assert "price" in data and data["price"]["rutApplied"] is True
        assert data["price"]["travelFee"] == 99
        assert data["emailSent"] is True
        ref = data["reference"]

        g = requests.get(f"{API}/bookings/{ref}", timeout=15)
        assert g.status_code == 200
        fetched = g.json()
        assert fetched["reference"] == ref
        assert fetched["email"] == "delivered@resend.dev"
        assert "_id" not in fetched

    def test_reject_terms_not_accepted(self, valid_privat_payload):
        p = dict(valid_privat_payload); p["termsAccepted"] = False
        r = requests.post(f"{API}/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_unknown_service(self, valid_privat_payload):
        p = dict(valid_privat_payload); p["serviceId"] = "not-real"
        r = requests.post(f"{API}/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_unknown_zone(self, valid_privat_payload):
        p = dict(valid_privat_payload); p["travelZoneId"] = "zone-99"
        r = requests.post(f"{API}/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_hours_below_minimum(self, valid_privat_payload):
        p = dict(valid_privat_payload); p["hours"] = 2  # min is 3 for hemstadning
        r = requests.post(f"{API}/bookings", json=p, timeout=15)
        assert r.status_code == 400
        assert "Minst" in r.json()["detail"]

    def test_reject_mismatched_customer_type(self, valid_privat_payload):
        p = dict(valid_privat_payload); p["serviceId"] = "kontorsstadning"
        r = requests.post(f"{API}/bookings", json=p, timeout=15)
        assert r.status_code == 400

    def test_reject_invalid_email(self, valid_privat_payload):
        p = dict(valid_privat_payload); p["email"] = "not-an-email"
        r = requests.post(f"{API}/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_foretag_booking_no_rut(self):
        payload = {
            "customerType": "foretag", "serviceId": "kontorsstadning",
            "firstName": "Bo", "lastName": "Berg",
            "personalNumber": "5560001234", "phone": "0700000000",
            "email": "delivered@resend.dev",
            "street": "Storgatan 1", "city": "Malmö", "postalCode": "211 34",
            "rut": True,  # should be ignored (not eligible)
            "hours": 3, "homeSize": "kontor", "frequency": "Vecka",
            "startTime": "08:00", "preferredDate": "2026-03-01",
            "travelZoneId": "central-malmo", "invoiceOption": "E-postfaktura",
            "termsAccepted": True,
        }
        r = requests.post(f"{API}/bookings", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["price"]["rutApplied"] is False
        assert d["price"]["rutDiscount"] == 0

    def test_booking_not_found(self):
        r = requests.get(f"{API}/bookings/MS-NOPE99", timeout=15)
        assert r.status_code == 404
