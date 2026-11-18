"""Sozlamalar: backend/.env faylidan yoki muhit o'zgaruvchilaridan o'qiladi (namuna: .env.example)."""

from functools import lru_cache
from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_PAPKA = Path(__file__).resolve().parent.parent


class Sozlamalar(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_PAPKA / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Telegram bot tokeni (@BotFather beradi). Berilmasa sayt ishlaydi, faqat "Kirish" o'chiq bo'ladi.
    telegram_bot_token: SecretStr | None = None
    # Bot polling rejimida ishga tushsinmi (testlarda o'chiriladi).
    bot_yoqilgan: bool = True

    # SQLite MVP uchun. PostgreSQL uchun: postgresql+asyncpg://user:parol@host/algoritmi
    database_url: str = f"sqlite+aiosqlite:///{(BACKEND_PAPKA / 'data' / 'algoritmi.db').as_posix()}"

    # Sayt manzili: botdagi "Saytga qaytish" tugmasi uchun (faqat https bo'lsa ko'rsatiladi).
    sayt_url: str = "http://localhost:5173"

    # Production'da (HTTPS) True: cookie faqat shifrlangan ulanishda yuboriladi.
    cookie_secure: bool = False
    # nginx kabi proksi ortida True: mijoz IP manzili X-Forwarded-For'dan olinadi.
    ishonchli_proksi: bool = False

    kod_muddati_soniya: int = 300
    sessiya_muddati_kun: int = 30


@lru_cache
def sozlamalar() -> Sozlamalar:
    return Sozlamalar()
