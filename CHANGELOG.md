# Changelog

All notable changes to connection-care are documented here.

## [0.1.1.0] - 2026-05-14

### Added
- LOCAL 모드 — Clerk·Neon 환경변수 없이 `npm run dev`만으로 부팅. 쿠키 기반 게스트 세션(`cc_dev_user`) + 파일 SQLite(`./data/local.db`) + 미션 100개 자동 시드. 인터뷰 데모용.
- `getCurrentUserIdOrNull()` / `getCurrentUserId()` 어댑터(`lib/auth/current-user.ts`) — Clerk과 로컬 쿠키를 모드에 따라 분기.
- `getRuntimeMode()` 자동 판정(`lib/runtime/mode.ts`) — `CLERK_SECRET_KEY` + `DATABASE_URL` 둘 다 있으면 cloud, 아니면 local. Edge 호환.
- `getDb()` async getter(`lib/db/client.ts`) — Neon HTTP 또는 libsql을 모드에 따라 lazy init.
- SQLite-flavored schema(`lib/db/schema-sqlite.ts`)와 active-mode shim(`lib/db/schema.ts`).
- `lib/db/sql-fragments.ts` — dialect-aware `recentWindow(column, days)`.
- `lib/missions/today.ts` 첫 방문 시 lazy 미션 할당 — cron 부재(로컬 모드) 보완 + cloud cron 실패 시 안전망.
- `/api/auth/sign-out` 라우트 — 로컬 모드 쿠키 삭제, cloud는 클라이언트 Clerk 처리.

### Changed
- `middleware.ts`가 모드별로 분기 — 로컬은 게스트 쿠키 발급, cloud는 `clerkMiddleware` 동적 import 후 위임. Edge 호환 보장.
- `app/layout.tsx`가 로컬 모드에서 `ClerkProvider`를 `Fragment`로 우회.
- `app/sign-in`, `app/sign-up`이 로컬 모드에서 `/today`로 redirect.
- 모든 API 라우트(`app/api/missions/*`, `app/api/users/*`)와 서버 페이지(`/today`, `/onboarding`, `/settings`, `/history`)가 `getCurrentUserIdOrNull()` 사용.
- `lib/missions/assign.ts`에서 `assignForSingleUser(userId, options)` 추출, dialect 추상 헬퍼 사용. 기존 `assignDailyMissions`는 이걸 루프 호출.
- `app/api/upload/mission-photo` — 로컬 모드는 501. `components/mission-card.tsx`에 `allowPhoto` prop 추가, 로컬에서 사진 UI 숨김.
- `app/api/cron/daily-mission` — 로컬 모드는 no-op 200 응답.
- `next.config.ts`에 `serverExternalPackages: ["@libsql/client", "libsql"]` 추가 — native binding 번들링 방지.
- `.env.example` 갱신: 모든 환경변수가 cloud 전용, 로컬 모드는 셋업 불필요.
- `README.md` "옵션 A: LOCAL 모드" 섹션 + schema drift 주의 추가.

## [0.1.0.0] - 2026-05-13

### Added
- Plan C MVP scaffold: Next.js 16 App Router, Clerk + Neon Postgres + Drizzle ORM.
- Mission library seed (100 entries × 4 levels), crisis resource catalog, Korean risk-keyword dictionary.
- Daily mission flow: today / respond / log / cron 라우트, mission card component.
