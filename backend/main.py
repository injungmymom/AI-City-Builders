"""
🏙️ AI City Builders - 중앙 통제실 (Main API Server)
지상(React)과 지하(AI Engine)를 연결하는 중추 신경입니다.
"""

import os
import uuid
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from schemas import (
    GenerateRequest, GenerateResponse, StatusResponse,
    StageResult, PipelineStage
)
from services.google_ai import run_full_pipeline

# ── 환경 설정 ──
# .env 파일 로드 (로컬 개발용)
load_dotenv()

# 경로 설정: 환경 변수에서 가져오거나 기본값 사용
BASE_DIR = Path(__file__).resolve().parent
OUTPUTS_DIR = Path(os.getenv("OUTPUTS_DIR", BASE_DIR / "outputs"))
ASSETS_DIR = Path(os.getenv("ASSETS_DIR", BASE_DIR / "assets"))

OUTPUTS_DIR.mkdir(exist_ok=True, parents=True)
ASSETS_DIR.mkdir(exist_ok=True, parents=True)


# ── 작업 상태 저장소 (인메모리) ──
task_store: dict[str, dict] = {}


async def progress_callback(task_id, stage, status, message, output_url=None):
    """실시간 공사 현황 업데이트"""
    if task_id not in task_store:
        return
    task_store[task_id]["stages"][stage] = {
        "stage": stage,
        "status": status,
        "message": message,
        "output_url": output_url,
    }
    # 진행률 계산
    stage_order = ["market_research", "image_generation", "image_synthesis", "video_generation"]
    completed = sum(
        1 for s in stage_order
        if s in task_store[task_id]["stages"]
        and task_store[task_id]["stages"][s]["status"] in ("completed", "skipped")
    )
    task_store[task_id]["progress"] = int((completed / len(stage_order)) * 100)

    if status == "completed" and stage == "video_generation":
        task_store[task_id]["current_stage"] = PipelineStage.COMPLETED
        task_store[task_id]["final_video_url"] = output_url
    elif status == "failed":
        task_store[task_id]["current_stage"] = PipelineStage.FAILED
    elif status == "running":
        stage_map = {
            "market_research": PipelineStage.MARKET_RESEARCH,
            "image_generation": PipelineStage.IMAGE_GENERATION,
            "image_synthesis": PipelineStage.IMAGE_SYNTHESIS,
            "video_generation": PipelineStage.VIDEO_GENERATION,
        }
        task_store[task_id]["current_stage"] = stage_map.get(stage, PipelineStage.IDLE)


# ── FastAPI 앱 생성 ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🏙️ AI City Builders 발전소 가동 시작!")
    print(f"📁 완제품 저장소: {OUTPUTS_DIR}")
    print(f"📁 원자재 저장소: {ASSETS_DIR}")
    yield
    print("🏙️ 발전소 가동 중지. 안녕히!")

app = FastAPI(
    title="🏙️ AI City Builders API",
    description="초자동화 영상 생산 도시의 중앙 통제실",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS 설정 (지상-지하 통신 허용) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 정적 파일 서빙 (완제품 배포) ──
app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")


# ═══════════════════════════════════════════
# API 엔드포인트
# ═══════════════════════════════════════════

@app.get("/")
async def root():
    """도시 안내소"""
    return {
        "city": "AI City Builders",
        "status": "operational",
        "message": "🏙️ 초자동화 영상 생산 도시에 오신 것을 환영합니다!",
        "endpoints": {
            "generate": "POST /generate",
            "status": "GET /status/{task_id}",
            "outputs": "GET /outputs/{filename}",
        }
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate(
    product_keyword: str = Form(...),
    style_prompt: str = Form("modern, sleek, professional product photography"),
    video_prompt_hint: str = Form("smooth camera movement, cinematic lighting"),
    character_image: UploadFile | None = File(None),
):
    """
    🏗️ 전체 공정 시작!
    캐릭터 이미지(선택)와 키워드로 영상을 생성합니다.
    """
    task_id = str(uuid.uuid4())[:8]

    # 캐릭터 이미지 저장
    char_path = None
    if character_image:
        char_path = str(ASSETS_DIR / f"{task_id}_character.png")
        with open(char_path, "wb") as f:
            content = await character_image.read()
            f.write(content)

    # 작업 등록
    task_store[task_id] = {
        "current_stage": PipelineStage.IDLE,
        "progress": 0,
        "stages": {},
        "final_video_url": None,
        "metadata": None,
    }

    # 비동기 파이프라인 실행
    async def _run():
        try:
            result = await run_full_pipeline(
                task_id=task_id,
                keyword=product_keyword,
                character_image_path=char_path,
                style_prompt=style_prompt,
                video_hint=video_prompt_hint,
                progress_callback=progress_callback,
            )
            task_store[task_id]["metadata"] = result.get("metadata")
        except Exception as e:
            print(f"🚨 공정 중 지진 발생: {e}")

    asyncio.create_task(_run())

    return GenerateResponse(
        task_id=task_id,
        status="accepted",
        message=f"🏗️ 공사가 시작되었습니다! Task ID: {task_id}"
    )


@app.get("/status/{task_id}", response_model=StatusResponse)
async def get_status(task_id: str):
    """📊 공사 현황 조회"""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="해당 공사 현장을 찾을 수 없습니다.")

    task = task_store[task_id]
    stages = [
        StageResult(
            stage=s,
            status=task["stages"].get(s, {}).get("status", "pending"),
            message=task["stages"].get(s, {}).get("message", "대기 중"),
            output_url=task["stages"].get(s, {}).get("output_url"),
        )
        for s in ["market_research", "image_generation", "image_synthesis", "video_generation"]
    ]

    return StatusResponse(
        task_id=task_id,
        current_stage=task["current_stage"],
        progress=task["progress"],
        stages=stages,
        final_video_url=task.get("final_video_url"),
        metadata=task.get("metadata"),
    )


@app.get("/download/{task_id}/{filename}")
async def download_file(task_id: str, filename: str):
    """📥 완제품 다운로드"""
    file_path = OUTPUTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/octet-stream"
    )
