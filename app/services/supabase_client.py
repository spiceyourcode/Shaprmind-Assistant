import httpx

from app.core.config import get_settings


def fetch_instruments() -> list[dict]:
    settings = get_settings()
    supabase_url = settings.supabase_url
    supabase_key = (
        settings.supabase_publishable_key
        or settings.supabase_key
        or settings.supabase_anon_key
    )

    if not supabase_url or not supabase_key:
        raise RuntimeError("Supabase credentials are not configured.")

    headers = {
        "apikey": supabase_key,
        "authorization": f"Bearer {supabase_key}",
        "accept": "application/json",
    }
    url = f"{supabase_url}/rest/v1/instruments"
    params = {"select": "*"}
    with httpx.Client(timeout=10) as client:
        response = client.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
