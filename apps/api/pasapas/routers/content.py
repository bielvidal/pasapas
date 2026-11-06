"""Edició de textos sense desplegar (§6 content_overrides, fase 4): el tutor desa esborranys i
els aprova; l'alumna només rep els aprovats. La clau identifica el text (p. ex.
`tag:B5_CANCELA_TERME:explicacio`, `template:B5.T1:explicacioCorrecta`, `bloc:B5:reglaOr`)."""
from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import auth
from ..db import get_db
from ..models import ContentOverride, User, now

router = APIRouter(prefix="/api", tags=["content"])
STATES = ("esborrany", "aprovat")
KEY_RE = re.compile(r"^(tag|template|bloc):[A-Za-z0-9_.]+:[A-Za-z0-9_.]+$")


class OverrideIn(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    state: str = "esborrany"


def _dict(o: ContentOverride) -> dict:
    return {"key": o.key, "text": o.text_ca, "state": o.state, "updated_at": o.updated_at.isoformat()}


@router.get("/content/overrides")
def list_overrides(u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    """Tots per al tutor (esborranys inclosos: els veu aplicats a la seva app); només aprovats per a l'alumna."""
    q = select(ContentOverride).order_by(ContentOverride.key)
    if not u.is_tutor:
        q = q.where(ContentOverride.state == "aprovat")
    return {"overrides": [_dict(o) for o in db.scalars(q).all()]}


@router.put("/admin/content/overrides/{key}")
def put_override(key: str, body: OverrideIn, u: User = Depends(auth.current_tutor), db: Session = Depends(get_db)):
    if not KEY_RE.match(key):
        raise HTTPException(422, {"error": "invalid_key", "message": "Clau de text no vàlida."})
    if body.state not in STATES:
        raise HTTPException(422, {"error": "invalid_state", "message": f"Estat vàlid: {', '.join(STATES)}."})
    o = db.get(ContentOverride, key)
    if o:
        o.text_ca, o.state, o.updated_at = body.text, body.state, now()
    else:
        o = ContentOverride(key=key, text_ca=body.text, state=body.state)
        db.add(o)
    db.commit()
    return _dict(o)


@router.delete("/admin/content/overrides/{key}")
def delete_override(key: str, u: User = Depends(auth.current_tutor), db: Session = Depends(get_db)):
    """Torna al text original del codi."""
    o = db.get(ContentOverride, key)
    if o:
        db.delete(o)
        db.commit()
    return {"ok": True}
