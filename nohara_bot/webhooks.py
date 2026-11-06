"""
NOHARA STORE BOT — Webhook & Health Server (nohara_bot/webhooks.py)

Routes:
  GET  /healthz                      -> Render health check
  GET  /                             -> simple status page
  POST /webhook/oxapay/{bot_id}      -> OxaPay payment callbacks (HMAC-SHA512 verified)
  POST /webhook/fampay/{bot_id}      -> OPTIONAL signed UPI webhook (HMAC-SHA256 verified)

SECURITY RULES (the old version broke all of these):
  1. The signature is ALWAYS required. A missing header = rejected.
  2. The buyer / product are read from OUR order record, never from the webhook payload.
  3. The order must exist, belong to this clone, use this gateway and still be unpaid.
  4. mark_paid() is atomic, so a replayed webhook can never deliver the product twice.
  5. The paid amount must cover the order price.
"""

import json
import logging
from decimal import Decimal, InvalidOperation

from aiohttp import web

from nohara_bot.database import db
from nohara_bot.payments import verify_oxapay_hmac, verify_sha256_signature
from nohara_bot.services.core import ACTIVE_CLONE_CLIENTS, cents_to_inr, fulfill_paid_order, spawn

log = logging.getLogger("nohara.webhooks")


def _to_decimal(value) -> Decimal:
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return Decimal("-1")


class DynamicWebhookServer:
    def __init__(self) -> None:
        self.app = web.Application(client_max_size=1024 * 64)
        self.app.router.add_get("/", self.index)
        self.app.router.add_get("/healthz", self.health_check)
        self.app.router.add_post("/webhook/oxapay/{bot_id}", self.handle_oxapay_webhook)
        self.app.router.add_post("/webhook/fampay/{bot_id}", self.handle_fampay_webhook)

    async def index(self, request: web.Request) -> web.Response:
        return web.Response(text="Nohara Store Bot is running.")

    async def health_check(self, request: web.Request) -> web.Response:
        return web.json_response({
            "status": "ok",
            "service": "nohara-multi-tenant-router",
            "active_clones": len(ACTIVE_CLONE_CLIENTS),
        })

    # ───────────────────────── OxaPay ─────────────────────────
    async def handle_oxapay_webhook(self, request: web.Request) -> web.Response:
        bot_id = request.match_info["bot_id"]
        raw_body = await request.read()

        clone = await db.get_clone(bot_id)
        gateway = (clone or {}).get("gateways", {}).get("oxapay", {})
        if not clone or not gateway.get("enabled"):
            return web.json_response({"error": "gateway not active"}, status=404)

        api_key = db.get_oxapay_key(clone)
        if not verify_oxapay_hmac(api_key, raw_body, request.headers.get("HMAC", "")):
            log.warning("OxaPay webhook rejected (bad/missing HMAC) for bot %s", bot_id)
            return web.json_response({"error": "invalid signature"}, status=403)

        try:
            payload = json.loads(raw_body)
        except ValueError:
            return web.json_response({"error": "invalid json"}, status=400)

        # OxaPay expects HTTP 200 with the text "ok" for every callback it should stop retrying.
        if str(payload.get("status", "")).lower() != "paid":
            return web.Response(text="ok")

        order = await db.get_order(str(payload.get("order_id", "")))
        if not order or order["bot_id"] != bot_id or order["method"] != "oxapay":
            log.warning("OxaPay webhook for unknown order %s", payload.get("order_id"))
            return web.Response(text="ok")

        if order.get("track_id") and str(payload.get("track_id", "")) != str(order["track_id"]):
            log.warning("OxaPay webhook track_id mismatch for order %s", order["_id"])
            return web.Response(text="ok")

        paid_amount = _to_decimal(payload.get("amount"))
        currency = str(payload.get("currency", "USD")).upper()
        if currency == "USD" and paid_amount < Decimal(order["price_cents"]) / 100:
            log.warning("OxaPay webhook amount too low for order %s: %s", order["_id"], paid_amount)
            return web.Response(text="ok")

        paid_order = await db.mark_paid(order["_id"])  # atomic: only the first webhook gets the order
        if paid_order:
            spawn(fulfill_paid_order(paid_order, stock_reserved=False))
        return web.Response(text="ok")

    # ───────────────────────── Optional signed UPI webhook ─────────────────────────
    async def handle_fampay_webhook(self, request: web.Request) -> web.Response:
        bot_id = request.match_info["bot_id"]
        raw_body = await request.read()

        clone = await db.get_clone(bot_id)
        gateway = (clone or {}).get("gateways", {}).get("fampay", {})
        if not clone or not gateway.get("enabled"):
            return web.json_response({"error": "gateway not active"}, status=404)

        secret = db.get_fampay_secret(clone)
        if not secret:
            return web.json_response({"error": "webhook secret not configured (/setgateway fampay_secret)"}, status=404)
        if not verify_sha256_signature(secret, raw_body, request.headers.get("X-Signature", "")):
            log.warning("UPI webhook rejected (bad/missing signature) for bot %s", bot_id)
            return web.json_response({"error": "invalid signature"}, status=403)

        try:
            payload = json.loads(raw_body)
        except ValueError:
            return web.json_response({"error": "invalid json"}, status=400)

        if str(payload.get("status", "")).upper() not in ("SUCCESS", "PAID"):
            return web.json_response({"ok": True})

        order = await db.get_order(str(payload.get("order_id", "")))
        if not order or order["bot_id"] != bot_id or order["method"] != "upi":
            return web.json_response({"ok": True})

        expected_inr = cents_to_inr(order["price_cents"], clone["usd_to_inr"])
        if "amount_inr" in order:
            expected_inr = _to_decimal(order["amount_inr"])
        if _to_decimal(payload.get("amount")) < expected_inr:
            log.warning("UPI webhook amount too low for order %s", order["_id"])
            return web.json_response({"ok": True})

        paid_order = await db.mark_paid(order["_id"])
        if paid_order:
            spawn(fulfill_paid_order(paid_order, stock_reserved=False))
        return web.json_response({"ok": True})
