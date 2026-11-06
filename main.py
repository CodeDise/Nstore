"""
NOHARA STORE BOT — Production Entrypoint (main.py)
Runs concurrent Hydrogram Master Bot + Dynamic Cloned Bot Pool + aiohttp Webhook & Health Server
Optimized for Render Free Web Service (Single-Process Event Loop)
"""

import os
import asyncio
from aiohttp import web
from hydrogram import Client, idle
from database import db
from webhooks import DynamicWebhookServer
from handlers import ACTIVE_CLONE_CLIENTS

API_ID = int(os.environ.get("API_ID", "123456"))
API_HASH = os.environ.get("API_HASH", "replace_via_render_env")
MASTER_BOT_TOKEN = os.environ.get("MASTER_BOT_TOKEN", "replace_via_render_env")
PORT = int(os.environ.get("PORT", "10000"))

async def boot_platform():
    master_bot = Client(
        name="nohara_master_bot",
        api_id=API_ID,
        api_hash=API_HASH,
        bot_token=MASTER_BOT_TOKEN,
        in_memory=True
    )
    await master_bot.start()

    # Boot all registered clones from lightweight MongoDB clone_settings
    async for clone_doc in db.clones.find({"status": "running"}):
        bot_id = clone_doc["_id"]
        token = clone_doc.get("token_encrypted")
        if token:
            c_client = Client(
                name=f"clone_{bot_id}",
                api_id=API_ID,
                api_hash=API_HASH,
                bot_token=token,
                in_memory=True
            )
            await c_client.start()
            ACTIVE_CLONE_CLIENTS[bot_id] = c_client

    # Start aiohttp Dynamic Webhook & Render Health Server
    webhook_server = DynamicWebhookServer(ACTIVE_CLONE_CLIENTS, master_bot)
    runner = web.AppRunner(webhook_server.app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", PORT)
    await site.start()

    await idle()
    await master_bot.stop()

if __name__ == "__main__":
    asyncio.run(boot_platform())
