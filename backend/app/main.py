"""Algoritmi backend ilovasi.

Ishga tushirish (backend papkasida):
    .venv\\Scripts\\activate            (Linux/macOS: source .venv/bin/activate)
    uvicorn app.main:app --reload --port 8000

Bot polling rejimida ishlaydi, shuning uchun server bitta jarayonda (bitta worker) ishga tushiriladi.
"""

import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from . import bot as tg
from . import kirish
from .api import router
from .config import Sozlamalar, sozlamalar
from .db import Baza

log = logging.getLogger("algoritmi")
TOZALASH_ORALIGI = 600  # soniya


async def _davriy_tozalash(baza: Baza) -> None:
    while True:
        await asyncio.sleep(TOZALASH_ORALIGI)
        try:
            async with baza.sessiya() as s:
                await kirish.tozala(s)
        except Exception:
            log.exception("Tozalashda xato")


def ilova_yarat(sz: Sozlamalar | None = None) -> FastAPI:
    sz = sz or sozlamalar()

    @asynccontextmanager
    async def hayot(app: FastAPI) -> AsyncIterator[None]:
        baza = Baza(sz.database_url)
        await baza.jadvallarni_yarat()
        app.state.baza = baza
        app.state.bot = None

        bot_xizmati = None
        if sz.bot_yoqilgan and sz.telegram_bot_token:
            # Fonda ulanadi: Telegram vaqtincha javob bermasa ham server ishga tushaveradi.
            bot_xizmati = tg.BotXizmati(sz.telegram_bot_token.get_secret_value(), baza, sz.sayt_url)
            app.state.bot = bot_xizmati
        elif sz.bot_yoqilgan:
            log.warning("TELEGRAM_BOT_TOKEN berilmagan: Telegram orqali kirish o'chiq (backend/.env).")

        tozalash = asyncio.create_task(_davriy_tozalash(baza))
        try:
            yield
        finally:
            tozalash.cancel()
            with suppress(asyncio.CancelledError):
                await tozalash
            if bot_xizmati:
                await bot_xizmati.toxtat()
            await baza.yop()

    app = FastAPI(
        title="Algoritmi API",
        version="0.1.0",
        lifespan=hayot,
        # API hujjati faqat ishlab chiqishda kerak bo'lsa: /api/docs
        docs_url="/api/docs",
        redoc_url=None,
        openapi_url="/api/openapi.json",
    )
    app.state.sozlamalar = sz
    app.include_router(router)
    return app


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
app = ilova_yarat()
