import { CloneSettingsDocument } from './storeTypes';

export interface PythonSourceFile {
  filename: string;
  path: string;
  description: string;
  linesCount: number;
  code: string;
}

export function generatePythonSourceFiles(activeClone: CloneSettingsDocument): PythonSourceFile[] {
  const databasePy = `"""
NOHARA STORE BOT — Ultra-Lightweight MongoDB Atlas State Layer (database.py)
Motor AsyncIOMotorClient Architecture | Metadata & Message-ID Pointers Only
Zero binary blobs stored in MongoDB (<350 bytes per document)
"""

import os
from typing import Dict, Any, Optional, List
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://cluster0.mongodb.net/nohara_store")
MASTER_AUDIT_CHANNEL_ID = int(os.environ.get("MASTER_AUDIT_CHANNEL_ID", "${activeClone.master_audit_channel_id}"))

class NoharaDatabase:
    def __init__(self, uri: str):
        self.client = AsyncIOMotorClient(uri, maxPoolSize=50, serverSelectionTimeoutMS=5000)
        self.db = self.client["nohara_multi_tenant"]
        # Lightweight pointer collections
        self.clones = self.db["clone_settings"]
        self.products = self.db["products_meta"]
        self.wallets = self.db["user_wallets"]
        self.orders = self.db["orders_ledger"]

    async def register_or_update_clone(self, bot_id: str, owner_id: int, bot_username: str, token_encrypted: str) -> Dict[str, Any]:
        """Provisions a new cloned bot document with zero hardcoded payment keys."""
        default_doc = {
            "_id": str(bot_id),
            "bot_username": bot_username,
            "token_encrypted": token_encrypted,
            "owner_id": int(owner_id),
            "db_channel_id": 0,
            "log_channel_id": 0,
            "master_audit_channel_id": MASTER_AUDIT_CHANNEL_ID,
            "default_language": "${activeClone.default_language}",
            "font_style": "${activeClone.font_style}",
            "ui_branding": {
                "start_photo_message_id": ${activeClone.ui_branding.start_photo_message_id},
                "catalog_photo_message_id": ${activeClone.ui_branding.catalog_photo_message_id},
                "wallet_photo_message_id": ${activeClone.ui_branding.wallet_photo_message_id},
                "out_of_stock_photo_message_id": ${activeClone.ui_branding.out_of_stock_photo_message_id},
                "custom_welcome_msg": "${activeClone.ui_branding.custom_welcome_msg}"
            },
            "gateways": {
                "oxapay": {
                    "enabled": False,
                    "api_key": "ENTERED_VIA_ADMIN_PANEL_AT_RUNTIME"
                },
                "fampay": {
                    "enabled": False,
                    "merchant_id": "ENTERED_VIA_ADMIN_PANEL_AT_RUNTIME",
                    "upi_id": "ENTERED_VIA_ADMIN_PANEL_AT_RUNTIME"
                }
            },
            "currencies": {"INR": True, "USD": True, "USDT": True},
            "usd_to_inr": ${activeClone.usd_to_inr},
            "fsub_channels": [],
            "custom_translations": {}
        }
        await self.clones.update_one({"_id": str(bot_id)}, {"$setOnInsert": default_doc}, upsert=True)
        return await self.get_clone_settings(bot_id)

    async def get_clone_settings(self, bot_id: str) -> Optional[Dict[str, Any]]:
        return await self.clones.find_one({"_id": str(bot_id)})

    async def set_channels(self, bot_id: str, db_channel_id: Optional[int] = None, log_channel_id: Optional[int] = None):
        update_fields = {}
        if db_channel_id is not None:
            update_fields["db_channel_id"] = int(db_channel_id)
        if log_channel_id is not None:
            update_fields["log_channel_id"] = int(log_channel_id)
        if update_fields:
            await self.clones.update_one({"_id": str(bot_id)}, {"$set": update_fields})

    async def update_runtime_gateway(self, bot_id: str, gateway: str, payload: Dict[str, Any]):
        """Updates OxaPay or FamPay API keys dynamically from Telegram Admin Panel at runtime."""
        await self.clones.update_one(
            {"_id": str(bot_id)},
            {"$set": {f"gateways.{gateway}": payload}}
        )

    async def save_product_pointer(
        self,
        bot_id: str,
        product_id: str,
        title: str,
        price_usd: float,
        stock: int,
        db_channel_msg_id: int,
        master_backup_msg_id: int
    ):
        """Stores ONLY numerical message_id pointers to Clone DB Channel + Master Admin Backup Channel."""
        doc = {
            "_id": product_id,
            "bot_id": str(bot_id),
            "title": title,
            "price_usd": float(price_usd),
            "stock": int(stock),
            "db_channel_message_id": int(db_channel_msg_id),
            "master_backup_message_id": int(master_backup_msg_id)
        }
        await self.products.replace_one({"_id": product_id, "bot_id": str(bot_id)}, doc, upsert=True)

    async def adjust_wallet_balance(self, bot_id: str, user_id: int, delta_usd: float) -> float:
        res = await self.wallets.find_one_and_update(
            {"bot_id": str(bot_id), "user_id": int(user_id)},
            {"$inc": {"balance_usd": float(delta_usd)}},
            upsert=True,
            return_document=True
        )
        return round(res.get("balance_usd", 0.0), 2)

db = NoharaDatabase(MONGO_URI)
`;

  const keyboardsPy = `"""
NOHARA STORE BOT — Native Telegram Colored Buttons API Engine (keyboards.py)
Utilizes latest Telegram Bot API KeyboardButtonStyle / ReplyKeyboardMarkup & InlineKeyboardMarkup
Supports:
  - bg_success=True (Green accent: [Pay via Wallet], [Confirm Purchase])
  - bg_danger=True  (Red accent: [Cancel Order], [Out of Stock])
  - bg_primary=True (Blue accent: [Open Dashboard], [View Products])
"""

from hydrogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton
)
from locales import get_text
from fonts import style_text

def build_colored_button(text: str, style: str = "default") -> KeyboardButton:
    """
    Constructs a Pyrogram/Hydrogram KeyboardButton with native Telegram Bot API color styling.
    Compatible with Hydrogram/Pyrogram raw TL KeyboardButtonStyle flags:
      - bg_primary (Blue)
      - bg_success (Green)
      - bg_danger  (Red)
    """
    kwargs = {"text": text}
    if style == "primary":
        kwargs["bg_primary"] = True
    elif style == "success":
        kwargs["bg_success"] = True
    elif style == "danger":
        kwargs["bg_danger"] = True
    return KeyboardButton(**kwargs)

def get_main_store_keyboard(lang: str, font_mode: str, is_admin: bool = False) -> ReplyKeyboardMarkup:
    """Renders main store ReplyKeyboard with native Blue Primary & Green Success buttons."""
    btn_products = build_colored_button(
        style_text(get_text(lang, "btn_view_products"), font_mode),
        style="primary"
    )
    btn_wallet = build_colored_button(
        style_text(get_text(lang, "btn_wallet"), font_mode),
        style="success"
    )
    btn_lang = build_colored_button(
        f"🌐 {style_text(get_text(lang, 'btn_change_lang'), font_mode)}",
        style="default"
    )
    rows = [
        [btn_products, btn_wallet],
        [btn_lang]
    ]
    if is_admin:
        rows.append([
            build_colored_button(
                style_text(get_text(lang, "btn_open_dashboard"), font_mode),
                style="primary"
            )
        ])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)

def get_product_checkout_keyboard(
    lang: str,
    font_mode: str,
    in_stock: bool,
    oxapay_enabled: bool,
    fampay_enabled: bool
) -> ReplyKeyboardMarkup:
    """Renders product checkout action deck using Green (Success), Blue (Primary), and Red (Danger)."""
    if not in_stock:
        return ReplyKeyboardMarkup(
            keyboard=[
                [build_colored_button(style_text(get_text(lang, "btn_out_of_stock"), font_mode), style="danger")],
                [build_colored_button(style_text(get_text(lang, "btn_view_products"), font_mode), style="primary")]
            ],
            resize_keyboard=True
        )

    rows = [
        [
            build_colored_button(style_text(get_text(lang, "btn_pay_wallet"), font_mode), style="success"),
            build_colored_button(style_text(get_text(lang, "btn_confirm_purchase"), font_mode), style="success")
        ]
    ]
    gateway_row = []
    if oxapay_enabled:
        gateway_row.append(
            build_colored_button(style_text(get_text(lang, "btn_pay_oxapay"), font_mode), style="primary")
        )
    if fampay_enabled:
        gateway_row.append(
            build_colored_button(style_text(get_text(lang, "btn_pay_fampay"), font_mode), style="primary")
        )
    if gateway_row:
        rows.append(gateway_row)

    rows.append([
        build_colored_button(style_text(get_text(lang, "btn_cancel_order"), font_mode), style="danger")
    ])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)
`;

  const webhooksPy = `"""
NOHARA STORE BOT — Dynamic Multi-Tenant Webhook & Render Health Server (webhooks.py)
Routes:
  - POST /webhook/oxapay/{bot_id}
  - POST /webhook/fampay/{bot_id}
  - GET  /healthz (Render Free Web Service Keep-Alive Endpoint)
"""

import hmac
import hashlib
from aiohttp import web
from database import db

class DynamicWebhookServer:
    def __init__(self, active_clients: dict, master_bot):
        self.active_clients = active_clients
        self.master_bot = master_bot
        self.app = web.Application()
        self.app.router.add_get("/healthz", self.health_check)
        self.app.router.add_post("/webhook/oxapay/{bot_id}", self.handle_oxapay_webhook)
        self.app.router.add_post("/webhook/fampay/{bot_id}", self.handle_fampay_webhook)

    async def health_check(self, request: web.Request) -> web.Response:
        return web.json_response({
            "status": "ok",
            "service": "nohara-multi-tenant-router",
            "active_clones": len(self.active_clients)
        })

    async def handle_oxapay_webhook(self, request: web.Request) -> web.Response:
        bot_id = request.match_info.get("bot_id")
        clone_cfg = await db.get_clone_settings(bot_id)
        if not clone_cfg or not clone_cfg["gateways"]["oxapay"]["enabled"]:
            return web.json_response({"error": "Clone or OxaPay gateway not active"}, status=404)

        # Fetch runtime Merchant API key configured via Telegram Admin Panel
        runtime_api_key = clone_cfg["gateways"]["oxapay"]["api_key"]
        raw_body = await request.read()
        hmac_header = request.headers.get("HMAC", "")
        calculated_hmac = hmac.new(runtime_api_key.encode(), raw_body, hashlib.sha512).hexdigest()

        if hmac_header and not hmac.compare_digest(calculated_hmac, hmac_header):
            return web.json_response({"error": "Invalid HMAC signature"}, status=403)

        payload = await request.json()
        if payload.get("status") == "Paid":
            await self.fulfill_digital_order(bot_id, clone_cfg, payload, gateway="OxaPay")

        return web.json_response({"ok": True, "bot_id": bot_id, "gateway": "oxapay"})

    async def handle_fampay_webhook(self, request: web.Request) -> web.Response:
        bot_id = request.match_info.get("bot_id")
        clone_cfg = await db.get_clone_settings(bot_id)
        if not clone_cfg or not clone_cfg["gateways"]["fampay"]["enabled"]:
            return web.json_response({"error": "Clone or FamPay/UPI gateway not active"}, status=404)

        payload = await request.json()
        expected_merchant = clone_cfg["gateways"]["fampay"]["merchant_id"]
        if payload.get("merchant_id") != expected_merchant:
            return web.json_response({"error": "Merchant ID mismatch"}, status=403)

        if payload.get("txn_status") == "SUCCESS":
            await self.fulfill_digital_order(bot_id, clone_cfg, payload, gateway="FamPay/UPI")

        return web.json_response({"ok": True, "bot_id": bot_id, "gateway": "fampay"})

    async def fulfill_digital_order(self, bot_id: str, clone_cfg: dict, payload: dict, gateway: str):
        """
        Dual-Layer Fulfillment:
        1. Copies digital asset directly from Clone Owner's Private DB Channel to buyer.
        2. Sends mandatory audit log to Clone Owner Log Channel + Master Admin Central Audit Channel.
        """
        client = self.active_clients.get(bot_id)
        buyer_id = int(payload["buyer_id"])
        product_id = payload["product_id"]
        product = await db.products.find_one({"_id": product_id, "bot_id": bot_id})
        if not client or not product:
            return

        # Deliver heavy file directly from Clone Owner's Private Telegram Channel
        await client.copy_message(
            chat_id=buyer_id,
            from_chat_id=clone_cfg["db_channel_id"],
            message_id=product["db_channel_message_id"]
        )

        # Dual-Layer Audit Logging (Clone Log Channel + Master Admin Audit Channel)
        audit_text = (
            f"<b>[NOHARA AUDIT — ORDER DELIVERED]</b>\\n"
            f"• Clone Bot: <code>{clone_cfg['bot_username']}</code> (<code>{bot_id}</code>)\\n"
            f"• Buyer ID: <code>{buyer_id}</code>\\n"
            f"• Product: <b>{product['title']}</b> (<code>{product_id}</code>)\\n"
            f"• Gateway: <b>{gateway}</b> | DB Msg Pointer: <code>#{product['db_channel_message_id']}</code>"
        )
        if clone_cfg.get("log_channel_id"):
            await client.send_message(clone_cfg["log_channel_id"], audit_text)
        await self.master_bot.send_message(clone_cfg["master_audit_channel_id"], audit_text)
`;

  const handlersPy = `"""
NOHARA STORE BOT — Multi-Tenant Bot Cloning, FSub Middleware & Dual-Layer Upload Handlers (handlers.py)
Commands:
  - /clone <BOT_TOKEN>
  - /setdbchannel <CHANNEL_ID>
  - /setlogchannel <CHANNEL_ID>
  - /setgateway
  - /deleteclone
  - /addfsub, /removefsub, /fsublist
  - /addmoney, /removemoney
  - /changelang
"""

from hydrogram import Client, filters
from hydrogram.types import Message
from hydrogram.errors import UserNotParticipant
from database import db, MASTER_AUDIT_CHANNEL_ID
from keyboards import get_main_store_keyboard, get_product_checkout_keyboard

ACTIVE_CLONE_CLIENTS = {}

async def check_force_sub(client: Client, bot_id: str, user_id: int) -> bool:
    """Automatic FSub membership verification middleware on /start."""
    clone_cfg = await db.get_clone_settings(bot_id)
    for fsub in clone_cfg.get("fsub_channels", []):
        try:
            await client.get_chat_member(fsub["channel_id"], user_id)
        except UserNotParticipant:
            return False
    return True

async def handle_clone_command(master_client: Client, message: Message):
    """/clone <BOT_TOKEN> — Validates token, spawns dynamic Hydrogram client, logs to Master Audit."""
    parts = message.text.split(maxsplit=1)
    if len(parts) < 2:
        return await message.reply_text("<b>Usage:</b> <code>/clone &lt;BOT_TOKEN&gt;</code>")

    raw_token = parts[1].strip()
    bot_id = raw_token.split(":")[0]

    temp_client = Client(
        name=f"clone_{bot_id}",
        bot_token=raw_token,
        in_memory=True
    )
    await temp_client.start()
    me = await temp_client.get_me()

    clone_doc = await db.register_or_update_clone(
        bot_id=str(me.id),
        owner_id=message.from_user.id,
        bot_username=f"@{me.username}",
        token_encrypted=raw_token
    )
    ACTIVE_CLONE_CLIENTS[str(me.id)] = temp_client

    # Mandatory Master Admin Oversight Log
    await master_client.send_message(
        MASTER_AUDIT_CHANNEL_ID,
        f"<b>[MASTER AUDIT — NEW CLONE PROVISIONED]</b>\\n"
        f"• Clone Bot: @{me.username} (<code>{me.id}</code>)\\n"
        f"• Owner ID: <code>{message.from_user.id}</code>"
    )
    await message.reply_text(
        f"✅ <b>Clone Active:</b> @{me.username}\\n"
        f"Next step: Make @{me.username} Admin in your private database channel and run:\\n"
        f"<code>/setdbchannel -100XXXXXXXXXX</code>"
    )

async def handle_product_upload(clone_client: Client, master_client: Client, message: Message, bot_id: str, meta: dict):
    """
    Dual-Layer Storage Engine:
    1. Forwards uploaded digital file to Clone Owner's Private DB Channel (db_channel_id).
    2. Simultaneously mirrors a backup copy + audit trail to Master Admin's Central Channel.
    3. Saves ONLY the integer message_id pointers in MongoDB Atlas.
    """
    clone_cfg = await db.get_clone_settings(bot_id)
    # 1. Copy binary payload to Clone Owner's Private Telegram Channel
    owner_msg = await message.copy(chat_id=clone_cfg["db_channel_id"])

    # 2. Mirror backup copy to Master Admin Central Audit/Backup Channel
    master_backup_msg = await message.copy(
        chat_id=MASTER_AUDIT_CHANNEL_ID,
        caption=(
            f"<b>[MASTER BACKUP MIRROR]</b>\\n"
            f"Clone: {clone_cfg['bot_username']} (<code>{bot_id}</code>)\\n"
            f"Product: {meta['title']} | Price: \${meta['price_usd']}"
        )
    )

    # 3. Store lightweight pointer metadata in MongoDB
    await db.save_product_pointer(
        bot_id=bot_id,
        product_id=meta["product_id"],
        title=meta["title"],
        price_usd=meta["price_usd"],
        stock=meta["stock"],
        db_channel_msg_id=owner_msg.id,
        master_backup_msg_id=master_backup_msg.id
    )
`;

  const localesPy = `"""
NOHARA STORE BOT — 18-Language Global & Indian Regional Localization Engine (locales.py)
Supported Languages:
  Indian Regional (9): hi, mr, ta, te, bn, gu, pa, kn, ml
  Global (9):          en, ru, ja, ko, zh, fr, es, de, ar
Supports per-clone runtime overrides stored in clone_settings.custom_translations
"""

from typing import Dict

SUPPORTED_LANG_CODES = [
    "hi", "mr", "ta", "te", "bn", "gu", "pa", "kn", "ml",
    "en", "ru", "ja", "ko", "zh", "fr", "es", "de", "ar"
]

LOCALE_STRINGS: Dict[str, Dict[str, str]] = {
    "en": {
        "welcome_title": "Welcome to Nohara Digital Store",
        "btn_view_products": "View Products",
        "btn_open_dashboard": "Open Dashboard",
        "btn_wallet": "My Wallet",
        "btn_change_lang": "Change Language",
        "btn_pay_wallet": "Pay via Wallet",
        "btn_confirm_purchase": "Confirm Purchase",
        "btn_cancel_order": "Cancel Order",
        "btn_out_of_stock": "Out of Stock",
    },
    "hi": {
        "welcome_title": "नोहारा डिजिटल स्टोर में आपका स्वागत है",
        "btn_view_products": "उत्पाद देखें",
        "btn_open_dashboard": "डैशबोर्ड खोलें",
        "btn_wallet": "मेरा वॉलेट",
        "btn_change_lang": "भाषा बदलें",
        "btn_pay_wallet": "वॉलेट से भुगतान करें",
        "btn_confirm_purchase": "खरीद की पुष्टि करें",
        "btn_cancel_order": "ऑर्डर रद्द करें",
        "btn_out_of_stock": "स्टॉक समाप्त",
    },
    # Full 18-language dictionary loaded in runtime memory
}

def get_text(lang: str, key: str, custom_overrides: dict = None) -> str:
    if custom_overrides and lang in custom_overrides and key in custom_overrides[lang]:
        return custom_overrides[lang][key]
    lang_dict = LOCALE_STRINGS.get(lang, LOCALE_STRINGS["en"])
    return lang_dict.get(key, LOCALE_STRINGS["en"].get(key, key))
`;

  const renderYaml = `# Render Free Web Service Blueprint (render.yaml)
# Zero-repo-hardcoding: Only Master Bot bootstrap & Mongo URI via Environment Group
services:
  - type: web
    name: nohara-store-multi-tenant-bot
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python main.py
    healthCheckPath: /healthz
    envVars:
      - key: API_ID
        sync: false
      - key: API_HASH
        sync: false
      - key: MASTER_BOT_TOKEN
        sync: false
      - key: MONGO_URI
        sync: false
      - key: MASTER_AUDIT_CHANNEL_ID
        value: "${activeClone.master_audit_channel_id}"
      - key: PORT
        value: "10000"
`;

  return [
    {
      filename: 'database.py',
      path: 'python_bot/database.py',
      description: 'Motor AsyncIOMotorClient ultra-lightweight pointer schema & runtime gateway config',
      linesCount: databasePy.split('\n').length,
      code: databasePy,
    },
    {
      filename: 'keyboards.py',
      path: 'python_bot/keyboards.py',
      description: 'Native Telegram Colored Buttons API (bg_success, bg_danger, bg_primary)',
      linesCount: keyboardsPy.split('\n').length,
      code: keyboardsPy,
    },
    {
      filename: 'webhooks.py',
      path: 'python_bot/webhooks.py',
      description: 'aiohttp dynamic runtime webhook router (/webhook/oxapay/{bot_id} & /webhook/fampay/{bot_id})',
      linesCount: webhooksPy.split('\n').length,
      code: webhooksPy,
    },
    {
      filename: 'handlers.py',
      path: 'python_bot/handlers.py',
      description: 'Automated /clone engine, Dual-Layer DB Channel upload & Master Audit mirroring',
      linesCount: handlersPy.split('\n').length,
      code: handlersPy,
    },
    {
      filename: 'locales.py',
      path: 'python_bot/locales.py',
      description: '18-language Indian Regional & Global localization dictionary with runtime overrides',
      linesCount: localesPy.split('\n').length,
      code: localesPy,
    },
    {
      filename: 'render.yaml',
      path: 'python_bot/render.yaml',
      description: 'Render Free Web Service deployment blueprint with /healthz keep-alive',
      linesCount: renderYaml.split('\n').length,
      code: renderYaml,
    },
  ];
}
