# AGENTS.md

## 1. Project Overview

이 프로젝트는 **채용공고 분석 및 취업 지원 관리 웹 플랫폼**이다.

사용자가 채용공고 URL을 입력하면 공고 정보를 가능한 범위에서 자동으로 추출하고 구조화한다. 사용자는 추출 결과를 확인 및 수정한 뒤 저장할 수 있다.

저장된 채용공고와 지원 데이터를 기반으로 지원 현황, 일정, 기술스택 빈도, 지원 단계 등의 정보를 시각화한다.

이 프로젝트는 **웹 기반 Full-Stack 포트폴리오 프로젝트**이며, Frontend와 Backend 모두 충분한 비중을 갖도록 개발한다.

핵심 흐름:

채용공고 발견
→ URL 입력
→ 공고 데이터 추출
→ 데이터 구조화 및 기술스택 정규화
→ 사용자 검토/수정
→ DB 저장
→ 지원 상태 관리
→ 데이터 누적
→ Dashboard 및 Analytics 제공

---

# 2. Core Goals

프로젝트의 주요 목표는 다음과 같다.

1. 채용공고 URL 기반 정보 등록
2. 채용공고 정보 자동 추출
3. 기술스택 자동 탐지 및 정규화
4. 채용공고 및 회사 관리
5. 지원 과정 관리
6. Kanban 기반 지원 상태 관리
7. 취업 일정 Calendar 관리
8. Dashboard 제공
9. 채용공고 기술 데이터 분석
10. 개인 기술스택과 채용공고 요구 기술 비교
11. 검색 및 필터
12. 안정적인 인증/인가
13. 테스트 가능한 구조
14. 실제 배포 가능한 서비스 구축

단순 CRUD 프로젝트가 되지 않도록 한다.

---

# 3. Main User Flow

## 채용공고 등록

사용자가 채용공고 URL을 입력한다.

URL
→ 사이트/도메인 확인
→ 허용되는 방법으로 공고 데이터 획득
→ 텍스트 정제
→ 정보 추출
→ 기술스택 탐지
→ 기술명 정규화
→ 사용자에게 Preview 제공
→ 사용자 확인/수정
→ DB 저장

자동 분석 결과를 바로 확정 저장하지 않는다.

반드시 사용자가 분석 결과를 확인하고 수정할 수 있도록 한다.

---

# 4. Job Posting Data

채용공고에서 가능한 경우 다음 정보를 추출한다.

- 회사명
- 공고 제목
- 직무
- 직군
- 경력 조건
- 고용 형태
- 근무 지역
- 모집 시작일
- 마감일
- 기술스택
- 자격요건
- 우대사항
- 원본 URL

공고마다 데이터가 존재하지 않을 수 있으므로 nullable 필드를 적절하게 설계한다.

---

# 5. Job Parsing

초기 버전에서는 사이트별 Parser와 규칙 기반 추출을 우선한다.

URL
→ Domain Detection
→ Content Extraction
→ Text Cleaning
→ Keyword Matching
→ Structured Data
→ Skill Normalization

사이트별 이용약관, robots 정책 및 접근 제한을 준수한다.

무단 대규모 크롤링을 전제로 설계하지 않는다.

기본적으로 사용자가 직접 입력한 개별 URL을 처리하는 구조를 사용한다.

특정 사이트에서 자동 추출이 불가능한 경우 사용자가 직접 정보를 입력할 수 있도록 fallback을 제공한다.

---

# 6. AI / LLM Extraction

기본 기능이 안정적으로 구현된 이후 선택적으로 LLM 기반 구조화를 추가한다.

공고 텍스트
→ LLM
→ Structured JSON
→ Validation
→ Skill Normalization
→ User Review
→ Save

LLM 결과를 신뢰 가능한 사실로 간주하지 않는다.

항상 Schema Validation을 수행하고 사용자가 수정할 수 있도록 한다.

LLM 기능은 핵심 서비스가 LLM 없이는 동작하지 못하는 구조로 만들지 않는다.

---

# 7. Skill Normalization

동일한 기술이 서로 다른 이름으로 작성될 수 있다.

예:

SpringBoot
Spring Boot
spring-boot
스프링부트

모두 내부적으로 하나의 기술로 처리한다.

예:

SPRING_BOOT

주요 기술 카테고리:

Backend
- Java
- Kotlin
- Spring
- Spring Boot
- JPA
- QueryDSL
- Node.js

Frontend
- JavaScript
- TypeScript
- React
- Next.js
- Vue

Database
- MySQL
- PostgreSQL
- MongoDB
- Redis

Infrastructure
- AWS
- Docker
- Kubernetes
- Jenkins
- GitHub Actions

Skill과 SkillAlias를 분리하여 관리한다.

예:

Skill
- id
- name
- normalizedName
- category

SkillAlias
- id
- skillId
- alias

---

# 8. Application Management

채용 지원 상태를 관리한다.

기본 상태:

INTERESTED
PLANNED
APPLIED
DOCUMENT
CODING_TEST
INTERVIEW_1
INTERVIEW_2
FINAL
ACCEPTED
REJECTED
WITHDRAWN

지원 상태 변경 이력을 저장할 수 있도록 설계한다.

단순히 Application의 현재 status만 변경하여 과거 기록을 잃지 않도록 한다.

ApplicationEvent 또는 StatusHistory 형태의 Entity를 사용한다.

---

# 9. Kanban Board

지원 현황을 Kanban 형태로 제공한다.

예:

관심
지원 예정
지원 완료
서류
코딩테스트
면접
결과

Drag & Drop으로 지원 상태를 변경할 수 있도록 한다.

Frontend 상태 변경 후 Backend에도 즉시 반영한다.

Optimistic Update를 사용할 경우 실패 시 rollback을 반드시 처리한다.

---

# 10. Calendar

다음 일정을 Calendar에서 관리한다.

- 지원 마감일
- 코딩테스트
- 면접
- 결과 발표 예정일
- 사용자가 직접 추가한 일정

공고의 마감일과 Application Event를 Calendar에서 함께 확인할 수 있도록 한다.

---

# 11. Dashboard

Dashboard에서는 최소 다음 정보를 제공한다.

- 저장한 채용공고 수
- 지원 완료 수
- 진행 중 지원 수
- 서류 통과 수
- 코딩테스트 수
- 면접 수
- 최종 결과
- 예정된 일정
- 최근 저장한 공고
- 최근 지원 활동

지원 Funnel도 제공한다.

예:

지원
→ 서류
→ 코딩테스트
→ 면접
→ 최종 결과

---

# 12. Analytics

사용자가 저장한 채용공고를 기반으로 분석한다.

주요 분석:

- 기술별 등장 빈도
- 직무별 기술스택
- 기간별 기술 등장 빈도
- 회사별 요구 기술
- 지원 단계별 통계
- 지원 Funnel
- 월별 지원 횟수
- 지원 결과 통계

중요:

서비스에서 제공하는 채용 기술 통계는 전체 채용시장을 대표하지 않는다.

항상 "사용자가 저장한 채용공고 기준"이라는 점을 UI에서 명확하게 표시한다.

---

# 13. My Skills

사용자는 자신의 기술스택을 등록할 수 있다.

예:

Java
Spring Boot
JPA
MySQL
Docker
AWS

선택적으로 숙련도를 저장할 수 있다.

예:

BEGINNER
INTERMEDIATE
ADVANCED

사용자가 저장한 공고의 요구 기술과 자신의 기술을 비교할 수 있도록 한다.

예:

Spring
저장 공고 등장률: 74%
내 기술: 등록됨

Redis
저장 공고 등장률: 28%
내 기술: 미등록

취업 가능성이나 합격 확률을 임의의 점수로 계산하지 않는다.

객관적인 데이터 비교 중심으로 제공한다.

---

# 14. Search & Filter

채용공고를 다음 조건으로 검색할 수 있도록 한다.

- 회사
- 직무
- 기술스택
- 경력
- 지역
- 지원 상태
- 저장 날짜
- 마감 날짜

초기 검색은 PostgreSQL 기반으로 구현한다.

데이터 규모가 실제로 커져 필요성이 생기기 전까지 Elasticsearch/OpenSearch를 도입하지 않는다.

---

# 15. Job Snapshot

채용공고는 수정되거나 삭제될 수 있다.

사용자가 저장한 시점의 구조화된 정보를 유지할 수 있도록 한다.

다만 외부 채용공고 원문 전체를 무단으로 복제하여 공개하는 구조를 피한다.

구조화된 데이터와 사용자 개인 메모를 중심으로 저장한다.

---

# 16. Memo

사용자는 회사 및 지원 건에 개인 메모를 작성할 수 있다.

예:

- 지원 이유
- 자기소개서 메모
- 기업 조사
- 기술 면접 준비
- 면접 질문
- 면접 후기
- 결과 회고

---

# 17. Frontend

Frontend는 다음 기술을 기본으로 사용한다.

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Recharts
- dnd-kit

Frontend는 단순 CRUD 화면에 머물지 않는다.

다음 UX를 중요하게 구현한다.

- Responsive Web
- Dashboard
- Data Visualization
- Kanban Drag & Drop
- Calendar
- Search / Filter
- Loading State
- Empty State
- Error State
- Form Validation
- Optimistic Update

Desktop Web을 우선하되 Tablet/Mobile에서도 정상적으로 사용할 수 있도록 Responsive UI를 적용한다.

---

# 18. Backend

Backend 기본 기술:

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- QueryDSL
- Bean Validation
- Gradle

필요한 경우:

- OAuth2
- JWT
- Redis

Redis는 필요성이 생기기 전에 단순히 기술스택을 늘리기 위한 목적으로 추가하지 않는다.

---

# 19. Database

Primary Database:

PostgreSQL

주요 Entity:

User
Company
JobPosting
Skill
SkillAlias
JobSkill
Application
ApplicationEvent
CalendarEvent
UserSkill
Memo

Entity 간 관계를 명확하게 설계한다.

N+1 Query, 불필요한 EAGER Loading 등을 피한다.

기본적으로 LAZY Loading을 사용하고 필요한 조회는 Fetch Join, EntityGraph, QueryDSL Projection 등을 상황에 맞게 사용한다.

---

# 20. Backend Architecture

초기에는 Microservice Architecture를 사용하지 않는다.

Modular Monolith 구조를 기본으로 한다.

예:

src/main/java/.../

auth
user
company
job
application
skill
analytics
calendar
parser
notification
common

각 Domain의 책임을 명확하게 분리한다.

Controller에 Business Logic을 작성하지 않는다.

Controller
→ Service
→ Repository

구조를 기본으로 하되 불필요한 계층이나 추상화를 만들지 않는다.

---

# 21. API

REST API를 기본으로 한다.

예:

/api/auth
/api/users
/api/jobs
/api/jobs/{id}
/api/jobs/analyze
/api/companies
/api/applications
/api/applications/{id}/status
/api/calendar
/api/skills
/api/analytics

HTTP Method와 Status Code를 의미에 맞게 사용한다.

API Response/Error 형식을 일관성 있게 유지한다.

---

# 22. Authentication & Authorization

인증 기능을 구현한다.

초기에는 다음 중 하나를 사용할 수 있다.

- Email Login
- Google OAuth
- GitHub OAuth

인증 방식은 프로젝트 구현 단계에서 가장 단순하면서 유지보수 가능한 방법을 우선한다.

사용자는 자신의 데이터만 조회/수정/삭제할 수 있어야 한다.

모든 민감한 API에서 Backend Authorization 검증을 수행한다.

Frontend에서 숨기는 것만으로 권한을 처리하지 않는다.

---

# 23. Security

다음을 고려한다.

- Input Validation
- Authorization
- XSS
- CSRF
- CORS
- SQL Injection
- SSRF
- Rate Limiting
- Secret Management

특히 URL 분석 기능은 SSRF 공격 가능성을 고려한다.

localhost, private network, metadata endpoint 등 위험한 주소에 Backend가 요청하지 못하도록 검증한다.

Secret/API Key를 Repository에 Commit하지 않는다.

환경변수를 사용한다.

---

# 24. Error Handling

Backend에서 Global Exception Handler를 사용한다.

일관된 Error Response를 제공한다.

Frontend에서는 Error Response를 사용자에게 적절한 형태로 표시한다.

Network Error와 Validation Error를 구분한다.

사용자에게 Stack Trace나 내부 구현 정보를 노출하지 않는다.

---

# 25. Testing

Backend:

- JUnit 5
- Mockito
- Spring Boot Test
- Testcontainers

Frontend:

- Vitest
- React Testing Library
- Playwright

모든 코드에 무조건 테스트를 작성하는 것이 목적은 아니다.

다음 핵심 Business Logic은 우선적으로 테스트한다.

- 인증 및 권한
- 공고 등록
- 공고 중복 처리
- Skill Normalization
- 지원 상태 변경
- Application Status History
- Analytics 계산
- Job Parsing
- URL Validation

주요 E2E Flow:

로그인
→ 채용공고 URL 입력
→ 분석
→ 분석 결과 수정
→ 저장
→ 지원 등록
→ Kanban 상태 변경
→ Dashboard 반영

---

# 26. Infrastructure

기본 인프라:

- GitHub
- Docker
- Docker Compose
- GitHub Actions
- PostgreSQL

배포 후보:

Frontend
- Vercel

Backend
- AWS

Database
- PostgreSQL / AWS RDS

필요한 경우:

- AWS S3
- CloudFront
- Route 53

로컬 개발환경은 가능한 한 Docker Compose를 통해 쉽게 실행할 수 있도록 한다.

---

# 27. CI/CD

GitHub Actions를 사용한다.

기본 Pipeline:

Push / Pull Request
→ Install
→ Lint
→ Test
→ Build

main branch 배포 시:

Build
→ Test
→ Docker Image Build
→ Deploy

테스트 실패 시 배포하지 않는다.

---

# 28. Development Phases

## Phase 1 - Project Setup

- Repository 구성
- Next.js 설정
- Spring Boot 설정
- PostgreSQL 설정
- Docker Compose
- 환경변수 관리
- 기본 CI

## Phase 2 - Core Domain

- User
- Authentication
- Company
- JobPosting
- Skill
- Application
- 기본 CRUD

## Phase 3 - Main UX

- Dashboard
- Job List
- Job Detail
- Kanban
- Calendar
- Search
- Filter
- Charts

## Phase 4 - Job URL Analysis

- URL 입력
- URL Validation
- Domain Detection
- Job Parser
- 정보 추출
- Skill Detection
- Skill Normalization
- Preview
- User Correction
- Save

## Phase 5 - Analytics

- 기술 등장 빈도
- 직무별 기술
- 지원 통계
- 지원 Funnel
- 기간별 통계
- My Skills 비교

## Phase 6 - Advanced Features

필요한 경우에만 추가한다.

- LLM Structured Extraction
- OAuth
- Notification
- Redis
- Rate Limiting
- Job Snapshot 개선

## Phase 7 - Production

- Unit Test
- Integration Test
- E2E Test
- Security Review
- Performance Optimization
- Error Handling
- CI/CD
- AWS Deployment
- API Documentation
- ERD
- Architecture Diagram
- README

---

# 29. Coding Rules

코드를 생성하거나 수정할 때 다음 원칙을 따른다.

1. 기존 코드 구조와 Convention을 먼저 확인한다.
2. 요청받지 않은 대규모 Refactoring을 하지 않는다.
3. 한 번에 지나치게 많은 기능을 구현하지 않는다.
4. Feature 단위로 구현한다.
5. 중복 코드를 최소화한다.
6. 의미 있는 변수명과 함수명을 사용한다.
7. 불필요한 주석을 작성하지 않는다.
8. 복잡한 Business Logic에는 필요한 설명을 남긴다.
9. TypeScript에서 가능한 한 `any` 사용을 피한다.
10. Java에서 불필요한 Optional 사용을 피한다.
11. DTO와 Entity의 역할을 분리한다.
12. Entity를 API Response로 직접 반환하지 않는다.
13. Validation은 Frontend와 Backend 모두 수행한다.
14. 보안 검증은 반드시 Backend에서도 수행한다.
15. Secret을 코드에 Hard Coding하지 않는다.
16. 새로운 Dependency 추가 전 기존 기술로 해결 가능한지 확인한다.
17. 사용하지 않는 Dependency를 추가하지 않는다.
18. 구현 후 Build/Test/Lint를 확인한다.
19. 기존 기능이 깨지지 않았는지 확인한다.
20. 오류를 숨기기 위한 임시 코드를 작성하지 않는다.

---

# 30. AI Coding Agent Rules

이 프로젝트는 AI Coding Agent를 활용하여 개발할 수 있다.

Agent는 작업 전에 반드시:

1. 현재 Repository 구조 확인
2. 관련 코드 확인
3. 기존 Convention 확인
4. 요구사항 분석
5. 영향 범위 확인

후 작업을 진행한다.

새로운 기능을 구현할 때 기존 구현이 존재하는지 먼저 확인한다.

기존 기능을 중복 구현하지 않는다.

불확실한 Library API나 Framework 기능을 추측하여 작성하지 않는다.

현재 설치된 버전과 공식 문서를 기준으로 구현한다.

기능 구현 후 가능한 경우:

- Type Check
- Lint
- Unit Test
- Integration Test
- Build

를 실행한다.

오류가 발생하면 원인을 분석하고 해결한다.

테스트를 삭제하거나 비활성화하여 Build를 통과시키지 않는다.

요구사항과 관계없는 파일을 수정하지 않는다.

---

# 31. UX Principles

UI는 포트폴리오에서 중요한 부분이므로 단순 관리자 페이지처럼 만들지 않는다.

다음을 중요하게 고려한다.

- 명확한 Information Hierarchy
- 일관된 Design System
- Responsive Design
- Accessibility
- Loading Feedback
- Empty State
- Error State
- Confirmation UI
- Form Validation Feedback

과도한 Animation이나 장식보다 사용성과 정보 전달을 우선한다.

---

# 32. Project Scope Principle

기능 개수보다 완성도를 우선한다.

우선순위:

1. 안정적인 핵심 기능
2. 좋은 UX
3. 올바른 DB/API 설계
4. 테스트
5. 배포
6. 문서화
7. 고급 기능

Redis, Kafka, Kubernetes, Elasticsearch, Microservices 등의 기술을 포트폴리오를 화려하게 만들기 위한 목적으로 억지로 추가하지 않는다.

실제 문제와 도입 이유가 있을 때만 사용한다.

---

# 33. Final Project Goal

최종적으로 다음 사용자 경험을 제공한다.

사용자가 채용공고 URL을 입력한다.

→ 서비스가 공고 정보를 분석한다.

→ 회사/직무/기술스택/경력/마감일 등을 구조화한다.

→ 사용자가 결과를 확인하고 수정한다.

→ 채용공고를 저장한다.

→ 지원 여부와 지원 단계를 관리한다.

→ Kanban과 Calendar에서 취업 활동을 관리한다.

→ 저장된 채용공고 데이터가 누적된다.

→ Dashboard에서 지원 현황을 확인한다.

→ Analytics에서 자신이 저장한 공고의 기술 요구사항과 취업 준비 데이터를 분석한다.

이 프로젝트의 핵심은 단순 채용공고 저장 서비스가 아니라,

**채용공고 수집 → 구조화 → 지원 관리 → 데이터 분석**

전체 과정을 하나의 웹 서비스에서 제공하는 것이다.