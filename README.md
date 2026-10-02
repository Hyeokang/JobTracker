# JobTracker

채용공고를 구조화하고 지원 과정과 취업 준비 데이터를 관리하는 웹 서비스입니다.

## Prerequisites

- Node.js 24
- Java 21
- Docker Desktop 또는 Docker Engine with Compose

## Local database

환경변수 파일을 만든 뒤 PostgreSQL을 실행합니다.

```bash
cp .env.example .env
docker compose up -d postgres
docker compose ps
```

`.env`의 비밀번호는 로컬 환경에 맞게 변경하고 커밋하지 않습니다.

## Backend

루트의 환경변수를 불러온 뒤 Spring Boot를 실행합니다.

```bash
set -a
source .env
set +a
cd backend
./gradlew bootRun
```

## Frontend

```bash
cd frontend
nvm use
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Verification

```bash
(cd backend && ./gradlew clean build)
(cd frontend && npm run lint && npm run build)
```
