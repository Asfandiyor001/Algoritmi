"""Bot profili kod orqali: nom, tavsiflar, buyruqlar menyusi va rasm.

Har ishga tushganda Telegram'dagi joriy holat bilan solishtiriladi va faqat farq qilgani yangilanadi:
- nom o'zgartirish Telegram'da qattiq cheklangan (kuniga bir necha marta);
- rasm har safar yangi fayl sifatida yuklanadi, shuning uchun u faqat fayl o'zgarganda qo'yiladi
  (qo'yilgan rasm xeshi backend/data/bot_profil.json da eslab qolinadi).
"""

import hashlib
import json
import logging
from pathlib import Path

from aiogram import Bot
from aiogram.types import BotCommand, BufferedInputFile, InputProfilePhotoStatic

from .config import BACKEND_PAPKA

log = logging.getLogger("algoritmi.bot")

NOM = "Algoritmi"

# "Bot nima qila oladi?" — bo'sh chatda ko'rinadi (≤ 512 belgi).
TAVSIF = (
    "🧠 Algoritmi — o'zbek tilidagi bepul interaktiv informatika platformasi.\n\n"
    "Kompyuter, internet va AI qanday ishlashini jonli sxemalarda ko'rasiz: "
    "avval taxmin qilasiz, keyin sinab ko'rasiz, oxirida qonuniyatni o'zingiz kashf etasiz.\n\n"
    "🔐 Bu bot orqali saytga parolsiz kirasiz. Telefon raqamingiz so'ralmaydi.\n\n"
    "Boshlash uchun saytdagi «Kirish» tugmasini bosing."
)

# Profil sahifasi va ulashilganda ko'rinadi (≤ 120 belgi).
QISQA_TAVSIF = "O'zbek tilidagi interaktiv informatika darslari. Saytga parolsiz, bir bosishda kirish."

BUYRUQLAR = [
    BotCommand(command="start", description="Botni ishga tushirish"),
    BotCommand(command="yordam", description="Bot qanday ishlaydi"),
]

RASM = Path(__file__).resolve().parent / "statik" / "bot-rasm.jpg"
HOLAT_FAYLI = BACKEND_PAPKA / "data" / "bot_profil.json"


def _holat() -> dict[str, str]:
    try:
        return json.loads(HOLAT_FAYLI.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _holatni_yoz(holat: dict[str, str]) -> None:
    HOLAT_FAYLI.parent.mkdir(parents=True, exist_ok=True)
    HOLAT_FAYLI.write_text(json.dumps(holat, ensure_ascii=False, indent=2), encoding="utf-8")


async def profilni_sozla(bot: Bot) -> None:
    """Xatolar logga yoziladi, bot va sayt ishlashda davom etadi."""
    ozgardi: list[str] = []

    async def qadam(nom: str, ish) -> None:  # type: ignore[no-untyped-def]
        try:
            if await ish():
                ozgardi.append(nom)
        except Exception as e:
            log.warning("Bot profili (%s) sozlanmadi: %s", nom, e)

    async def nom() -> bool:
        if (await bot.get_my_name()).name == NOM:
            return False
        return await bot.set_my_name(name=NOM)

    async def tavsif() -> bool:
        if (await bot.get_my_description()).description == TAVSIF:
            return False
        return await bot.set_my_description(description=TAVSIF)

    async def qisqa_tavsif() -> bool:
        if (await bot.get_my_short_description()).short_description == QISQA_TAVSIF:
            return False
        return await bot.set_my_short_description(short_description=QISQA_TAVSIF)

    async def buyruqlar() -> bool:
        joriy = [(b.command, b.description) for b in await bot.get_my_commands()]
        if joriy == [(b.command, b.description) for b in BUYRUQLAR]:
            return False
        return await bot.set_my_commands(BUYRUQLAR)

    async def rasm() -> bool:
        if not RASM.exists():
            return False
        baytlar = RASM.read_bytes()
        xesh = hashlib.sha256(baytlar).hexdigest()
        holat = _holat()
        kalit = f"rasm:{bot.id}"
        if holat.get(kalit) == xesh:
            return False
        ok = await bot.set_my_profile_photo(
            photo=InputProfilePhotoStatic(photo=BufferedInputFile(baytlar, filename="algoritmi.jpg"))
        )
        if ok:
            holat[kalit] = xesh
            _holatni_yoz(holat)
        return ok

    for n, ish in (
        ("nom", nom),
        ("tavsif", tavsif),
        ("qisqa tavsif", qisqa_tavsif),
        ("buyruqlar", buyruqlar),
        ("rasm", rasm),
    ):
        await qadam(n, ish)

    if ozgardi:
        log.info("Bot profili yangilandi: %s", ", ".join(ozgardi))
    else:
        log.info("Bot profili allaqachon to'g'ri sozlangan")
