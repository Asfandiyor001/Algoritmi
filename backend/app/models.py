"""Jadvallar.

Bolalar ma'lumoti (docs/konsepsiya.md, 13-bo'lim): faqat Telegram ID va taxallus saqlanadi.
Telefon raqami, familiya, username va rasm saqlanmaydi.
Vaqtlar hammasi UTC'da (vaqt zonasisiz).
"""

from datetime import UTC, datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from .db import Asos


def hozir() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class Foydalanuvchi(Asos):
    __tablename__ = "foydalanuvchilar"

    id: Mapped[int] = mapped_column(primary_key=True)
    tg_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    taxallus: Mapped[str] = mapped_column(String(64))
    yaratilgan: Mapped[datetime] = mapped_column(DateTime, default=hozir)
    oxirgi_kirish: Mapped[datetime] = mapped_column(DateTime, default=hozir)


class KirishKodi(Asos):
    """Bir martalik kirish kodi.

    `kod` Telegram havolasiga yoziladi (ochiq). `sir` esa faqat kodni so'ragan brauzerda turadi:
    havolani ko'rgan begona odam shu kod bilan kira olmaydi.
    """

    __tablename__ = "kirish_kodlari"

    kod: Mapped[str] = mapped_column(String(64), primary_key=True)
    sir_hash: Mapped[str] = mapped_column(String(64))
    yaratilgan: Mapped[datetime] = mapped_column(DateTime, default=hozir)
    muddat: Mapped[datetime] = mapped_column(DateTime, index=True)
    # kutilmoqda → tasdiqlandi → ishlatildi; yoki kutilmoqda → rad
    holat: Mapped[str] = mapped_column(String(16), default="kutilmoqda")
    foydalanuvchi_id: Mapped[int | None] = mapped_column(
        ForeignKey("foydalanuvchilar.id", ondelete="CASCADE"), default=None
    )


class Sessiya(Asos):
    """Brauzerda faqat token (HttpOnly cookie), bazada uning SHA-256 xeshi."""

    __tablename__ = "sessiyalar"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    foydalanuvchi_id: Mapped[int] = mapped_column(
        ForeignKey("foydalanuvchilar.id", ondelete="CASCADE"), index=True
    )
    yaratilgan: Mapped[datetime] = mapped_column(DateTime, default=hozir)
    muddat: Mapped[datetime] = mapped_column(DateTime, index=True)
