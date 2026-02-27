# 🏙️ AI City Builders

초자동화 영상 생산 도시 프로젝트입니다.

## 🚀 시작하기

1. **설정**: `.env` 파일에 `GCP_API_KEY`와 `GCP_PROJECT_ID`가 올바르게 입력되어 있는지 확인하세요.
2. **실행**: 루트 디렉토리에 있는 `start_servers.bat` 파일을 실행하세요.
   - 백엔드(8000번 포트)와 프론트엔드(5173번 포트)가 각각 새로운 창에서 실행됩니다.
3. **접속**: 브라우저에서 [http://localhost:5173](http://localhost:5173)으로 접속하세요.

## 🛠️ 주요 기능

- **마케팅 조사**: Gemini 3 Flash를 이용한 제품 트렌드 및 시나리오 분석.
- **이미지 생성**: Gemini 3 Pro Image를 이용한 고화질 제품 이미지 및 캐릭터 합성.
- **영상 제작**: Veo 3.1을 이용한 8초 cinematic 홍보 영상 자동 생성.

## ⚠️ 지진(에러) 발생 시 대처법

- **GCP_API_KEY 확인**: API 키가 유효한지, 그리고 Gemini 3 및 Veo 모델에 대한 권한이 있는지 확인하세요.
- **Quota 확인**: Google AI Studio에서 할당량(Quota)을 초과하지 않았는지 확인하세요.
- **서버 재시작**: `start_servers.bat`를 다시 실행해보세요.
