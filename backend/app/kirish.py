"""Telegram orqali kirish mantig'i. API ham, bot ham shu funksiyalarni ishlatadi.

Oqim:
  1. Sayt: kod_yarat() → brauzer `kod` va `sir` oladi, foydalanuvchi t.me/<bot>?start=<kod> ni ochadi.
  2. Bot: /start <kod> → "Bu sizmisiz?" → "Ha" → kodni_tasdiqla().
  3. Sayt har 2 soniyada kod_holati(kod, sir) so'raydi; tasdiqlangan bo'lsa sessiya ochiladi.
"""

import hashlib
import re
import secrets
from dataclasses import dataclass
from datetime import timedelta

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Foydalanuvchi, KirishKodi, Sessiya, hozir

# Telegram /start parametri: faqat A-Z a-z 0-9 _ - va ko'pi bilan 64 belgi.
KOD_SHAKLI = re.compile(r"^[A-Za-z0-9_-]{16,64}$")
TAXALLUS_UZUNLIGI = 32


def xesh(matn: str) -> str:
    return hashlib.sha256(matn.encode()).hexdigest()


def taxallus_tayyorla(ism: str | None) -> str:
    """Telegram'dagi ismdan taxallus: boshqaruv belgilarisiz, qisqartirilgan."""
    toza = "".join(b for b in (ism or "") if b.isprintable()).strip()
    return toza[:TAXALLUS_UZUNLIGI] or "O'quvchi"


@dataclass(frozen=True)
class YangiKod:
    kod: str
    sir: str
    muddat_soniya: int


async def kod_yarat(s: AsyncSession, muddat_soniya: int) -> YangiKod:
    kod = secrets.token_urlsafe(24)  # 32 belgi
    sir = secrets.token_urlsafe(32)
    s.add(KirishKodi(kod=kod, sir_hash=xesh(sir), muddat=hozir() + timedelta(seconds=muddat_soniya)))
    await s.commit()
    return YangiKod(kod, sir, muddat_soniya)


async def kutilayotgan_kod(s: AsyncSession, kod: str) -> KirishKodi | None:
    """Bot uchun: kod mavjud, muddati o'tmagan va hali javob berilmagan bo'lsa qaytaradi."""
    if not KOD_SHAKLI.match(kod):
        return None
    k = await s.get(KirishKodi, kod)
    if k is None or k.holat != "kutilmoqda" or k.muddat < hozir():
        return None
    return k


async def kodni_tasdiqla(s: AsyncSession, kod: str, tg_id: int, ism: str | None) -> bool:
    """Bot: foydalanuvchi "Ha" ni bosdi. Kod yaroqli bo'lsa, foydalanuvchini yaratadi va kodga bog'laydi."""
    if await kutilayotgan_kod(s, kod) is None:
        return False

    f = await s.scalar(select(Foydalanuvchi).where(Foydalanuvchi.tg_id == tg_id))
    if f is None:
        f = Foydalanuvchi(tg_id=tg_id, taxallus=taxallus_tayyorla(ism))
        s.add(f)
        await s.flush()

    # Faqat "kutilmoqda" holatidan o'tadi: ikki marta bosilsa ham bir marta ishlaydi.
    natija = await s.execute(
        update(KirishKodi)
        .where(KirishKodi.kod == kod, KirishKodi.holat == "kutilmoqda", KirishKodi.muddat >= hozir())
        .values(holat="tasdiqlandi", foydalanuvchi_id=f.id)
    )
    await s.commit()
    return natija.rowcount > 0  # type: ignore[attr-defined]


async def kodni_rad_et(s: AsyncSession, kod: str) -> bool:
    natija = await s.execute(
        update(KirishKodi).where(KirishKodi.kod == kod, KirishKodi.holat == "kutilmoqda").values(holat="rad")
    )
    await s.commit()
    return natija.rowcount > 0  # type: ignore[attr-defined]


@dataclass(frozen=True)
class KodHolati:
    # kutilmoqda | tasdiqlandi | rad | eskirdi
    holat: str
    foydalanuvchi: Foydalanuvchi | None = None


async def kod_holati(s: AsyncSession, kod: str, sir: str) -> KodHolati:
    """Sayt: kod holatini so'raydi. Tasdiqlangan kod shu zahoti "ishlatildi" bo'ladi (bir martalik)."""
    k = await s.get(KirishKodi, kod) if KOD_SHAKLI.match(kod) else None
    # Noto'g'ri sir ham "eskirdi" deb javob beradi: kod borligi oshkor qilinmaydi.
    if k is None or not secrets.compare_digest(k.sir_hash, xesh(sir)):
        return KodHolati("eskirdi")
    if k.holat == "rad":
        return KodHolati("rad")
    if k.holat == "kutilmoqda":
        return KodHolati("kutilmoqda" if k.muddat >= hozir() else "eskirdi")
    if k.holat != "tasdiqlandi":
        return KodHolati("eskirdi")

    natija = await s.execute(
        update(KirishKodi)
        .where(KirishKodi.kod == kod, KirishKodi.holat == "tasdiqlandi")
        .values(holat="ishlatildi")
    )
    if natija.rowcount == 0:  # type: ignore[attr-defined]
        await s.rollback()
        return KodHolati("eskirdi")
    f = await s.get(Foydalanuvchi, k.foydalanuvchi_id)
    if f is None:
        await s.rollback()
        return KodHolati("eskirdi")
    f.oxirgi_kirish = hozir()
    await s.commit()
    return KodHolati("tasdiqlandi", f)


async def sessiya_och(s: AsyncSession, foydalanuvchi_id: int, muddat_kun: int) -> str:
    token = secrets.token_urlsafe(32)
    s.add(
        Sessiya(
            token_hash=xesh(token),
            foydalanuvchi_id=foydalanuvchi_id,
            muddat=hozir() + timedelta(days=muddat_kun),
        )
    )
    await s.commit()
    return token


async def sessiya_egasi(s: AsyncSession, token: str | None) -> Foydalanuvchi | None:
    if not token or len(token) > 128:
        return None
    return await s.scalar(
        select(Foydalanuvchi)
        .join(Sessiya, Sessiya.foydalanuvchi_id == Foydalanuvchi.id)
        .where(Sessiya.token_hash == xesh(token), Sessiya.muddat > hozir())
    )


async def sessiyani_yop(s: AsyncSession, token: str | None) -> None:
    if token:
        await s.execute(delete(Sessiya).where(Sessiya.token_hash == xesh(token)))
        await s.commit()


async def tozala(s: AsyncSession) -> None:
    """Muddati o'tgan kodlar (1 soatdan keyin) va sessiyalarni o'chirish."""
    await s.execute(delete(KirishKodi).where(KirishKodi.muddat < hozir() - timedelta(hours=1)))
    await s.execute(delete(Sessiya).where(Sessiya.muddat < hozir()))
    await s.commit()
