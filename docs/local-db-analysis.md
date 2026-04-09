# 로컬 DB 사용 방식 분석

## 1) 로컬 DB 스택
- 애플리케이션은 **Prisma + PostgreSQL** 조합을 사용합니다.
- Prisma datasource provider는 `postgresql`로 설정되어 있고, 연결 URL은 `DATABASE_URL` 환경 변수를 사용합니다.
- 실행용 로컬 DB는 `docker-compose.yml`의 `postgres:16` 서비스(`shop-postgres`)로 구성됩니다.

## 2) 로컬 실행 시 DB 준비 흐름
1. `.env.example`의 `DATABASE_URL`을 `.env`에 복사
2. `docker compose up -d postgres`로 DB 컨테이너 실행
3. `pnpm exec prisma generate`
4. `pnpm exec prisma migrate deploy`

추가로 `postinstall`, `predev`, `prebuild` 스크립트에서 Prisma client 생성이 자동 수행되도록 구성되어 있습니다.

## 3) 런타임 연결 방식
- `lib/prisma.ts`에서 `pg`의 `Pool`을 생성하고 `@prisma/adapter-pg`의 `PrismaPg` 어댑터를 PrismaClient에 주입합니다.
- 개발 환경 HMR 대응을 위해 `globalThis.prisma` 싱글턴을 사용합니다.

## 4) DB를 실제로 읽고/쓰는 API 영역
### 인증/유저
- `POST /api/auth/signup`: `user.findUnique`, `user.create`
- `lib/auth.ts`: 사용자 조회 (`user.findUnique`)

### 상품
- `GET /api/products`: `product.count`, `product.findMany`
- `GET /api/products/:id`: `product.findUnique`
- 관리자 API: `product.findMany/create/findUnique/update/delete`

### 장바구니
- `GET /api/cart`: 사용자 cart 조회 후 없으면 생성
- `POST /api/cart`: 상품 검증 후 `cartItem.create/update`
- `PATCH/DELETE /api/cart/items/:itemId`: `cartItem.findUnique/update/delete`

### 주문/결제
- `POST /api/checkout`: 트랜잭션으로 `order.create(+items.create)` 후 `product.stock decrement`
- `GET/POST /api/orders`: 주문 목록/생성, cartItem 정리
- `GET /api/orders/:orderId`: 주문 단건 조회

### 바로구매
- `POST /api/buy-now`: `buyNowIntent.create`
- `GET /api/buy-now/:intentId`: intent 및 product 조회

## 5) 스키마/마이그레이션 특성
- 주요 테이블: `User`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, `BuyNowIntent`
- enum: `ProductStatus`, `OrderStatus`
- 인덱스/제약(예: `Cart.userId` unique, `CartItem(cartId, productId)` unique) 포함
- 마이그레이션은 순차적으로 init → product → cart → order → buy-now-intent 순서로 누적되어 있습니다.

## 6) 관찰 포인트 (로컬 개발 관점)
- `lib/mock-db.ts`는 인메모리 저장소 구현이지만 현재 코드에서 import/사용되지 않아 실사용 경로는 Prisma(PostgreSQL)입니다.
- signup API는 Prisma 에러 코드(`P1000`, `P1001`, `P2021`, `P2022`, `P2002`)를 분기 처리하여 DB 연결/스키마 문제를 노출합니다.
- checkout에서는 재고 차감이 트랜잭션 내부에서 수행되지만, 주문 API(`POST /api/orders`)는 cart 기반 주문 생성 후 재고 차감 로직이 없어 흐름별 일관성 점검이 필요합니다.
