from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from app.services.supabase_client import fetch_instruments


router = APIRouter()


@router.get("/supabase", response_class=HTMLResponse)
def list_instruments() -> HTMLResponse:
    try:
        instruments = fetch_instruments()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    html = "<h1>Instruments</h1><ul>"
    for instrument in instruments:
        name = instrument.get("name", "")
        html += f"<li>{name}</li>"
    html += "</ul>"
    return HTMLResponse(content=html)
