"""Telegram bot (aiogram 3): saytga kirishni tasdiqlaydi.

Foydalanuvchi saytdagi havolani bosadi → bot /start <kod> oladi → "Bu sizmisiz?" deb so'raydi.
Faqat "Ha" bosilgandagina sayt kiradi: tasodifan yoki aldov bilan ochilgan havola o'zi kirgizmaydi.
"""

import asyncio
import logging
from contextlib import suppress

from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ChatType, ParseMode
from aiogram.exceptions import TelegramUnauthorizedError
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.filters.callback_data import CallbackData
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from . import kirish
from .bot_profil import profilni_sozla
from .db import Baza

log = logging.getLogger("algoritmi.bot")


class KirishTugma(CallbackData, prefix="k"):
    amal: str  # "ha" | "yoq"
    kod: str


def router_yarat(baza: Baza, sayt_url: str) -> Router:
    r = Router()
    r.message.filter(F.chat.type == ChatType.PRIVATE)

    def sayt_tugmasi() -> InlineKeyboardMarkup | None:
        # Telegram tugmalarda faqat ochiq https manzilni qabul qiladi (localhost emas).
        if not sayt_url.startswith("https://"):
            return None
        return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Saytni ochish", url=sayt_url)]])

    @r.message(CommandStart(deep_link=True))
    async def start_kod(message: Message, command: CommandObject) -> None:
        kod = command.args or ""
        async with baza.sessiya() as s:
            k = await kirish.kutilayotgan_kod(s, kod)
        if k is None:
            await message.answer(
                "⌛️ Bu havola eskirgan yoki allaqachon ishlatilgan.\n\n"
                "Saytda <b>«Kirish»</b> tugmasini qaytadan bosing.",
                reply_markup=sayt_tugmasi(),
            )
            return
        await message.answer(
            "🔐 <b>Algoritmi</b> saytiga kirish so'ralyapti.\n\n"
            "Hozir saytda «Telegram orqali kirish» tugmasini bosgan bo'lsangiz, tasdiqlang.\n"
            "<i>Agar bu siz bo'lmasangiz — «Yo'q» ni bosing.</i>",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="✅ Ha, kiraman", callback_data=KirishTugma(amal="ha", kod=kod).pack()
                        ),
                        InlineKeyboardButton(text="Yo'q", callback_data=KirishTugma(amal="yoq", kod=kod).pack()),
                    ]
                ]
            ),
        )

    @r.message(CommandStart())
    async def start_oddiy(message: Message) -> None:
        await message.answer(
            "Assalomu alaykum! 👋\n\n"
            "Bu <b>Algoritmi</b> — o'zbek tilidagi interaktiv informatika darslari boti.\n"
            "Saytga kirish uchun saytdagi <b>«Kirish»</b> tugmasini bosing: shu yerga tasdiqlash so'rovi keladi.\n\n"
            "Parol va telefon raqam kerak emas.",
            reply_markup=sayt_tugmasi(),
        )

    @r.message(Command("yordam", "help"))
    async def yordam(message: Message) -> None:
        await message.answer(
            "ℹ️ <b>Bot qanday ishlaydi</b>\n\n"
            "1. Saytda <b>«Kirish»</b> tugmasini bosing.\n"
            "2. «Telegram'ni ochish» tugmasi yoki QR kod sizni shu botga olib keladi.\n"
            "3. Bu yerda <b>«Ha, kiraman»</b> ni bosing — sayt o'zi kiradi.\n\n"
            "🔒 Parol va telefon raqam kerak emas. Saytda faqat ismingiz ko'rinadi.\n"
            "Agar kirishni siz so'ramagan bo'lsangiz — «Yo'q» ni bosing, hech kim kirmaydi.",
            reply_markup=sayt_tugmasi(),
        )

    @r.message()
    async def boshqa(message: Message) -> None:
        await message.answer("Men faqat saytga kirishni tasdiqlayman. Saytdagi «Kirish» tugmasini bosing.")

    @r.callback_query(KirishTugma.filter())
    async def tugma(query: CallbackQuery, callback_data: KirishTugma) -> None:
        if query.from_user.is_bot:
            await query.answer()
            return
        async with baza.sessiya() as s:
            if callback_data.amal == "ha":
                ok = await kirish.kodni_tasdiqla(s, callback_data.kod, query.from_user.id, query.from_user.first_name)
                matn = (
                    "✅ <b>Tasdiqlandi!</b>\n\nSaytga qayting — siz avtomatik kirasiz."
                    if ok
                    else "⌛️ Bu so'rov eskirgan. Saytda «Kirish» tugmasini qaytadan bosing."
                )
            else:
                await kirish.kodni_rad_et(s, callback_data.kod)
                matn = "❌ Bekor qilindi. Hech kim kirmadi."
        await query.answer()
        if isinstance(query.message, Message):
            with suppress(Exception):
                await query.message.edit_text(matn, reply_markup=None)

    return r


class BotXizmati:
    """Bot fonda ishlaydi: Telegram bilan aloqa bo'lmasa, qayta-qayta ulanishga urinadi.

    Ulanish muvaffaqiyatli bo'lgach `nomi` to'ldiriladi (sayt "Kirish" tugmasi shundan keyin ishlaydi),
    polling va profil sozlash boshlanadi. Token noto'g'ri bo'lsa (401) urinish to'xtaydi.
    """

    def __init__(self, token: str, baza: Baza, sayt_url: str) -> None:
        self.bot = Bot(token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
        self.baza = baza
        self.sayt_url = sayt_url
        self.nomi: str | None = None
        self._vazifalar: list[asyncio.Task[None]] = []
        self._vazifalar.append(asyncio.create_task(self._ulan(), name="telegram-bot-ulanish"))

    async def _ulan(self) -> None:
        kutish = 5.0
        while True:
            try:
                men = await self.bot.get_me()
                # Webhook o'rnatilgan bo'lsa polling ishlamaydi.
                await self.bot.delete_webhook(drop_pending_updates=False)
                break
            except TelegramUnauthorizedError:
                log.error("Telegram bot tokeni noto'g'ri (401). backend/.env dagi TELEGRAM_BOT_TOKEN ni tekshiring.")
                return
            except Exception as e:
                log.warning("Telegram'ga ulanib bo'lmadi (%s). %.0f soniyadan keyin qayta urinaman.", e, kutish)
                await asyncio.sleep(kutish)
                kutish = min(kutish * 2, 60)

        if not men.username:
            log.error("Botda username yo'q: Telegram havolasini yasab bo'lmaydi.")
            return
        dp = Dispatcher()
        dp.include_router(router_yarat(self.baza, self.sayt_url))
        self._vazifalar.append(
            asyncio.create_task(
                dp.start_polling(self.bot, handle_signals=False, allowed_updates=dp.resolve_used_update_types()),
                name="telegram-bot",
            )
        )
        # Nom, tavsif, buyruqlar va rasm: fonda, sayt ishini kutdirmaydi.
        self._vazifalar.append(asyncio.create_task(profilni_sozla(self.bot), name="telegram-bot-profil"))
        self.nomi = men.username
        log.info("Telegram bot ishga tushdi: @%s", men.username)

    async def toxtat(self) -> None:
        for v in self._vazifalar:
            v.cancel()
        for v in self._vazifalar:
            with suppress(asyncio.CancelledError):
                await v
        await self.bot.session.close()
