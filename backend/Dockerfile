# 🏙️ AI City Builders - Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 라이브러리 설치 (Pillow 등을 위해 필요할 수 있음)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 의존성 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# outputs 및 assets 디렉토리 생성
RUN mkdir -p /outputs /assets

# gunicorn으로 FastAPI 실행
# uvicorn 워커를 사용하여 성능 최적화
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
