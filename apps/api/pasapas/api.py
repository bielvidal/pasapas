"""L'app FastAPI de Pas a pas. Mateix origen que el portal (via el túnel en producció o el
rewrite de Next en desenvolupament): cookie de sessió, sense CORS."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from . import VERSION
from .db import auto_initdb
from .routers import admin, auth, sync


@asynccontextmanager
async def lifespan(app: FastAPI):
    auto_initdb()
    yield


app = FastAPI(title="Pas a pas · Àlgebra", version=VERSION, lifespan=lifespan, docs_url=None, redoc_url=None)


@app.exception_handler(HTTPException)
async def _http_error(request: Request, exc: HTTPException):
    """Tots els errors amb la mateixa forma `{error, message}`."""
    detail = exc.detail if isinstance(exc.detail, dict) else {"error": "error", "message": str(exc.detail)}
    return JSONResponse(detail, status_code=exc.status_code, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def _validation_error(request: Request, exc: RequestValidationError):
    return JSONResponse({"error": "invalid_request", "message": "Petició mal formada.", "errors": exc.errors()}, status_code=422)


@app.get("/api/health")
def health():
    return {"ok": True, "service": "pasapas", "version": app.version}


app.include_router(auth.router)
app.include_router(sync.router)
app.include_router(admin.router)
