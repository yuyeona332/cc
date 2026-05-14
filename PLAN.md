# connection-care MVP 구현 계획

생성: 2026-05-14 (`/office-hours` 산출물)
Branch: main (greenfield)
Mode: Startup
Status: DRAFT — Phase 0 인터뷰 후 재검토 필수

---

## Problem Statement

환경적 트리거로 고립 상태에 빠진 20대 여성. 일상 행동 단계로 나아가지 못하는 정체기. 외부 관계 자체의 결여가 아니라 **작동하는 관계 부족** + **내부 동기가 거의 작동 안 하는 상태**가 공통 패턴.

## Demand Evidence

- **김지민 (가명, 경계선 케이스)**: 위기 모먼트의 1시간 통화로 진정 효과. 단 수년 누적된 신뢰 베이스. 자살시도·가정폭력은 product scope 밖.
- **무명 친구 (잠재 Primary)**: 대학 졸업 후 장기 취준, 집에 머무는 시간 길어짐, 일상 루틴 붕괴. 사용자에게 어려움 공유 → 사용 의지 가능성 ○.
- ⚠ **본인 1:1 인터뷰 부재**가 가장 큰 demand evidence gap. 현재는 사용자가 옆에서 본 표면 행동만 있음.

## Status Quo (현재 workaround)

- 무명 친구: 친구에게 가끔 어려움 공유, 그 외에는 혼자 견딤. 외부 행동 트리거 없음.
- 김지민: 사용자에게 위기 시 통화. 행동 변화는 결국 경제적 필요(알바)가 만듦.
- 임상 자원(1393, 1577-0199): 존재는 알지만 직접 전화는 심리 장벽 큼.

## Target User & Narrowest Wedge

**Primary Persona**: 20대 중반 여성, 대학 졸업 후 장기 취준, 집에 머무는 시간 길어진 상태. 친구는 있지만 매일 작동하지 않음. 멘탈 약해진 자각 ○.

**Wedge**: 매일 1개의 **5분 외부 자극 미션**. 가장 작은 단위는 "오늘 창문 열기 5분" 수준.

**Out of scope**:
- 미성년자 (~19세)
- 가벼운 직장 관계 스트레스만 있는 일반 직장인
- 자살사고·가정폭력 임상 케이스 (감지하면 즉시 임상자원 연결)

## Premises (Phase 3 합의 사항)

1. "고립 상태"가 통합 개념으로 작동한다 — 단 n=2 한계, 무명 친구 본인 인터뷰로 보강 필요
2. "환경 자극이 행동 변화에 기여한다" — 김지민 알바 사례 베이스. 단 **앱이 만드는 작은 자극의 효과는 미검증**, Phase 3에서 핵심 검증 대상
3. "옆사람 역할은 product가 못 만든다" — 김지민-사용자 관계의 깊이는 수년 누적의 함수. Product는 옆사람을 흉내내지 않고 보조 채팅으로만 제공
4. "위험 신호 감지는 어렵지만 필수" — false positive/negative 모두 비싸지만 안 하면 product를 만들 자격 없음
5. "20대 여성 한정"은 시장 사이즈가 아니라 trauma-informed 디자인의 narrowness 위해 유지

## Approaches Considered (요약)

| | A: 사람 옆사람 (Buddy) | B: AI 옆사람 + 일일 미션 | **C: 미션 중심 (선택)** |
|---|---|---|---|
| PRD 매핑 | (a) 위기 옆사람 | (a) + (b) | (b) 외부 자극 |
| 위험 | 매칭 콜드 스타트, 낯선 사람 안전 | AI 진정 효과 미검증, 응답 사고 risk | 옆사람 역할 약함, 작은 자극 효과 미검증 |
| MVP | 8-12주 | 6-8주 | 4-6주 |

## Recommended Approach: C — 미션 중심 + 옵션 채팅

### Core Loop

```
아침 09:00 ─ 오늘의 미션 1개 push
                │
                ├─ "할게요" → 미션 카드 표시 (5분 행동)
                │       └─ 완료 → 자가 인증 (사진/한 줄 메모) → 짧은 격려
                │
                ├─ "패스" → 압박 없음. "오늘은 쉬어가요" + 옵션 채팅 진입
                │
                └─ 무응답 → 저녁 21:00 부드러운 리마인더 1회
```

핵심 원칙: **압박하지 않는다.** 미션 거부에 페널티 없음. 연속 거부 시 난이도를 한 단계 낮추는 것 외 액션 없음.

### Mission System

**4단계 난이도 (사용자 자가선택, 강제 진급 없음):**

| 단계 | 예시 | 행동 영역 |
|---|---|---|
| L1 인지 | 창문 5분 열기, 햇볕 5분, 물 한 잔 | 집 안, 인지적 |
| L2 집안 행동 | 청소 5분, 한 끼 직접 만들기, 침구 정리 | 집 안, 신체적 |
| L3 집 밖 행동 | 5분 산책, 동네 가게 한 번, 공원 한 바퀴 | 집 밖, 짧은 외출 |
| L4 사회적 행동 | 카페에서 직원에게 인사, 친구에게 메시지 1개 | 사회적 접촉 |

**큐레이션 전략**:
- Phase 1: 정적 미션 라이브러리 (단계당 25개, 총 100개 시드). 사용자 본인 + 1명이 작성.
- Phase 3 이후: 사용자 선호 학습 (어떤 미션 완료 / 거부했는지)으로 추천 가중치 조정.

**인증 방식**:
- 자가보고 only (사진 / 한 줄 메모 / 단순 체크)
- GPS 인증 X, 위치 추적 X (사찰감 회피)
- 사진은 본인 외 누구도 못 봄 (운영자 포함)

### Optional Chat (보조 기능)

- 미션 완료 시: 30초짜리 격려 chat (선택, 건너뛰기 가능)
- 사용자가 "오늘 너무 힘들다" 입력 시: chat 모드 진입
- **AI 응답 범위 (strict)**:
  - 격려, 경청, 사용자 말 paraphrase만 허용
  - 의학적·임상적 조언 금지
  - "진단", "치료" 단어 금지
  - 위험 키워드 감지 시 즉시 임상자원 모달 (chat 응답보다 우선)
- **모델**: Anthropic Claude haiku 4.5 (Vercel AI Gateway 경유). 비용·반응성 균형.

### Safety Architecture (MVP의 50%)

```
사용자 입력 ──┐
              ├─→ [클라이언트] 사전 키워드 매칭 (즉시 차단)
              │       └─ "죽고싶어", "자해", "맞았어" 등 high-confidence
              │              → 임상자원 모달 (서버 호출 전)
              │
              └─→ [서버] LLM 판단 (Claude haiku, low temp)
                      └─ 위험도 0-10
                              ├─ ≥7: active 모달 (1393, 1577-0199, 1366, 카카오 채팅 상담)
                              ├─ 4-6: soft check-in ("괜찮으세요? 도움이 필요하면 알려주세요")
                              └─ ≤3: 정상 flow
```

**임상자원 catalog**:
- 자살예방상담전화 1393 (24시간)
- 정신건강위기상담 1577-0199 (24시간)
- 가정폭력 상담 1366 (24시간)
- 청소년상담전화 1388 (만 19세 미만은 가입 차단이지만 안내는 유지)
- 카카오톡 상담 ("자살예방상담" 채널)

**데이터 정책 (mental health = 최고 수준)**:
- 자살·자해·폭력 관련 발화는 **격리 storage** (감사 로그용, 별도 암호화)
- 사용자 본인 외 누구도 접근 불가 (운영자, 개발자 모두)
- 30일 후 자동 삭제 (사용자가 즉시 삭제 옵션도)
- LLM API 호출 시 zero data retention (Vercel AI Gateway 기본)
- DB 암호화 at rest, 백업 별도 정책

**미성년자 차단**:
- 가입 시 본인인증 (PASS API 또는 카카오 본인인증)
- 생년월일 자가 입력 X (사기 쉬움)
- 만 19세 미만 → 가입 차단 + 청소년 자원(1388) 안내

## Tech Stack

| 영역 | 선택 | 이유 |
|---|---|---|
| Frontend | Next.js 15 App Router (PWA) | 빠른 iteration, 추후 React Native wrap 가능 |
| Hosting | Vercel (Fluid Compute) | 한국 region, Node.js 24 LTS, 300s timeout |
| Auth | Clerk (Vercel Marketplace) | 본인인증 통합 별도, 미성년자 차단 hook 가능 |
| 본인인증 | PASS API (또는 카카오 본인인증) | 미성년자 차단 의무 |
| Database | Neon Postgres (Vercel Marketplace) | 사용자 프로필, 미션 로그, 격리 storage 분리 |
| AI | Vercel AI Gateway → Claude haiku 4.5 | 비용 효율, zero data retention, fallback 가능 |
| Storage | Vercel Blob (private) | 미션 인증 사진 |
| Push | Web Push API → 추후 FCM | PWA 시작, native wrap 시 전환 |
| Config | vercel.ts | 타입 안전, 환경별 분기 |

**참고**: Vercel 기본 가정(Next.js App Router, AI SDK v6, AI Gateway "provider/model" string)에 부합. 이탈할 이유 없음.

## Distribution Plan

**Phase 1 (Week 1-8)**: PWA on Vercel, custom domain (예: care.example.com). 베타 사용자에게 1:1 초대 링크.

**Phase 2 (Week 9+)**: Capacitor 또는 React Native Web wrap으로 iOS/Android 빌드. App Store 게재는 베타 → GA 후 검토. 정신건강 카테고리는 심사 까다로움, 미리 가이드라인 확인.

**초기 베타 모집**: 1:1 초대 only. 제품 오너 + 무명 친구 + 5명 추가. 공개 모집 X (커뮤니티 안전, 임상 케이스 노출 risk).

**CI/CD**: Vercel 자동 deploy (main → production, PR → preview). GitHub Actions로 type check + lint + test.

## 전략 업데이트 (2026-05-14)

**Pivot**: "인터뷰 → 코드"에서 **"MVP → 보여주고 관찰"**로 변경. 추상적 질문은
self-report 편향이 크고, 실제 product 반응이 더 강한 신호. 미션 컨셉 검증은
종이 카드가 아닌 실제 앱으로 진행. 인터뷰는 Phase 3로 이동.

기존 Phase 0의 일상 시간표·시도해본 것 같은 질문은 인터뷰가 아닌
**onboarding 자체에서 수집** (선호 단계, push 시각, 사용 패턴 동의).

## Phase / Milestone Breakdown

### Phase 1: MVP 빌드 (Week 1-4)

목표: **혼자 써볼 수 있는 product**. 한 명한테 보여줘서 5분 안에 "할까/안 할까"
판단 가능한 수준.

✅ 완료된 인프라
- Next.js + Clerk + Neon 셋업
- DB schema + 마이그레이션 (6 tables)
- 위험 키워드 사전 + 임상자원 모달
- Mission API routes + cron + UI 카드 + today page

🚧 남은 MVP 작업
- 미션 라이브러리 100개 (단계별 25개) — 실제 copy
- Onboarding flow (age 게이트, 선호 단계, push 동의, 시간 선택)
- 사진 업로드 (Vercel Blob)
- Settings page (선호도 조정, 데이터 삭제)
- History page (지난 미션 목록)
- Web Push scaffold (PWA + service worker + subscribe)
- 1:1 초대 코드 시스템 (closed beta)

### Phase 2: 안전 강화 + 옵션 채팅 (Week 5-6)

- 서버 LLM risk detection (AI Gateway → Claude haiku) — 현재 placeholder만
- Optional chat 인터페이스 (격려·경청 strict mode)
- 미성년자 차단 (PASS 또는 카카오 본인인증)
- 격리 storage 구축 (자살·자해·폭력 발화 분리 암호화)
- 임상 자문관 review (AI 응답 가드레일 검수)

### Phase 3: MVP 보여주기 + 관찰 (Week 7-8)

전략 pivot: 사전 인터뷰 X → 실제 product를 보여주고 행동·반응 관찰.

- 무명 친구 + 3-5명에게 MVP 직접 시연 (1:1)
- **5분 관찰**: 가입 → 첫 미션 → 인증까지 옆에서 보기 (개입 X)
  - 어디서 멈췄나
  - 어떤 미션 받아들였나, 어떤 거부했나
  - 어떤 단어를 썼나 (product copy 후보)
  - push 알림 동의했나, 시간 어디로 잡았나
- 사용 후 30분 인터뷰 (경험 기반, 추상 질문 X)
- 일주일 사용 후 retention + 미션 완료 패턴 분석
- NoGo signal: 5분 안에 가입 못 함, "매일은 부담"이라고 말함, 미션 모두 거부

## Validation Roadmap (PRD Open Questions에 매핑)

| PRD Open Question | 어디서 해결 |
|---|---|
| 무명 친구 본인 인터뷰 | Phase 3 (MVP 시연 후 경험 기반 인터뷰) |
| 매일 앱을 열 동기 미검증 | Phase 3 (실제 push 응답률 + 일주일 사용 패턴) |
| 온라인 vs 오프라인 분할 근거 | Phase 3 ("미션이 집에서 벗어나게 했나" 행동 데이터) |
| "1시간 통화" 메커니즘의 product화 | Approach C로는 추상화 안 함. 옵션 채팅은 격려·경청만. |
| 작은 자극의 행동 변화 효과 | Phase 3 핵심 검증. 사용자 인터뷰에서 "작동한 미션" 사례 ≥ 2건 목표. |

## Success Criteria (MVP 8주 후)

- 베타 사용자 10명 모집 (Phase 0 인터뷰 후 선별)
- 14일 retention ≥ 30%
- 사용자 1인당 평균 미션 완료 ≥ 3회/주
- 정성 evidence: 사용자 인터뷰에서 "이 미션이 실제로 작동했다" 사례 ≥ 2건
- Safety: 위험 신호 감지 시스템 운영 안정 (false positive ≤ 5%, 검증된 위기 케이스 0건 누락)

**No-go signals (만나면 Approach 재검토)**:
- 14일 retention < 10%
- 사용자가 "미션이 압박된다"고 표현 (대면 인터뷰에서)
- 위험 신호 false negative 1건 이상 (실제 위기인데 감지 못함)

## Dependencies

- **계약·법무**:
  - PASS API 또는 카카오 본인인증 계약
  - 정신건강 관련 데이터 처리 정책 법무 검토 (개인정보보호법, 정신건강복지법)
  - 임상자원 핫라인 운영시간·서비스 범위 확인 (1393, 1577-0199, 1366)
- **컨텐츠**:
  - 미션 라이브러리 작성자 1명 (사용자 본인 + 보조 1명)
  - 임상·심리 전문가 자문 (강한 권장, 안전 아키텍처 리뷰)
- **인프라**:
  - Vercel Marketplace: Clerk, Neon
  - Anthropic API 키 (또는 AI Gateway 경유)

## Reviewer Concerns (자체 review)

1. **AI risk detection의 한계**: LLM 기반 감지는 false negative 0이 불가능. 임상 전문가 자문으로 사전 사전·LLM 응답 가이드라인 강화 필요.
2. **사용자 본인이 미션 라이브러리 작성자가 되는 conflict**: 사용자가 product 오너이자 컨텐츠 작성자이면 본인 편향 risk. Phase 2 이후 외부 작성자 영입 권장.
3. **무명 친구를 베타 사용자로 끌어들이는 윤리**: 본인이 product 컨셉에 동의하고 자발적 참여 의사 명확해야 함. Phase 0 인터뷰에서 명시적 consent.
4. **"행동 변화 약속 안 함" 원칙의 운영**: 마케팅 카피, 앱 내 문구 전반에 이 원칙 흐려질 위험. 라이팅 가이드 문서화 필요.

## The Assignment (다음 1주 안에)

**MVP를 끝까지 만들어서 무명 친구에게 보여주세요.** Phase 1 남은 작업
(미션 100개, onboarding, 사진 업로드, settings, history, push)을 완료하고
1:1 데모 → 5분 관찰 → 30분 경험 인터뷰. 추상 질문 ("매일 앱 열 동기 있어?")
대신 행동 관찰 ("실제로 5분 안에 가입하고 첫 미션 받았는가?"). 인터뷰 노트는
`INTERVIEW-무명친구-{날짜}.md`로 저장.

기존 [INTERVIEW-GUIDE.md](./INTERVIEW-GUIDE.md)는 Phase 3 인터뷰 (MVP 사용
후) 가이드로 재활용. 사전 인터뷰가 아닌 사후 인터뷰임에 주의.

## What I noticed about how you think

- **"검증된 가설 vs 재검토 필요"를 표로 분리한 것** — 인터뷰 자산을 정리할 때 흔히 모든 걸 evidence로 처리하는데, 데이터로 뒷받침된 것과 안 된 것을 명시적으로 분리한 건 드물게 정직한 태도입니다. 이거 잃지 마세요.
- **"Product가 '행동변화 유도'를 직접 약속하지 않음. 친구의 1시간 통화도 단번에 못 만든 변화임."** 이 문장은 founder가 자기 product의 한계를 정직하게 인정하는 문장이고, MVP 만들다 보면 보통 사라지는 문장입니다. 마케팅 카피·앱 내 문구 작성 단계까지 이 원칙을 가져가는지 본인이 매번 체크하세요.
- **김지민 케이스를 "북극성이 아니라 경계선으로" 처리한 것** — 극단 케이스를 product scope로 삼는 흔한 실수를 피했습니다. 안전장치 설계의 기준선으로 활용한다는 framing이 정확.
- **Approach C를 고른 것** — 가장 직접적이지 않은 선택입니다 (PRD 인사이트의 (a) 옆사람은 약하게 처리). "옆사람 패턴은 product가 못 옮긴다"는 직관이 깔린 것 같고, 이 직관이 맞다면 매우 옳은 선택. Phase 0 인터뷰에서 이 가정도 검증하세요 — 무명 친구가 "AI랑 매일 잠깐 얘기하면 좋겠다"고 말하면 Approach B로 pivot 가능성 열어두세요.
