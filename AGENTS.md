# JobTracker

## 1. Project Overview

JobTracker는 **채용공고 분석 및 취업 지원 관리 웹 플랫폼**이다.

사용자가 채용공고 URL을 입력하면 공고 정보를 가능한 범위에서 자동으로 추출하고 구조화한다.

사용자는 분석 결과를 직접 확인하고 수정한 뒤 저장할 수 있다.

저장된 채용공고와 지원 데이터를 기반으로 다음 기능을 제공한다.

- 채용공고 관리
- 지원 현황 관리
- 지원 단계 관리
- 취업 일정 관리
- 기술스택 분석
- Dashboard
- Analytics
- 개인 기술스택 비교

이 프로젝트는 **웹 기반 Full-Stack 포트폴리오 프로젝트**이며 Frontend와 Backend 모두 충분한 비중을 갖도록 개발한다.

핵심 흐름:

```text
채용공고 발견
→ URL 입력
→ 공고 데이터 추출
→ 데이터 구조화
→ 기술스택 정규화
→ 사용자 검토 및 수정
→ DB 저장
→ 지원 상태 관리
→ 데이터 누적
→ Dashboard / Analytics
```

단순 CRUD 서비스가 아니라,

**채용공고 수집 → 구조화 → 지원 관리 → 데이터 분석**

전체 과정을 하나의 서비스에서 제공하는 것이 핵심이다.

---

# 2. Product Principles

JobTracker는 다음 원칙을 따른다.

### 사용자 확인 우선

자동으로 분석된 채용공고 데이터를 바로 확정 저장하지 않는다.

항상 사용자가 분석 결과를 확인하고 수정할 수 있도록 한다.

### 자동화 + 수정 가능성

자동 추출은 사용자의 입력 부담을 줄이기 위한 기능이다.

자동 분석 결과가 항상 정확하다고 가정하지 않는다.

### 개인 데이터 기반 분석

Dashboard와 Analytics에서 제공하는 통계는 전체 채용시장을 대표하지 않는다.

분석 결과는 기본적으로:

**"사용자가 저장한 채용공고 기준"**

이라는 점을 명확하게 표시한다.

### 객관적인 데이터 중심

개인의 기술스택과 채용공고 데이터를 비교할 수 있지만 취업 가능성이나 합격 확률을 임의의 점수로 계산하지 않는다.

### 완성도 우선

기능 개수를 무작정 늘리는 것보다 핵심 기능의 완성도를 우선한다.

---

# 3. Core User Flow

## 채용공고 등록

```text
URL 입력
→ Domain Detection
→ 허용 가능한 방식으로 Content Extraction
→ Text Cleaning
→ Information Extraction
→ Skill Detection
→ Skill Normalization
→ Preview
→ 사용자 확인 / 수정
→ Save
```

자동 분석 결과는 Preview 단계에서 사용자에게 보여준다.

사용자가 내용을 확인하거나 수정한 이후 저장한다.

자동 분석이 불가능한 경우 직접 입력할 수 있는 fallback을 제공한다.

---

# 4. Core Features

## 4.1 Job Posting

채용공고에서 가능한 경우 다음 정보를 관리한다.

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

공고마다 제공되는 정보가 다르므로 데이터 존재 여부에 따라 nullable 필드를 적절하게 사용한다.

---

## 4.2 Job Parsing

초기 버전에서는 **사이트별 Parser + 규칙 기반 추출**을 우선한다.

```text
URL
→ Domain Detection
→ Content Extraction
→ Text Cleaning
→ Keyword Matching
→ Structured Data
→ Skill Normalization
```

기본적으로 사용자가 직접 입력한 개별 채용공고 URL을 처리한다.

대규모 자동 크롤링 시스템을 전제로 설계하지 않는다.

사이트별 이용약관, robots 정책 및 접근 제한을 고려한다.

특정 사이트에서 자동 추출이 불가능하면 직접 입력할 수 있도록 한다.

---

## 4.3 AI / LLM Extraction

LLM 기반 구조화는 기본 기능이 안정적으로 구현된 이후 선택적으로 도입한다.

```text
Job Posting Text
→ LLM
→ Structured JSON
→ Schema Validation
→ Skill Normalization
→ User Review
→ Save
```

LLM의 출력은 신뢰 가능한 사실로 바로 간주하지 않는다.

반드시 Schema Validation을 수행한다.

사용자가 결과를 확인하고 수정할 수 있어야 한다.

JobTracker의 핵심 기능이 LLM 없이는 동작하지 못하는 구조로 만들지 않는다.

---

## 4.4 Skill Normalization

같은 기술이 여러 이름으로 표현되는 문제를 처리한다.

예:

```text
SpringBoot
Spring Boot
spring-boot
스프링부트
```

위 표현들은 내부적으로 동일한 기술로 관리한다.

예:

```text
SPRING_BOOT
```

Skill과 SkillAlias를 분리한다.

### Skill

```text
id
name
normalizedName
category
```

### SkillAlias

```text
id
skillId
alias
```

주요 카테고리:

### Backend

- Java
- Kotlin
- Spring
- Spring Boot
- JPA
- QueryDSL
- Node.js

### Frontend

- JavaScript
- TypeScript
- React
- Next.js
- Vue

### Database

- MySQL
- PostgreSQL
- MongoDB
- Redis

### Infrastructure

- AWS
- Docker
- Kubernetes
- Jenkins
- GitHub Actions

---

## 4.5 Application Management

사용자의 채용 지원 상태를 관리한다.

기본 상태:

```text
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
```

현재 상태만 저장하여 과거 기록을 잃지 않는다.

상태 변경 이력을 별도로 관리한다.

예:

```text
Application
ApplicationEvent / StatusHistory
```

이를 통해 다음과 같은 정보를 추적할 수 있어야 한다.

- 상태 변경 시점
- 이전 상태
- 변경된 상태
- 지원 과정 기록

---

## 4.6 Kanban

지원 현황을 Kanban 형태로 제공한다.

대표적인 UI 단계:

```text
관심
지원 예정
지원 완료
서류
코딩테스트
면접
결과
```

Drag & Drop을 통해 상태를 변경할 수 있도록 한다.

Frontend 상태 변경 후 Backend에도 반영한다.

Optimistic Update를 사용하는 경우 서버 요청 실패 시 rollback을 처리한다.

---

## 4.7 Calendar

다음 일정을 Calendar에서 관리한다.

- 채용공고 마감일
- 코딩테스트
- 면접
- 결과 발표 예정일
- 사용자가 직접 등록한 일정

JobPosting의 일정과 ApplicationEvent 관련 일정을 하나의 Calendar에서 확인할 수 있도록 한다.

---

## 4.8 Dashboard

Dashboard에서는 최소한 다음 정보를 제공한다.

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

```text
지원
→ 서류
→ 코딩테스트
→ 면접
→ 최종 결과
```

---

## 4.9 Analytics

사용자가 저장한 채용공고와 지원 데이터를 기반으로 분석한다.

주요 분석:

- 기술별 등장 빈도
- 직무별 기술스택
- 기간별 기술 등장 빈도
- 회사별 요구 기술
- 지원 단계별 통계
- 지원 Funnel
- 월별 지원 횟수
- 지원 결과 통계

Analytics는 전체 채용시장을 대표하는 데이터처럼 표현하지 않는다.

UI에서 반드시 사용자 개인 저장 데이터 기반임을 명확하게 표시한다.

---

## 4.10 My Skills

사용자는 자신의 기술스택을 등록할 수 있다.

예:

```text
Java
Spring Boot
JPA
MySQL
Docker
AWS
```

선택적으로 숙련도를 관리할 수 있다.

```text
BEGINNER
INTERMEDIATE
ADVANCED
```

저장한 채용공고의 요구 기술과 사용자의 기술을 비교한다.

예:

```text
Spring Boot

저장 공고 등장률: 74%
내 기술: 등록됨
```

```text
Redis

저장 공고 등장률: 28%
내 기술: 미등록
```

취업 가능성이나 합격 확률을 임의로 계산하지 않는다.

객관적인 데이터 비교를 중심으로 제공한다.

---

## 4.11 Search & Filter

채용공고를 다음 조건으로 검색하고 필터링할 수 있도록 한다.

- 회사
- 직무
- 기술스택
- 경력
- 지역
- 지원 상태
- 저장 날짜
- 마감 날짜

초기 검색은 PostgreSQL을 활용한다.

실제 데이터 규모와 검색 요구가 커지기 전에는 Elasticsearch/OpenSearch를 도입하지 않는다.

---

## 4.12 Job Snapshot

외부 채용공고는 수정되거나 삭제될 수 있다.

사용자가 저장한 시점의 구조화된 정보를 유지할 수 있도록 한다.

외부 채용공고 원문 전체를 무단으로 복제하여 공개하는 구조는 피한다.

구조화된 데이터와 사용자 개인 데이터를 중심으로 저장한다.

---

## 4.13 Memo

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

# 5. Data Model

주요 Entity:

```text
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
```

Entity 간 관계를 명확하게 설계한다.

### 핵심 관계

```text
User
 ├─ JobPosting
 ├─ Application
 ├─ CalendarEvent
 ├─ UserSkill
 └─ Memo

Company
 └─ JobPosting

JobPosting
 ├─ JobSkill
 └─ Application

Skill
 ├─ SkillAlias
 ├─ JobSkill
 └─ UserSkill

Application
 ├─ ApplicationEvent
 └─ Memo
```

실제 구현 시 관계와 소유권은 비즈니스 요구사항에 맞게 구체화한다.

---

# 6. Frontend

기본 기술:

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

Frontend는 단순 CRUD 관리자 페이지처럼 구성하지 않는다.

중요한 UX:

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

Desktop Web을 우선한다.

Tablet과 Mobile에서도 핵심 기능을 정상적으로 사용할 수 있도록 Responsive UI를 적용한다.

---

# 7. Backend

기본 기술:

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- QueryDSL
- Bean Validation
- Gradle

필요성이 생긴 경우 선택적으로 사용할 수 있다.

- OAuth2
- JWT
- Redis

Redis 등의 기술을 단순히 포트폴리오 기술스택을 늘리기 위한 목적으로 추가하지 않는다.

---

# 8. Backend Architecture

초기 구조는 **Modular Monolith**를 기본으로 한다.

Microservice Architecture를 기본 구조로 사용하지 않는다.

예:

```text
src/main/java/...

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
```

Domain별 책임을 명확하게 분리한다.

기본적인 흐름:

```text
Controller
→ Service
→ Repository
```

Controller에 핵심 Business Logic을 직접 작성하지 않는다.

DTO와 Entity의 역할을 구분한다.

Entity를 API Response로 직접 반환하지 않는다.

필요 이상의 Layer 또는 추상화를 만들지 않는다.

---

# 9. Database

Primary Database:

```text
PostgreSQL
```

다음 사항을 고려하여 Schema를 설계한다.

- Entity 관계
- 데이터 무결성
- PK
- FK
- UNIQUE
- NOT NULL
- INDEX
- 삭제 정책
- 실제 조회 패턴

JPA 사용 시 불필요한 EAGER Loading을 피한다.

기본적으로 LAZY Loading을 사용한다.

필요한 조회에서는 상황에 따라 다음 방법을 사용한다.

- Fetch Join
- EntityGraph
- QueryDSL Projection

N+1 Query를 방지한다.

---

# 10. API

REST API를 기본으로 한다.

예:

```text
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
```

HTTP Method와 Status Code를 의미에 맞게 사용한다.

API Response와 Error Response 형식을 일관되게 유지한다.

---

# 11. Authentication & Authorization

사용자 인증 기능을 제공한다.

초기 인증 후보:

- Email Login
- Google OAuth
- GitHub OAuth

실제 구현 단계에서는 가장 단순하면서 유지보수 가능한 방법을 선택한다.

사용자는 자신의 데이터만 조회, 수정, 삭제할 수 있어야 한다.

민감한 API에서는 Backend에서 Authorization을 검증한다.

Frontend에서 UI를 숨기는 것만으로 권한을 처리하지 않는다.

---

# 12. Job Parsing Security

JobTracker에서 URL 분석 기능은 중요한 보안 영역이다.

특히 **SSRF**를 고려한다.

Backend가 다음과 같은 위험한 주소에 요청하지 못하도록 검증한다.

- localhost
- loopback address
- private network
- link-local address
- cloud metadata endpoint
- 기타 내부 네트워크 주소

URL scheme과 host를 검증한다.

Redirect가 발생하는 경우 redirect destination도 검증 대상에 포함한다.

Parser는 외부 URL을 신뢰하지 않는다.

URL 분석 기능에는 필요에 따라 timeout, response size 제한 등의 보호 장치를 적용한다.

---

# 13. Error Handling

Backend는 일관된 Error Response를 제공한다.

Global Exception Handler를 사용한다.

Frontend에서는 Backend 오류를 사용자에게 적절한 형태로 표시한다.

다음 오류를 구분할 수 있도록 한다.

- Validation Error
- Authentication Error
- Authorization Error
- Not Found
- Conflict
- External Parsing Error
- Network Error
- Internal Server Error

사용자에게 Stack Trace 또는 내부 구현 정보를 노출하지 않는다.

---

# 14. Testing Requirements

모든 코드에 무조건 테스트를 작성하는 것을 목표로 하지 않는다.

핵심 Business Logic을 우선적으로 테스트한다.

Backend:

- JUnit 5
- Mockito
- Spring Boot Test
- Testcontainers

Frontend:

- Vitest
- React Testing Library
- Playwright

우선 테스트 대상:

- 인증 및 권한
- 채용공고 등록
- 채용공고 중복 처리
- Skill Normalization
- Application 상태 변경
- Application Status History
- Analytics 계산
- Job Parsing
- URL Validation

주요 E2E Flow:

```text
로그인
→ 채용공고 URL 입력
→ 분석
→ 분석 결과 수정
→ 저장
→ 지원 등록
→ Kanban 상태 변경
→ Dashboard 반영
```

---

# 15. Infrastructure & Deployment

기본 인프라:

- GitHub
- Docker
- Docker Compose
- GitHub Actions
- PostgreSQL

로컬 개발환경은 가능한 한 Docker Compose를 통해 쉽게 구성할 수 있도록 한다.

배포 후보:

### Frontend

- Vercel

### Backend

- AWS

### Database

- PostgreSQL
- AWS RDS

필요한 경우:

- AWS S3
- CloudFront
- Route 53

실제 필요성이 생겼을 때 도입한다.

---

# 16. CI/CD

GitHub Actions를 사용한다.

기본 CI:

```text
Push / Pull Request
→ Install
→ Lint
→ Test
→ Build
```

배포 Pipeline을 구축할 경우:

```text
Build
→ Test
→ Docker Image Build
→ Deploy
```

테스트 또는 필수 검증이 실패한 상태에서 자동 배포하지 않는다.

---

# 17. Development Phases

## Phase 1 — Project Setup

- Repository 구성
- Next.js
- Spring Boot
- PostgreSQL
- Docker Compose
- 환경변수 관리
- 기본 CI

## Phase 2 — Core Domain

- User
- Authentication
- Company
- JobPosting
- Skill
- Application
- 기본 CRUD

## Phase 3 — Main UX

- Dashboard
- Job List
- Job Detail
- Kanban
- Calendar
- Search
- Filter
- Charts

## Phase 4 — Job URL Analysis

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

## Phase 5 — Analytics

- 기술 등장 빈도
- 직무별 기술
- 지원 통계
- 지원 Funnel
- 기간별 통계
- My Skills 비교

## Phase 6 — Advanced Features

필요성이 확인된 기능만 추가한다.

- LLM Structured Extraction
- OAuth
- Notification
- Redis
- Rate Limiting
- Job Snapshot 개선

## Phase 7 — Production

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
- README 정리

---

# 18. UX Requirements

UI는 단순한 관리자 페이지처럼 구성하지 않는다.

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

Dashboard에서는 중요한 정보를 빠르게 파악할 수 있어야 한다.

복잡한 데이터는 적절한 Chart와 Visualization을 사용한다.

과도한 Animation이나 장식보다 사용성과 정보 전달을 우선한다.

---

# 19. Scope & Non-Goals

기능 개수보다 완성도를 우선한다.

우선순위:

```text
1. 안정적인 핵심 기능
2. 좋은 UX
3. 올바른 DB / API 설계
4. 테스트
5. 배포
6. 문서화
7. 고급 기능
```

다음 기술은 기본 요구사항이 아니다.

- Kafka
- Kubernetes
- Elasticsearch / OpenSearch
- Microservices
- Redis
- 복잡한 Event Driven Architecture

포트폴리오를 화려하게 보이게 하기 위한 목적으로 기술을 추가하지 않는다.

실제 문제와 명확한 도입 이유가 있을 때만 추가한다.

대규모 채용공고 크롤링 플랫폼을 목표로 하지 않는다.

전체 채용시장을 분석하는 서비스로 표현하지 않는다.

LLM 자체가 서비스의 핵심 의존성이 되도록 만들지 않는다.

---

# 20. Final Product Goal

최종적으로 다음 사용자 경험을 제공한다.

```text
사용자가 채용공고 URL을 입력한다.
        ↓
JobTracker가 공고 정보를 분석한다.
        ↓
회사 / 직무 / 기술스택 / 경력 / 마감일 등을 구조화한다.
        ↓
사용자가 분석 결과를 확인하고 수정한다.
        ↓
채용공고를 저장한다.
        ↓
지원 여부와 지원 단계를 관리한다.
        ↓
Kanban과 Calendar에서 취업 활동을 관리한다.
        ↓
저장된 채용공고 데이터가 누적된다.
        ↓
Dashboard에서 현재 지원 현황을 확인한다.
        ↓
Analytics에서 저장한 공고의 기술 요구사항과
자신의 취업 준비 데이터를 분석한다.
```

JobTracker의 핵심은 단순한 채용공고 저장 서비스가 아니다.

**채용공고 수집 → 구조화 → 지원 관리 → 데이터 분석**

전체 과정을 하나의 웹 서비스에서 제공하는 것이 최종 목표다.

---

# 21. Local Browser Verification

로컬 웹 화면을 확인할 때 이미 열려 있는 JobTracker 브라우저 탭이나 창이 있다면 새 창을 추가로 열지 않는다.

기존 JobTracker 탭을 원하는 경로로 이동하거나 새로고침하여 재사용한다.

열려 있는 JobTracker 탭이 없는 경우에만 새 브라우저 창을 연다.
