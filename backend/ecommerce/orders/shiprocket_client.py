import requests
from django.core.cache import cache
from django.conf import settings

# Shiprocket API Endpoints
AUTH_URL = "https://apiv2.shiprocket.in/v1/external/auth/login"
CREATE_PICKUP_URL = "https://apiv2.shiprocket.in/v1/external/settings/company/addpickup"
CREATE_ORDER_URL = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc"
RATE_CALCULATOR_URL = "https://apiv2.shiprocket.in/v1/external/courier/serviceability"



# ---------------- AUTH ---------------- #
def get_shiprocket_token(force_refresh=False):
    """Get cached Shiprocket token or fetch new one."""
    if not force_refresh:
        try:
            token = cache.get("shiprocket_token")
            if token:
                return token
        except Exception:
            # Redis unavailable - proceed without cache
            pass

    # Request new token
    data = {
        "email": settings.SHIPROCKET_API_EMAIL,
        "password": settings.SHIPROCKET_API_PASSWORD,
    }
    resp = requests.post(AUTH_URL, json=data, timeout=15)
    resp.raise_for_status()

    token = resp.json().get("token")
    if not token:
        raise Exception("Failed to fetch Shiprocket token")

    # cache for 9 days (token valid 10 days)
    try:
        cache.set("shiprocket_token", token, 9 * 24 * 3600)
    except Exception:
        # Redis unavailable - continue without caching
        pass
    return token


def auth_headers(force_refresh=False):
    return {
        "Authorization": f"Bearer {get_shiprocket_token(force_refresh=force_refresh)}",
        "Content-Type": "application/json",
    }

# ---------------- GENERIC API CALL ---------------- #
def call_shiprocket_api(url, payload=None, method="POST", params=None):
    """Wrapper to call Shiprocket API with auto token refresh on 401"""
    headers = auth_headers()
    resp = requests.request(
        method, url, json=payload, params=params, headers=headers, timeout=20
    )

    if resp.status_code == 401:
        # token expired → refresh and retry once
        headers = auth_headers(force_refresh=True)
        resp = requests.request(
            method, url, json=payload, params=params, headers=headers, timeout=20
        )

    if resp.status_code == 422:
        return {"error": True, "details": resp.json()}

    resp.raise_for_status()
    return resp.json()

# ---------------- SPECIFIC FUNCTIONS ---------------- #
def create_pickup_location(pickup_payload):
    """
    Create a pickup location in Shiprocket.
    pickup_payload should include:
      - pickup_location (unique short name)
      - name (warehouse/vendor name)
      - email
      - phone
      - address
      - city
      - state
      - country
      - pin_code
    """
    return call_shiprocket_api(CREATE_PICKUP_URL, payload=pickup_payload, method="POST")


def create_shiprocket_order(order_payload):
    """Create an order in Shiprocket"""
    return call_shiprocket_api(CREATE_ORDER_URL, payload=order_payload, method="POST")


def calculate_shipping_rate(payload):
    """
    Calculate shipping rate & delivery time.
    params should include:
      - pickup_postcode
      - delivery_postcode
      - weight
      - cod (1 for COD, 0 for prepaid)
      - declared_value (for insurance)
    """
    return call_shiprocket_api(RATE_CALCULATOR_URL, method="GET", payload =payload)

def create_shiprocket_order(order_payload):
    """
    Create an order in Shiprocket.
    order_payload should include:
      - order_id
      - order_date (YYYY-MM-DD HH:MM)
      - pickup_location
      - billing_customer_name
      - billing_last_name
      - billing_address
      - billing_city
      - billing_state
      - billing_country
      - billing_pincode
      - billing_email
      - billing_phone
      - order_items (list of dicts)
      - payment_method ("Prepaid" or "COD")
      - sub_total
      - length, breadth, height, weight
    """
    return call_shiprocket_api(CREATE_ORDER_URL, payload=order_payload, method="POST")


def track_shiprocket_order(awb_code):
    """
    Track order shipment status by AWB code.
    Example AWB: 788830567028
    """
    TRACK_URL = f"https://apiv2.shiprocket.in/v1/external/courier/track/awb/{awb_code}"
    response = call_shiprocket_api(TRACK_URL, method="GET")
    return response