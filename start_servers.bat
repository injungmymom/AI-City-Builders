@echo off
setlocal
cd /d "%~dp0"

echo 🏙️ AI City Builders 발전소 가동 준비 중...

if not exist .env (
    echo 🚨 .env 파일이 없습니다! 
    echo GCP_API_KEY와 GCP_PROJECT_ID를 설정해주세요.
    pause
    exit /b
)

echo 🛠️ 백엔드 서버 가동...
if not exist "backend\venv" (
    echo 🚨 백엔드 가상환경(venv)이 없습니다! 
    echo backend 폴더에서 python -m venv venv 를 실행해주세요.
    pause
    exit /b
)
start "AI City Builders - Backend" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo 🎨 프론트엔드 가동...
if not exist "frontend\node_modules" (
    echo 🚨 프론트엔드 모듈(node_modules)이 없습니다!
    echo frontend 폴더에서 npm install 을 실행해주세요.
    pause
    exit /b
)
start "AI City Builders - Frontend" cmd /k "cd frontend && npm run dev"


echo.
echo ✅ 모든 시스템이 가동되었습니다!
echo 🌐 접속 주소: http://localhost:5173
echo.
echo 이 창을 닫아도 서버는 계속 실행됩니다.
echo 서버를 종료하려면 각 서버 창을 닫아주세요.
pause
