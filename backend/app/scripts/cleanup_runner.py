import asyncio

from app.services.cleanup import cleanup_old_audio


async def main() -> None:
    deleted = await cleanup_old_audio()
    print(f"deleted_audio={deleted}")


if __name__ == "__main__":
    asyncio.run(main())
