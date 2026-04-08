# Mini Shop (Next.js + Prisma + PostgreSQL)

간단한 이커머스(쇼핑몰) 기능을 구현한 **풀스택 Next.js(App Router) 프로젝트**입니다.
상품 조회, 회원가입/로그인(JWT), 장바구니, 바로구매, 주문/결제, 관리자 상품 관리, Swagger API 문서까지 포함합니다.

## 1) 프로젝트 개요

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, TanStack Query
- **Backend(API)**: Next.js Route Handlers (`app/api/**`)
- **DB/ORM**: PostgreSQL + Prisma
- **Auth**: JWT(access token) + HttpOnly Cookie
- **API 문서**: `public/openapi.yaml` + `/docs`(Swagger UI iframe)

핵심 사용자 플로우:

1. 회원가입/로그인
2. 상품 목록/검색/상세 조회
3. 장바구니 담기 또는 바로구매
4. 배송지 입력 후 주문 생성
5. 관리자 권한으로 상품 CRUD

---

## 2) 코드 구조 분석

### App Router 페이지

- `app/page.tsx`
  - 상품 목록 페이지
  - 검색어/카테고리/정렬/페이지네이션 쿼리 파라미터 처리
  - 내부 API(`/api/products`)를 SSR fetch로 호출하여 렌더링
- `app/products/[id]/page.tsx`
  - 상품 상세 조회 및 구매 액션(장바구니/바로구매) 진입
- `app/cart/page.tsx`, `app/cart/CartClient.tsx`
  - 로그인 사용자 장바구니 조회/합계 확인/주문 이동
- `app/checkout/page.tsx`
  - 일반 장바구니 주문 + 바로구매(`mode=buy-now&intentId=`) 지원
  - 배송지 입력 후 `/api/checkout` 호출
- `app/login/page.tsx`, `app/signup/page.tsx`, `app/me/page.tsx`
  - 인증/내 정보 UI
- `app/admin/products/**`
  - 관리자 상품 목록/등록/수정 화면
- `app/docs/page.tsx`
  - Swagger UI 정적 파일을 iframe으로 표시

### API 레이어 (`app/api/**`)

- **Auth**
  - `POST /api/auth/signup` 회원 생성
  - `POST /api/auth/login` 로그인 + HttpOnly 쿠키 발급
  - `POST /api/auth/logout` 로그아웃
  - `GET /api/auth/session` 현재 세션 확인
- **Products**
  - `GET /api/products` 공개 상품 목록(검색/정렬/페이징)
  - `GET /api/products/:id` 상품 상세
- **Cart**
  - `GET /api/cart` 내 장바구니 조회
  - `POST /api/cart` 장바구니 추가/수량 증가
  - `PATCH/DELETE /api/cart/items/:itemId` 수량 수정/삭제
- **Buy Now / Checkout / Orders**
  - `POST /api/buy-now` 바로구매 intent 생성
  - `GET /api/buy-now/:intentId` intent 기반 단건 주문 데이터 조회
  - `POST /api/checkout` 주문 생성 + 재고 차감
  - `GET /api/orders`, `GET /api/orders/:orderId` 주문 조회
- **Admin**
  - `GET/POST /api/admin/products`
  - `GET/PATCH/DELETE /api/admin/products/:id`

### Domain / 유틸 레이어 (`lib/**`)

- `lib/prisma.ts`: Prisma 클라이언트 싱글턴
- `lib/auth.ts`: JWT 서명/검증, 쿠키 토큰 파싱, `requireAuth`
- `lib/password.ts`: 비밀번호 해시/검증
- `lib/http.ts`: 공통 응답(`ok`, `fail`, `created`) 및 request parsing
- `lib/product.ts`, `lib/cart.ts`, `lib/order.ts`, `lib/user.ts`
  - DB 모델 → API DTO 변환 및 도메인 유틸
- `lib/stores/auth-store.ts`
  - 클라이언트 인증 상태 스토어(Zustand 호환)

---

## 3) 데이터 모델(Prisma) 요약

`prisma/schema.prisma` 기준 주요 엔티티:

- `User`: 이메일/비밀번호 해시/역할(USER, ADMIN)
- `Product`: 가격, 재고, 상태(ACTIVE/INACTIVE/SOLD_OUT), 카테고리/태그
- `Cart`, `CartItem`: 사용자별 장바구니
- `Order`, `OrderItem`: 주문 및 주문 아이템
- `BuyNowIntent`: 바로구매 임시 의도 데이터

재고 검증/차감은 주문 생성 시점(`checkout`)에서 수행됩니다.

---

## 4) 실행 방법

### 4-1. 환경 변수

```bash
cp .env.example .env
```

필수 값 예시:

- `DATABASE_URL` (Prisma PostgreSQL 연결 문자열)
- `JWT_SECRET` (운영 환경에서 반드시 강한 랜덤 값)
- `NEXT_PUBLIC_SITE_URL` (로컬 기본값은 `http://localhost:3000`)

### 4-2. DB 실행 (Docker)

```bash
docker compose up -d postgres
```

### 4-3. 의존성 설치 및 Prisma 준비

```bash
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm exec prisma migrate deploy
```

> TypeScript에서 Prisma 타입이 어긋나면 `pnpm exec prisma generate` 후 dev 서버/TS 서버를 재시작하세요.

### 4-4. 개발 서버 실행

```bash
pnpm dev
```

브라우저:

- 앱: http://localhost:3000
- API 문서: http://localhost:3000/docs

---

## 5) 스크립트

```bash
pnpm dev       # 개발 서버
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버 시작
pnpm lint      # ESLint
pnpm prisma:generate
```

---

## 6) 인증/권한 동작 방식

- 로그인 성공 시 `access_token`을 HttpOnly 쿠키로 발급
- API에서는 `Authorization: Bearer` 또는 쿠키에서 토큰을 읽어 인증
- 관리자 API는 `auth.role === "ADMIN"` 검사로 접근 제어

운영 시 보안 체크리스트:

- `JWT_SECRET` 교체
- HTTPS 사용(쿠키 secure)
- CORS/도메인 정책 점검
- 비밀번호 정책 강화 및 계정 보호 로직(잠금/레이트리밋) 추가

---

## 7) 테스트

현재 기본 컴포넌트 테스트가 포함되어 있습니다.

```bash
pnpm test
```

또는 프로젝트에 맞는 테스트 실행 스크립트를 추가해 확장할 수 있습니다.

---

## 8) 개선 아이디어

- 결제 모듈(외부 PG) 연동 및 결제 상태 머신
- 주문 상태 전이(결제완료/배송중/배송완료/취소)
- 재고 동시성 제어 강화(락/버전 필드)
- 관리자 대시보드(매출/주문 통계)
- E2E 테스트(Cypress/Playwright) 추가
- CI 파이프라인(린트/테스트/마이그레이션 검증)

---

## 9) API 스펙

- OpenAPI 원본: `public/openapi.yaml`
- Swagger UI 정적 파일: `public/swagger-ui/*`

Swagger에서 대부분 엔드포인트를 Try it out으로 확인할 수 있습니다.
