import asyncio

from app.services.session_state import cleanup_stale_sessions


async def main() -> None:
    deleted = await cleanup_stale_sessions()
    print(f"deleted_sessions={deleted}")


if __name__ == "__main__":
    asyncio.run(main())
