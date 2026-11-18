"""Telegram orqali kirish oqimi: API + bot ishlatadigan mantiq (haqiqiy Telegram'siz)."""

from collections.abc import AsyncIterator
from datetime import timedelta
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import update

from app import api, kirish
from app.config import Sozlamalar
from app.main import ilova_yarat
from app.models import KirishKodi, hozir


@pytest.fixture
async def ilova(tmp_path: Path) -> AsyncIterator[FastAPI]:
    sz = Sozlamalar(
        database_url=f"sqlite+aiosqlite:///{(tmp_path / 'test.db').as_posix()}",
        telegram_bot_token=None,
        bot_yoqilgan=False,
    )
    app = ilova_yarat(sz)
    async with app.router.lifespan_context(app):
        app.state.bot = SimpleNamespace(nomi="algoritmi_test_bot")
        api.start_cheklovi._tarix.clear()
        api.poll_cheklovi._tarix.clear()
        yield app


@pytest.fixture
async def mijoz(ilova: FastAPI) -> AsyncIterator[httpx.AsyncClient]:
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=ilova), base_url="http://test") as m:
        yield m


async def bot_tasdiqlaydi(app: FastAPI, kod: str, tg_id: int = 111, ism: str | None = "Aziz") -> bool:
    async with app.state.baza.sessiya() as s:
        return await kirish.kodni_tasdiqla(s, kod, tg_id, ism)


async def test_toliq_oqim(ilova: FastAPI, mijoz: httpx.AsyncClient) -> None:
    assert (await mijoz.get("/api/me")).json() == {"foydalanuvchi": None}

    r = await mijoz.post("/api/auth/start")
    assert r.status_code == 200
    d = r.json()
    assert d["havola"] == f"https://t.me/algoritmi_test_bot?start={d['kod']}"
    assert kirish.KOD_SHAKLI.match(d["kod"])

    poll = {"kod": d["kod"], "sir": d["sir"]}
    assert (await mijoz.post("/api/auth/poll", json=poll)).json()["holat"] == "kutilmoqda"

    assert await bot_tasdiqlaydi(ilova, d["kod"])
    # Ikkinchi bosish hech narsani o'zgartirmaydi.
    assert not await bot_tasdiqlaydi(ilova, d["kod"])

    r = await mijoz.post("/api/auth/poll", json=poll)
    assert r.json() == {"holat": "tasdiqlandi", "foydalanuvchi": {"taxallus": "Aziz"}}
    cookie = r.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie

    assert (await mijoz.get("/api/me")).json() == {"foydalanuvchi": {"taxallus": "Aziz"}}

    # Kod bir martalik: qayta so'ralsa yangi sessiya ochilmaydi.
    assert (await mijoz.post("/api/auth/poll", json=poll)).json()["holat"] == "eskirdi"

    assert (await mijoz.post("/api/auth/logout")).status_code == 204
    assert (await mijoz.get("/api/me")).json() == {"foydalanuvchi": None}


async def test_begona_sir_bilan_kira_olmaydi(ilova: FastAPI, mijoz: httpx.AsyncClient) -> None:
    d = (await mijoz.post("/api/auth/start")).json()
    assert await bot_tasdiqlaydi(ilova, d["kod"])
    r = await mijoz.post("/api/auth/poll", json={"kod": d["kod"], "sir": "begona-sir"})
    assert r.json() == {"holat": "eskirdi", "foydalanuvchi": None}
    assert "set-cookie" not in r.headers
    # Haqiqiy egasi baribir kira oladi.
    r = await mijoz.post("/api/auth/poll", json={"kod": d["kod"], "sir": d["sir"]})
    assert r.json()["holat"] == "tasdiqlandi"


async def test_rad_etilgan(ilova: FastAPI, mijoz: httpx.AsyncClient) -> None:
    d = (await mijoz.post("/api/auth/start")).json()
    async with ilova.state.baza.sessiya() as s:
        assert await kirish.kodni_rad_et(s, d["kod"])
    assert not await bot_tasdiqlaydi(ilova, d["kod"])
    r = await mijoz.post("/api/auth/poll", json={"kod": d["kod"], "sir": d["sir"]})
    assert r.json()["holat"] == "rad"


async def test_muddati_otgan_kod(ilova: FastAPI, mijoz: httpx.AsyncClient) -> None:
    d = (await mijoz.post("/api/auth/start")).json()
    async with ilova.state.baza.sessiya() as s:
        await s.execute(
            update(KirishKodi).where(KirishKodi.kod == d["kod"]).values(muddat=hozir() - timedelta(seconds=1))
        )
        await s.commit()
    assert not await bot_tasdiqlaydi(ilova, d["kod"])
    r = await mijoz.post("/api/auth/poll", json={"kod": d["kod"], "sir": d["sir"]})
    assert r.json()["holat"] == "eskirdi"


async def test_bitta_odam_bitta_hisob(ilova: FastAPI, mijoz: httpx.AsyncClient) -> None:
    """Ikkinchi marta kirganda yangi hisob ochilmaydi, taxallus o'zgarmaydi."""
    for ism in ("Aziz", "Boshqa ism"):
        d = (await mijoz.post("/api/auth/start")).json()
        assert await bot_tasdiqlaydi(ilova, d["kod"], tg_id=777, ism=ism)
        r = await mijoz.post("/api/auth/poll", json={"kod": d["kod"], "sir": d["sir"]})
        assert r.json()["foydalanuvchi"] == {"taxallus": "Aziz"}


async def test_bot_ulanmagan(ilova: FastAPI, mijoz: httpx.AsyncClient) -> None:
    ilova.state.bot = None
    assert (await mijoz.get("/api/health")).json() == {"ok": True, "bot": False}
    assert (await mijoz.post("/api/auth/start")).status_code == 503


async def test_json_bolmagan_sorov_rad_etiladi(mijoz: httpx.AsyncClient) -> None:
    r = await mijoz.post("/api/auth/poll", content="kod=a&sir=b", headers={"content-type": "text/plain"})
    assert r.status_code == 422


async def test_soxta_cookie(mijoz: httpx.AsyncClient) -> None:
    mijoz.cookies.set(api.COOKIE, "soxta-token")
    assert (await mijoz.get("/api/me")).json() == {"foydalanuvchi": None}


async def test_start_cheklovi(mijoz: httpx.AsyncClient) -> None:
    for _ in range(api.start_cheklovi.soni):
        assert (await mijoz.post("/api/auth/start")).status_code == 200
    r = await mijoz.post("/api/auth/start")
    assert r.status_code == 429
    assert "Retry-After" in r.headers


def test_taxallus() -> None:
    assert kirish.taxallus_tayyorla("  Aziz  ") == "Aziz"
    assert kirish.taxallus_tayyorla(None) == "O'quvchi"
    assert kirish.taxallus_tayyorla("‎\n") == "O'quvchi"
    assert len(kirish.taxallus_tayyorla("A" * 100)) == kirish.TAXALLUS_UZUNLIGI


def test_kod_shakli() -> None:
    assert not kirish.KOD_SHAKLI.match("qisqa")
    assert not kirish.KOD_SHAKLI.match("a" * 20 + "<script>")
