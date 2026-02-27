"""
🏙️ AI City Builders - 데이터 규격서 (Schemas)
불량 자재가 도시에 들어오지 못하게 하는 검문소입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class PipelineStage(str, Enum):
    """파이프라인 단계 (공정 단계)"""
    IDLE = "idle"
    MARKET_RESEARCH = "market_research"
    IMAGE_GENERATION = "image_generation"
    IMAGE_SYNTHESIS = "image_synthesis"
    VIDEO_GENERATION = "video_generation"
    COMPLETED = "completed"
    FAILED = "failed"


class GenerateRequest(BaseModel):
    """생성 요청 - 입국 심사 서류"""
    product_keyword: str = Field(..., description="제품/트렌드 키워드", min_length=1)
    style_prompt: str = Field(
        default="modern, sleek, professional product photography",
        description="이미지 스타일 프롬프트"
    )
    video_prompt_hint: str = Field(
        default="smooth camera movement, cinematic lighting",
        description="영상 연출 힌트"
    )


class StageResult(BaseModel):
    """각 단계별 결과"""
    stage: PipelineStage
    status: str = "pending"
    message: str = ""
    output_url: Optional[str] = None


class GenerateResponse(BaseModel):
    """생성 응답 - 작업 접수증"""
    task_id: str
    status: str = "accepted"
    message: str = "공사가 시작되었습니다! 🏗️"


class StatusResponse(BaseModel):
    """상태 응답 - 실시간 공사 현황"""
    task_id: str
    current_stage: PipelineStage
    progress: int = Field(0, ge=0, le=100, description="전체 진행률 (%)")
    stages: list[StageResult] = []
    final_video_url: Optional[str] = None
    metadata: Optional[dict] = None
