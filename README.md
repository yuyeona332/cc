# connection-care

고립 상태에 빠진 20대 여성을 위한 일일 미션 + 옵션 채팅 product.
PRD와 설계 근거는 [PLAN.md](./PLAN.md), 대안 접근은 [PLAN-B.md](./PLAN-B.md).

이 README는 **현재 코드베이스의 실제 상태**를 기록합니다. 설계 문서가 아닙니다.

---

## 현재 상태: Pre-Phase 1 인프라 scaffold

✅ 완료
- Next.js 16 + React 19 + TypeScript + Tailwind 4 (App Router)
- Drizzle ORM + Neon Postgres schema (5개 테이블)
- 위험 키워드 사전 (한국어, 첫 layer)
- 임상자원 catalog (1393 / 1577-0199 / 1366 / 1388 / 카카오 채팅)
- 미션 라이브러리 seed 구조 (placeholder copy)
- Vercel 설정 (`vercel.ts`, `next.config.ts`)
- Tailwind + ESLint + tsconfig

🚧 MVP 남은 작업 (Phase 1)
- 미션 라이브러리 100개 (단계별 25개) 실제 copy
- Onboarding flow (age 게이트, 선호 단계, push 동의, 시간 선택)
- 사진 업로드 (Vercel Blob)
- Settings page (선호도 조정, 데이터 삭제)
- History page (지난 미션 목록)
- Web Push scaffold (PWA + service worker)

🔜 Phase 2 (안전·임상)
- AI chat 시스템 prompt — 임상 자문관 review 후 활성화
- 본인인증 통합 (PASS 또는 카카오)
- 격리 storage 구축

🚧 Phase 1에서 추가 예정
- Clerk middleware (`@clerk/nextjs` 설치됨, 환경변수 셋업 후 추가)
- 본인인증 (PASS 또는 카카오) → 미성년자 차단
- DB 마이그레이션 (`npm run db:generate && npm run db:migrate`)
- Web Push API + service worker
- 위험 키워드 모달 컴포넌트
- 미션 인증 (사진/메모) UI

---

## 폴더 구조

```
app/                      # Next.js App Router
  layout.tsx              # 한국어 root layout
  page.tsx                # 베타 안내 landing
lib/
  db/
    schema.ts             # users / missions / mission_assignments
                          # / mission_logs / risk_events / audit_log
    client.ts             # Neon HTTP + Drizzle 연결
  safety/
    keywords.ts           # 한국어 위험 키워드 사전 (첫 layer)
  crisis-resources/
    catalog.ts            # 1393 외 임상자원
  missions/
    types.ts              # MissionLevel, MissionTemplate
    seed.ts               # PLACEHOLDER 미션 라이브러리
drizzle/                  # 마이그레이션 (db:generate 후 생성)
vercel.ts                 # Vercel 빌드/cron/헤더 설정
next.config.ts            # strict mode + typedRoutes
PLAN.md                   # 선택된 접근 (Approach C) 설계
PLAN-B.md                 # 대안 (AI 옆사람) 설계
```

---

## 로컬 개발

### 옵션 A: 빠른 데모 (auth/DB 없이 UX만)

`.env.local`이 이미 placeholder로 채워져 있고 dev 서버는 그대로 부팅됩니다.

```bash
npm run dev
# → http://localhost:3001/demo
```

`/demo`는 가입·로그인·DB 없이 4단계 미션 카드를 보여줍니다. 메모에
"죽고싶어" 같은 위험 키워드를 적으면 crisis modal이 즉시 뜹니다.

### 옵션 B: 전체 MVP (Clerk + Neon + Blob)

각 서비스 무료 tier로 10분 안에 셋업 가능합니다.

1. **Clerk** ([clerk.com](https://clerk.com)) → New Application → "API Keys"에서
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_test_...)
   - `CLERK_SECRET_KEY` (sk_test_...)
2. **Neon** ([neon.tech](https://neon.tech)) → New Project → Connection string을
   - `DATABASE_URL`
3. **Vercel Blob** (선택, 사진 업로드 시) → Vercel 프로젝트 → Storage → Blob → Token을
   - `BLOB_READ_WRITE_TOKEN`

`.env.local`을 위 값으로 교체 후:

```bash
npm run db:migrate   # 6 tables 생성
npm run db:seed      # 100개 미션 시드
npm run dev          # 자동 재시작 또는 새로 실행
```

브라우저: `http://localhost:3001/sign-up` → 가입 → onboarding 3-step →
첫 미션.

### 검증

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm run build       # production build (env 필요)
```

---

## The Assignment

**MVP를 완성해서 시연 가능 상태로**. Phase 1 남은 작업을 끝낸 뒤 무명 친구
+ 3-5명에게 보여주고 5분 관찰. 사전 인터뷰가 아니라 사용 관찰 + 사후 인터뷰
전략 (PLAN.md §Phase 3 참조).

NoGo 신호 (MVP 시연 후 만나면 Approach 재검토):
- 5분 안에 가입 → 첫 미션까지 못 도달
- "매일은 부담"이라고 명확히 말함
- L1~L4 미션 모두 거부

---

## Safety 원칙 (코드 어디서든 어겨선 안 됨)

1. 위험 키워드 감지 시 사용자 발화 원문을 표준 DB에 저장하지 않습니다.
   격리 storage(추후 Phase 2 구축)로 라우팅. `risk_events.matched_keywords`에는
   카테고리 id만 저장.
2. "행동 변화 유도"를 약속하는 카피 금지. 미션 prompt는 "할까요?" / "안 해도
   괜찮아요" 톤 강제.
3. 미성년자(만 19세 미만) 차단. Phase 2 본인인증 통합 전까지는 onboarding
   자체를 막아둡니다.
4. AI 응답에 의학 단어, 진단 단어, "전문가와 상담하세요" 식 회피성 답변 금지.
   임상 자문관 review 통과 전 production 배포 불가.

---

## 다음 결정 지점

1. Phase 0 인터뷰 일정 잡기 (1주 내)
2. Neon 프로젝트 생성 + DATABASE_URL 발급
3. Clerk 프로젝트 생성 + 키 발급
4. AI Gateway 키 발급 (Anthropic 직접 연결 X — gateway 경유)
5. 임상 자문관 1명 영입 (Plan C는 강한 권장, AI chat 활성화 시점부터는 필수)
