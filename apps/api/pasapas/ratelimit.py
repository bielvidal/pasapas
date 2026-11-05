"""Límit de ritme per IP, finestra lliscant en memòria (un procés)."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request


class Limiter:
    def __init__(self, per_minute: int):
        self.per_minute = per_minute
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str, at: float | None = None) -> bool:
        t = at if at is not None else time.monotonic()
        q = self._hits[key]
        while q and t - q[0] > 60:
            q.popleft()
        if len(q) >= self.per_minute:
            return False
        q.append(t)
        return True

    def reset(self) -> None:
        self._hits.clear()


def ip_of(request: Request) -> str:
    # darrere del túnel de Cloudflare la IP real ve en capçalera
    return (request.headers.get("cf-connecting-ip")
            or (request.headers.get("x-forwarded-for") or "").split(",")[0].strip()
            or (request.client.host if request.client else "?"))


def enforce(limiter: Limiter, request: Request) -> None:
    if not limiter.allow(ip_of(request)):
        raise HTTPException(429, {"error": "too_many_requests", "message": "Massa intents. Espera un minut."})
