"""HTTP API (docs/konsepsiya.md, 12.2-bo'lim).

  GET  /api/health        server va bot holati
  POST /api/auth/start    bir martalik kirish kodi + Telegram havolasi
  POST /api/auth/poll     kod tasdiqlandimi? Tasdiqlangan bo'lsa sessiya cookie'si qo'yiladi
  POST /api/auth/logout   chiqish
  GET  /api/me            joriy foydalanuvchi (kirmagan bo'lsa null)

Sessiya HttpOnly cookie'da: JavaScript uni o'qiy olmaydi. SameSite=Lax boshqa saytlardan
POST so'rov bilan cookie yuborilishini to'sadi.
"""

from typing import Annotated, Literal

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from . import kirish
from .cheklov import Cheklov, mijoz_ip
from .config import Sozlamalar

COOKIE = "algoritmi_sessiya"

router = APIRouter(prefix="/api")

start_cheklovi = Cheklov(soni=10)
poll_cheklovi = Cheklov(soni=120)


def bot_nomi(request: Request) -> str | None:
    """Bot ulangan bo'lsa uning username'i, aks holda None (ulanish fonda davom etayotgan bo'lishi mumkin)."""
    bot = request.app.state.bot
    return bot.nomi if bot is not None else None


def sozlama(request: Request) -> Sozlamalar:
    return request.app.state.sozlamalar


async def sessiya(request: Request):  # type: ignore[no-untyped-def]
    async for s in request.app.state.baza():
        yield s


Sessiya = Annotated[AsyncSession, Depends(sessiya)]
Sozlama = Annotated[Sozlamalar, Depends(sozlama)]
SessiyaCookie = Annotated[str | None, Cookie(alias=COOKIE)]


class FoydalanuvchiJavob(BaseModel):
    taxallus: str


class MenJavob(BaseModel):
    foydalanuvchi: FoydalanuvchiJavob | None


class StartJavob(BaseModel):
    kod: str
    sir: str
    havola: str
    bot: str
    muddat: int


class PollSorov(BaseModel):
    kod: str = Field(max_length=64)
    sir: str = Field(max_length=128)


class PollJavob(BaseModel):
    holat: Literal["kutilmoqda", "tasdiqlandi", "rad", "eskirdi"]
    foydalanuvchi: FoydalanuvchiJavob | None = None


class HealthJavob(BaseModel):
    ok: bool
    bot: bool


@router.get("/health")
async def health(request: Request) -> HealthJavob:
    return HealthJavob(ok=True, bot=bot_nomi(request) is not None)


@router.post("/auth/start")
async def auth_start(request: Request, s: Sessiya, sz: Sozlama) -> StartJavob:
    nomi = bot_nomi(request)
    if nomi is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Telegram bot hozircha ulanmagan.")
    start_cheklovi.tekshir(mijoz_ip(request, sz))
    k = await kirish.kod_yarat(s, sz.kod_muddati_soniya)
    return StartJavob(
        kod=k.kod,
        sir=k.sir,
        havola=f"https://t.me/{nomi}?start={k.kod}",
        bot=nomi,
        muddat=k.muddat_soniya,
    )


@router.post("/auth/poll")
async def auth_poll(sorov: PollSorov, request: Request, response: Response, s: Sessiya, sz: Sozlama) -> PollJavob:
    poll_cheklovi.tekshir(mijoz_ip(request, sz))
    h = await kirish.kod_holati(s, sorov.kod, sorov.sir)
    if h.holat != "tasdiqlandi" or h.foydalanuvchi is None:
        return PollJavob(holat=h.holat)  # type: ignore[arg-type]

    token = await kirish.sessiya_och(s, h.foydalanuvchi.id, sz.sessiya_muddati_kun)
    response.set_cookie(
        COOKIE,
        token,
        max_age=sz.sessiya_muddati_kun * 24 * 3600,
        httponly=True,
        secure=sz.cookie_secure,
        samesite="lax",
        path="/",
    )
    return PollJavob(holat="tasdiqlandi", foydalanuvchi=FoydalanuvchiJavob(taxallus=h.foydalanuvchi.taxallus))


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def auth_logout(response: Response, s: Sessiya, sz: Sozlama, token: SessiyaCookie = None) -> None:
    await kirish.sessiyani_yop(s, token)
    response.delete_cookie(COOKIE, path="/", httponly=True, secure=sz.cookie_secure, samesite="lax")


@router.get("/me")
async def me(response: Response, s: Sessiya, token: SessiyaCookie = None) -> MenJavob:
    # Shaxsiy javob: brauzer yoki proksi keshlamasin.
    response.headers["Cache-Control"] = "no-store"
    f = await kirish.sessiya_egasi(s, token)
    return MenJavob(foydalanuvchi=FoydalanuvchiJavob(taxallus=f.taxallus) if f else None)
