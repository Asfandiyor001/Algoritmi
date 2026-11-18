"""Ma'lumotlar bazasi: SQLAlchemy 2 (async). URL o'zgartirilsa SQLite'dan PostgreSQL'ga o'tiladi."""

from collections.abc import AsyncIterator
from pathlib import Path

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


class Asos(DeclarativeBase):
    pass


class Baza:
    def __init__(self, url: str) -> None:
        if url.startswith("sqlite") and ":memory:" not in url:
            Path(url.split("///", 1)[1]).parent.mkdir(parents=True, exist_ok=True)
        self.engine: AsyncEngine = create_async_engine(url)
        if url.startswith("sqlite"):
            # SQLite'da tashqi kalitlar va bir vaqtda o'qish/yozish (WAL) alohida yoqiladi.
            @event.listens_for(self.engine.sync_engine, "connect")
            def _pragma(ulanish, _yozuv):  # type: ignore[no-untyped-def]
                kursor = ulanish.cursor()
                kursor.execute("PRAGMA foreign_keys=ON")
                kursor.execute("PRAGMA journal_mode=WAL")
                kursor.close()

        self.sessiya = async_sessionmaker(self.engine, expire_on_commit=False)

    async def jadvallarni_yarat(self) -> None:
        # Jadvallar modellar import qilingandan keyin ma'lum bo'ladi.
        from . import models  # noqa: F401

        async with self.engine.begin() as ulanish:
            await ulanish.run_sync(Asos.metadata.create_all)

    async def yop(self) -> None:
        await self.engine.dispose()

    async def __call__(self) -> AsyncIterator[AsyncSession]:
        async with self.sessiya() as s:
            yield s
