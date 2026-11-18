"""So'rovlar cheklovi (rate limit): bitta IP manzildan daqiqasiga N ta so'rov.

Xotirada ishlaydi, bitta jarayon uchun yetarli. Bir nechta server bo'lsa Redis'ga o'tiladi.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from .config import Sozlamalar


class Cheklov:
    def __init__(self, soni: int, oyna_soniya: float = 60) -> None:
        self.soni = soni
        self.oyna = oyna_soniya
        self._tarix: dict[str, deque[float]] = defaultdict(deque)

    def tekshir(self, kalit: str) -> None:
        hozir = time.monotonic()
        tarix = self._tarix[kalit]
        while tarix and tarix[0] <= hozir - self.oyna:
            tarix.popleft()
        if len(tarix) >= self.soni:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Juda ko'p urinish. Bir daqiqadan keyin qayta urinib ko'ring.",
                headers={"Retry-After": str(int(self.oyna))},
            )
        tarix.append(hozir)
        if len(self._tarix) > 10_000:  # xotira cheksiz o'smasligi uchun
            self._tarix = defaultdict(deque, {k: v for k, v in self._tarix.items() if v})


def mijoz_ip(request: Request, sozlama: Sozlamalar) -> str:
    if sozlama.ishonchli_proksi:
        oldinga = request.headers.get("x-forwarded-for")
        if oldinga:
            return oldinga.split(",")[0].strip()
    return request.client.host if request.client else "?"
