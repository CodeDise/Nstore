"""
NOHARA STORE BOT — Payment helpers (nohara_bot/payments.py)

* OxaPay  : create invoice (Merchant API) + verify the webhook HMAC (sha512, header "HMAC").
* UPI     : manual verification by the store owner (see handlers/) and an OPTIONAL
            signed webhook (HMAC-SHA256, header "X-Signature") for UPI aggregators.
"""

import hashlib
import hmac
import logging
from decimal import Decimal
from typing import Any, Dict, Optional

import aiohttp

from nohara_bot.config import OXAPAY_SANDBOX

log = logging.getLogger("nohara.payments")

OXAPAY_INVOICE_URL = "https://api.oxapay.com/v1/payment/invoice"


async def create_oxapay_invoice(
    merchant_api_key: str,
    amount_usd: Decimal,
    order_id: str,
    callback_url: str,
    description: str,
) -> Optional[Dict[str, Any]]:
    """Returns {"track_id":..., "payment_url":..., "expired_at":...} or None on failure."""
    payload = {
        "amount": float(amount_usd),
        "currency": "USD",
        "lifetime": 60,  # minutes
        "order_id": order_id,
        "callback_url": callback_url,
        "description": description[:100],
        "sandbox": OXAPAY_SANDBOX,
    }
    headers = {"merchant_api_key": merchant_api_key, "Content-Type": "application/json"}
    try:
        timeout = aiohttp.ClientTimeout(total=20)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(OXAPAY_INVOICE_URL, json=payload, headers=headers) as resp:
                body = await resp.json(content_type=None)
        data = (body or {}).get("data") or {}
        if data.get("payment_url") and data.get("track_id"):
            return data
        log.warning("OxaPay invoice rejected: %s", body)
    except Exception:
        log.exception("OxaPay invoice request failed")
    return None


def verify_oxapay_hmac(merchant_api_key: str, raw_body: bytes, header_value: str) -> bool:
    """
    OxaPay signs the RAW body with HMAC-SHA512 using the merchant API key and sends it
    in the 'HMAC' header. A MISSING header is treated as INVALID (never skip this check).
    """
    if not merchant_api_key or not header_value:
        return False
    calculated = hmac.new(merchant_api_key.encode(), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(calculated.lower(), header_value.strip().lower())


def verify_sha256_signature(secret: str, raw_body: bytes, header_value: str) -> bool:
    """Generic HMAC-SHA256 check used by the optional UPI webhook."""
    if not secret or not header_value:
        return False
    calculated = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(calculated.lower(), header_value.strip().lower())
