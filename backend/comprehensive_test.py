import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path
from services.google_ai import run_full_pipeline

# ── 환경 설정 ──
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

async def test_full():
    print("🏙️ AI City Builders - Comprehensive Pipeline Test")
    task_id = "TESTING"
    keyword = "Espresso Machine"
    
    async def progress_cb(tid, stage, status, message, url=None):
        print(f"[{stage}] {status}: {message} (URL: {url})")

    try:
        result = await run_full_pipeline(
            task_id=task_id,
            keyword=keyword,
            character_image_path=None,
            style_prompt="modern luxury",
            video_hint="pan right",
            progress_callback=progress_cb
        )
        print("\n✅ Pipeline Completed!")
        print(f"Final Video URL: {result.get('final_video_url')}")
    except Exception as e:
        print(f"\n🚨 Pipeline Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_full())
