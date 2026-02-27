"""
⚡ AI City Builders - AI 터빈 (Google AI Service)
지하 발전소의 핵심 엔진입니다.

4단계 공정:
  Zone 1: 시장 조사 (Gemini 3 Flash)
  Zone 2: 자재 생산 (Gemini 3 Pro Image)
  Zone 3: 합성 연구소 (Gemini 3 Pro Image - Inpainting)
  Zone 4: 방송국 (Veo 3.1 Video)
"""

import os
import time
import base64
import asyncio
import uuid
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types
from PIL import Image
import io

# ── 발전소 설비 초기화 ──
# main.py와 동일한 방식으로 경로를 설정합니다. 가급적 환경변수를 통해 제어합니다.
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = Path(os.getenv("OUTPUTS_DIR", BASE_DIR / "outputs"))
ASSETS_DIR = Path(os.getenv("ASSETS_DIR", BASE_DIR / "assets"))

OUTPUTS_DIR.mkdir(exist_ok=True, parents=True)
ASSETS_DIR.mkdir(exist_ok=True, parents=True)


MAX_RETRIES = 5  # 내진 설계 강화: 5회 재시도
SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
]



def get_client():
    """발전소 출입증으로 클라이언트 연결"""
    api_key = os.getenv("GCP_API_KEY")
    project_id = os.getenv("GCP_PROJECT_ID")
    if not api_key:
        raise RuntimeError("🚨 발전소 출입증(GCP_API_KEY)이 없습니다! .env를 확인하세요.")
    
    # Vertex AI Backend를 사용하는 신제품(Veo 등)을 위해 project_id 추가 권장
    if project_id:
        return genai.Client(api_key=api_key, http_options={"headers": {"x-goog-user-project": project_id}})
    return genai.Client(api_key=api_key)



async def retry_async(func, *args, **kwargs):
    """내진 설계: 최대 3회 재시도"""
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            last_error = e
            print(f"⚠️ 지진 감지! (시도 {attempt}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(2 ** attempt)
    raise RuntimeError(f"🏚️ 복구 실패 ({MAX_RETRIES}회 시도 후): {last_error}")


# ═══════════════════════════════════════════
# Zone 1: 시장 조사 (Market Research)
# ═══════════════════════════════════════════
async def zone1_market_research(client: genai.Client, keyword: str) -> dict:
    """
    Gemini 3 Flash로 트렌드 분석 및 제목/설명/태그 생성
    """
    prompt = f"""당신은 유튜브 쇼츠 마케팅 전문가입니다.
'{keyword}' 관련 제품 홍보 영상을 위한 다음 정보를 JSON 형식으로 생성하세요:

{{
  "title": "매력적인 한국어 제목 (50자 이내)",
  "description": "SEO 최적화 한국어 설명 (200자 이내)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "trend_summary": "현재 이 제품의 트렌드 요약 (100자 이내)",
  "product_description": "영상에 사용할 제품 상세 설명 (영어, 50단어 이내)",
  "scene_description": "제품을 보여줄 영상 장면 설명 (영어, 50단어 이내)"
}}

반드시 유효한 JSON만 출력하세요.
"""

    async def _call():
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3-flash-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.8,
                response_mime_type="application/json",
                safety_settings=SAFETY_SETTINGS,
            )
        )

        import json
        return json.loads(response.text)

    return await retry_async(_call)


# ═══════════════════════════════════════════
# Zone 2: 자재 생산 (Asset Factory)
# ═══════════════════════════════════════════
async def zone2_generate_product_image(
    client: genai.Client,
    product_desc: str,
    style_prompt: str,
    task_id: str
) -> str:
    """
    Gemini 3 Pro Image로 제품 이미지 생성
    Returns: 저장된 이미지 파일 경로
    """
    prompt = f"""Generate a high-quality product photograph:
Product: {product_desc}
Style: {style_prompt}
Requirements: Clean white/gradient background, studio lighting, 
ultra-detailed, 4K quality, no text or watermarks."""

    async def _call():
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                safety_settings=SAFETY_SETTINGS,
            )
        )


        # 이미지 추출 및 저장
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                img_data = part.inline_data.data
                img_path = OUTPUTS_DIR / f"{task_id}_product.png"
                Image.open(io.BytesIO(img_data)).save(str(img_path))
                return str(img_path)

        raise RuntimeError("이미지가 생성되지 않았습니다.")

    return await retry_async(_call)


# ═══════════════════════════════════════════
# Zone 3: 합성 연구소 (Synthesis Lab)
# ═══════════════════════════════════════════
async def zone3_synthesize_image(
    client: genai.Client,
    character_image_path: str,
    product_image_path: str,
    scene_desc: str,
    task_id: str
) -> str:
    """
    캐릭터 + 제품 합성 (Inpainting)
    Returns: 합성된 이미지 파일 경로
    """
    # 캐릭터 이미지 로드
    char_img = Image.open(character_image_path)
    char_bytes = io.BytesIO()
    char_img.save(char_bytes, format="PNG")
    char_bytes = char_bytes.getvalue()

    # 제품 이미지 로드
    prod_img = Image.open(product_image_path)
    prod_bytes = io.BytesIO()
    prod_img.save(prod_bytes, format="PNG")
    prod_bytes = prod_bytes.getvalue()

    prompt = f"""Combine these two images into a natural, professional scene:
- The person/character from the first image should be holding or presenting the product from the second image.
- Scene: {scene_desc}
- Style: Professional product advertisement, natural lighting, seamless composition.
- Make it look like a real photograph, not a collage."""

    async def _call():
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-3-pro-image-preview",
            contents=[
                types.Part.from_bytes(data=char_bytes, mime_type="image/png"),
                types.Part.from_bytes(data=prod_bytes, mime_type="image/png"),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                safety_settings=SAFETY_SETTINGS,
            )
        )


        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                img_data = part.inline_data.data
                img_path = OUTPUTS_DIR / f"{task_id}_synthesized.png"
                Image.open(io.BytesIO(img_data)).save(str(img_path))
                return str(img_path)

        raise RuntimeError("합성 이미지가 생성되지 않았습니다.")

    return await retry_async(_call)


# ═══════════════════════════════════════════
# Zone 4: 방송국 (Broadcasting - Veo 3.1)
# ═══════════════════════════════════════════
async def zone4_generate_video(
    client: genai.Client,
    synthesized_image_path: str,
    scene_desc: str,
    video_hint: str,
    task_id: str
) -> str:
    """
    Veo 3.1로 영상 생성 (Polling 시스템)
    Returns: 저장된 영상 파일 경로
    """
    # 합성 이미지 로드
    synth_img = Image.open(synthesized_image_path)
    synth_bytes = io.BytesIO()
    synth_img.save(synth_bytes, format="PNG")
    synth_bytes = synth_bytes.getvalue()

    video_prompt = f"""Create a cinematic 8-second product advertisement video.
Scene: {scene_desc}
Camera: {video_hint}
Style: Professional, smooth transitions, high production value.
The person should naturally interact with the product."""

    async def _call():
        # Veo 3.1 영상 생성 요청
        operation = await asyncio.to_thread(
            client.models.generate_videos,
            model="veo-3.1-generate-preview",
            prompt=video_prompt,
            image=types.Image(
                image_bytes=synth_bytes,
                mime_type="image/png"
            ),
            config=types.GenerateVideosConfig(
                aspect_ratio="9:16",
                number_of_videos=1,
            )
        )



        # Polling: 영상 생성 완료까지 대기
        print("📡 영상 송출 대기 중...")
        while not operation.done:
            await asyncio.sleep(20)  # Polling 간격 20초로 증가 (429 방지)
            
            async def _check():
                return await asyncio.to_thread(
                    client.operations.get,
                    operation=operation
                )
            
            try:
                operation = await retry_async(_check)
                print(f"📡 영상 송출 대기 중... (ID: {task_id})")
            except Exception as e:
                print(f"⚠️ 폴링 중 지진 감지 (무시하고 재시도): {e}")
                continue


        # 영상 다운로드
        video_path = OUTPUTS_DIR / f"{task_id}_final.mp4"
        
        res = operation.result
        if not res:
            error_msg = f"API Error: {operation.error}" if operation.error else "No result data"
            raise RuntimeError(f"영상이 생성되었으나 결과 데이터가 없습니다. ({error_msg})")

        # 다양한 필드명 대응 (generated_videos 또는 videos)
        videos = getattr(res, 'generated_videos', None) or getattr(res, 'videos', None)
        
        if not videos:
            # 혹시 res 자체가 리스트인 경우 (일부 SDK 버전)
            if isinstance(res, list):
                videos = res
            else:
                raise RuntimeError(f"영상이 생성되었으나 비디오 목록을 찾을 수 없습니다. (Type: {type(res)}, Data: {res})")

        for video in videos:
            # video.video 추출
            video_part = getattr(video, 'video', None)
            if not video_part:
                continue

            video_data = await asyncio.to_thread(
                client.files.download,
                file=video_part
            )
            with open(video_path, "wb") as f:
                f.write(video_data)
            print(f"🎬 영상 송출 완료: {video_path}")
            return str(video_path)

        raise RuntimeError("영상 목록은 있으나 다운로드 가능한 비디오 데이터가 없습니다.")


    return await retry_async(_call)


# ═══════════════════════════════════════════
# 전체 파이프라인 실행
# ═══════════════════════════════════════════
async def run_full_pipeline(
    task_id: str,
    keyword: str,
    character_image_path: Optional[str],
    style_prompt: str,
    video_hint: str,
    progress_callback=None
) -> dict:
    """
    4단계 전체 공정 실행
    """
    client = get_client()
    result = {
        "task_id": task_id,
        "stages": {},
        "final_video_url": None,
        "metadata": None,
    }

    async def update(stage: str, status: str, msg: str, output_url=None):
        result["stages"][stage] = {
            "status": status, "message": msg, "output_url": output_url
        }
        if progress_callback:
            await progress_callback(task_id, stage, status, msg, output_url)

    try:
        # ── Zone 1: 시장 조사 ──
        await update("market_research", "running", "🔍 트렌드를 분석하고 있습니다...")
        metadata = await zone1_market_research(client, keyword)
        result["metadata"] = metadata
        await update("market_research", "completed", "✅ 시장 조사 완료!", None)

        # ── Zone 2: 자재 생산 ──
        await update("image_generation", "running", "🎨 제품 이미지를 생성하고 있습니다...")
        product_desc = metadata.get("product_description", keyword)
        product_image_path = await zone2_generate_product_image(
            client, product_desc, style_prompt, task_id
        )
        product_url = f"/outputs/{task_id}_product.png"
        await update("image_generation", "completed", "✅ 제품 이미지 생성 완료!", product_url)

        # ── Zone 3: 합성 연구소 ──
        if character_image_path and os.path.exists(character_image_path):
            await update("image_synthesis", "running", "🧬 캐릭터와 제품을 합성하고 있습니다...")
            scene_desc = metadata.get("scene_description", "person presenting product")
            synth_path = await zone3_synthesize_image(
                client, character_image_path, product_image_path, scene_desc, task_id
            )
            synth_url = f"/outputs/{task_id}_synthesized.png"
            await update("image_synthesis", "completed", "✅ 이미지 합성 완료!", synth_url)
        else:
            # 캐릭터 없으면 제품 이미지로 바로 진행
            synth_path = product_image_path
            synth_url = product_url
            await update("image_synthesis", "skipped", "⏭️ 캐릭터 없이 진행합니다.", synth_url)

        # ── Zone 4: 방송국 ──
        await update("video_generation", "running", "🎬 영상을 생성하고 있습니다... (2~5분 소요)")
        scene_desc = metadata.get("scene_description", "cinematic product showcase")
        video_path = await zone4_generate_video(
            client, synth_path, scene_desc, video_hint, task_id
        )
        video_url = f"/outputs/{task_id}_final.mp4"
        result["final_video_url"] = video_url
        await update("video_generation", "completed", "✅ 영상 생성 완료! 🎉", video_url)

    except Exception as e:
        current_stage = "unknown"
        for s in ["video_generation", "image_synthesis", "image_generation", "market_research"]:
            if s in result["stages"] and result["stages"][s]["status"] == "running":
                current_stage = s
                break
        
        # 에러 메시지 고도화
        error_msg = str(e)
        advice = ""
        if "429" in error_msg:
            advice = " (할당량 초과! 잠시 후 다시 시도하세요.)"
        elif "403" in error_msg:
            advice = " (권한 오류! API 키 설정을 확인하세요.)"
        elif "safety" in error_msg.lower():
            advice = " (안전 필터에 의해 차단되었습니다. 다른 키워드를 입력해보세요.)"
        
        await update(current_stage, "failed", f"🚨 지진 발생: {error_msg}{advice}")
        raise


    return result
