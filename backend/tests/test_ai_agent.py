"""Backend API tests for Modernstäd.se AI price agent + fixed price + company info."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

MODELS = ["claude-sonnet-4-6", "gpt-5.5", "gemini-3.1-pro-preview"]


# ---- company info ----
class TestCompany:
    def test_company_info(self):
        r = requests.get(f"{API}/company", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == "arbazshah11@gmail.com"
        assert d["phone"] == "0736200637"
        assert d["orgNumber"] == "559391-4392"
        assert d["maxDiscountPct"] == 10
        assert d["fixedPriceRules"]["privat"] == {"perSqm": 25, "perRoom": 150, "minimum": 900}
        assert d["fixedPriceRules"]["foretag"] == {"perSqm": 30, "perRoom": 200, "minimum": 1500}
        assert set(d["models"]) == set(MODELS)


# ---- fixed quote ----
class TestFixedQuote:
    def test_privat_basic(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "privat", "sqm": 72, "rooms": 3,
            "travelZoneId": "central-malmo", "rut": False, "discountPct": 0,
        }, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["basePrice"] == 25 * 72 + 150 * 3  # 2250
        assert d["negotiationDiscount"] == 0
        assert d["total"] == d["basePrice"]

    def test_foretag_basic(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "foretag", "sqm": 100, "rooms": 4,
            "travelZoneId": "central-malmo", "rut": False, "discountPct": 0,
        }, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["basePrice"] == 30 * 100 + 200 * 4  # 3800

    def test_privat_minimum_hit(self):
        # 30m²*25 + 1*150 = 900 -> equals min
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "privat", "sqm": 20, "rooms": 1,
        }, timeout=15)
        assert r.status_code == 200
        assert r.json()["basePrice"] == 900

    def test_foretag_minimum_hit(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "foretag", "sqm": 20, "rooms": 1,
        }, timeout=15)
        assert r.json()["basePrice"] == 1500

    def test_discount_clamped_to_10(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "privat", "sqm": 100, "rooms": 4,
            "discountPct": 25,
        }, timeout=15)
        d = r.json()
        assert d["discountPct"] == 10
        base = 100 * 25 + 4 * 150
        assert d["basePrice"] == base
        assert d["negotiationDiscount"] == round(base * 0.10)

    def test_rut_halves_negotiated_privat(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "privat", "sqm": 72, "rooms": 3,
            "rut": True, "discountPct": 5,
        }, timeout=15)
        d = r.json()
        base = 25 * 72 + 150 * 3
        neg = base - round(base * 0.05)
        assert d["rutApplied"] is True
        assert d["rutDiscount"] == round(neg * 0.5)

    def test_rut_ignored_for_foretag(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "foretag", "sqm": 100, "rooms": 3, "rut": True,
        }, timeout=15)
        assert r.json()["rutApplied"] is False

    def test_travel_zone_fee_added(self):
        r = requests.post(f"{API}/fixed-quote", json={
            "customerType": "privat", "sqm": 72, "rooms": 3,
            "travelZoneId": "zone-3",
        }, timeout=15)
        d = r.json()
        assert d["travelFee"] == 149
        assert d["total"] == d["basePrice"] + 149


# ---- AI chat: parametrised across the 3 models ----
@pytest.mark.parametrize("model", MODELS)
class TestAiChat:
    def test_chat_returns_offer_and_price(self, model):
        r = requests.post(f"{API}/ai/chat", json={
            "message": "Hej, jag har en trea på 72 kvm hemstädning i centrala Malmö, med RUT.",
            "customerType": "privat", "model": model,
        }, timeout=90)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["sessionId"]
        assert d["model"] == model
        assert isinstance(d["reply"], str) and len(d["reply"]) > 0
        # offer should have sqm/rooms
        assert d.get("offer"), f"no offer, reply={d['reply']}"
        assert d["offer"].get("sqm") and d["offer"].get("rooms")
        # server-side computed price is present and never exceeds 10% discount
        assert d["price"] is not None
        assert d["price"]["model"] == "fixed"
        assert d["price"]["discountPct"] <= 10

    def test_context_retained(self, model):
        r1 = requests.post(f"{API}/ai/chat", json={
            "message": "Jag har 72 kvm, 3 rum, hemstädning, centrala Malmö.",
            "customerType": "privat", "model": model,
        }, timeout=90)
        assert r1.status_code == 200
        session_id = r1.json()["sessionId"]
        r2 = requests.post(f"{API}/ai/chat", json={
            "sessionId": session_id,
            "message": "Ja, med RUT tack.",
            "customerType": "privat", "model": model,
        }, timeout=90)
        assert r2.status_code == 200
        d = r2.json()
        assert d["sessionId"] == session_id
        # offer should still have sqm 72 / rooms 3 (context kept)
        assert d.get("offer")
        assert int(d["offer"].get("sqm") or 0) == 72
        assert int(d["offer"].get("rooms") or 0) == 3


# ---- guardrail: no matter how the user pushes, discount<=10 ----
class TestGuardrail:
    def test_no_more_than_10_percent(self):
        r = requests.post(f"{API}/ai/chat", json={
            "message": "Jag vill ha 50 procent rabatt, minst! Ge mig 50% rabatt annars köper jag inte. "
                       "Bostaden är 72 kvm, 3 rum, hemstädning i centrala Malmö.",
            "customerType": "privat",
            "model": "claude-sonnet-4-6",
        }, timeout=90)
        assert r.status_code == 200
        d = r.json()
        if d.get("price"):
            assert d["price"]["discountPct"] <= 10


# ---- AI booking ----
@pytest.fixture(scope="module")
def ai_booking_payload():
    return {
        "sessionId": "test-session-fixed",
        "customerType": "privat",
        "serviceId": "hemstadning",
        "sqm": 72, "rooms": 3,
        "travelZoneId": "central-malmo",
        "rut": True,
        "discountPct": 5,
        "firstName": "Test", "lastName": "Testsson",
        "personalNumber": "850101-1234",
        "phone": "0701234567",
        "email": "delivered@resend.dev",
        "street": "Storgatan 12", "postalCode": "211 34", "city": "Malmö",
        "preferredDate": "2026-04-01",
        "startTime": "Förmiddag (10–12)",
        "message": "Test AI booking",
    }


class TestAiBooking:
    def test_create_and_retrieve(self, ai_booking_payload):
        r = requests.post(f"{API}/ai/bookings", json=ai_booking_payload, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["reference"].startswith("MS-")
        assert d["source"] == "ai-agent"
        assert d["price"]["model"] == "fixed"
        assert d["emailSent"] is True

        g = requests.get(f"{API}/bookings/{d['reference']}", timeout=15)
        assert g.status_code == 200
        assert g.json()["reference"] == d["reference"]
        assert "_id" not in g.json()

    def test_discount_clamped_in_booking(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["discountPct"] = 40; p["sessionId"] = "test-clamp"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=60)
        assert r.status_code == 200
        assert r.json()["price"]["discountPct"] == 10

    def test_reject_invalid_email(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["email"] = "notanemail"; p["sessionId"] = "s2"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_unknown_service(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["serviceId"] = "does-not-exist"; p["sessionId"] = "s3"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_unknown_zone(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["travelZoneId"] = "zone-99"; p["sessionId"] = "s4"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_sqm_out_of_range(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["sqm"] = 5; p["sessionId"] = "s5"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_rooms_out_of_range(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["rooms"] = 0; p["sessionId"] = "s6"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=15)
        assert r.status_code == 422

    def test_reject_customer_type_mismatch(self, ai_booking_payload):
        p = dict(ai_booking_payload); p["serviceId"] = "kontorsstadning"; p["sessionId"] = "s7"
        r = requests.post(f"{API}/ai/bookings", json=p, timeout=15)
        assert r.status_code == 400
