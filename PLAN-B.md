# connection-care MVP 구현 계획 — Plan B (AI 옆사람 + 일일 미션)

생성: 2026-05-14 (`/office-hours` 산출물, Plan C와 비교용 alt)
Branch: main (greenfield)
Mode: Startup
Status: DRAFT — Phase 0 인터뷰 후 재검토 필수
Companion: [PLAN.md](PLAN.md) (Approach C)

---

## Problem Statement

환경적 트리거로 고립 상태에 빠진 20대 여성. 일상 행동 단계로 나아가지 못하는 정체기. 외부 관계 자체의 결여가 아니라 **작동하는 관계 부족** + **내부 동기가 거의 작동 안 하는 상태**가 공통 패턴.

## Demand Evidence

- **김지민 (경계선 케이스)**: 위기 모먼트의 1시간 통화로 진정 효과. 수년 누적 신뢰 베이스. 자살시도·가정폭력은 product scope 밖.
- **무명 친구 (잠재 Primary)**: 대학 졸업 후 장기 취준, 집에 머무는 시간 길어짐, 일상 루틴 붕괴. 친구에게 어려움 공유 → 사용 의지 가능성 ○.
- ⚠ **본인 1:1 인터뷰 부재**가 가장 큰 demand evidence gap.

## Approach B 핵심 가설

> **"AI 옆사람이 매일 1회 짧은 대화를 통해 (a) 위기 모먼트의 안전한 옆사람 역할을 하고, (b) 대화 안에서 작은 외부 자극(미션)을 자연스럽게 제안할 수 있다면, 고립 상태의 사용자는 행동 정체에서 한 단계 나아갈 수 있다."**

⚠ **이 가설의 가장 큰 미검증 부분**: 김지민-사용자의 1시간 통화 효과는 "수년 누적 신뢰"가 베이스였음. AI는 처음부터 0에서 시작. **"신뢰 없는 옆사람"이 진정 효과를 만들 수 있는가**가 Approach B의 핵심 검증 대상.

## Status Quo

- 무명 친구: 친구에게 가끔 어려움 공유. 외부 행동 트리거 없음.
- 김지민: 사용자에게 위기 시 통화. 행동 변화는 결국 경제적 필요(알바)가 만듦.

## Target User & Narrowest Wedge

**Primary Persona**: 20대 중반 여성, 장기 취준, 집에 머무는 시간 길어짐. 친구는 있지만 매일 작동하지 않음.

**Wedge**: 매일 1회 5분 AI chat (안부 + 자연스러운 미션 제안). "AI랑 매일 잠깐 얘기" 컨셉.

**Out of scope**:
- 미성년자 (~19세)
- 자살사고·가정폭력 임상 케이스 (감지 즉시 임상자원 연결)
- 가벼운 직장 관계 스트레스만 있는 일반 직장인

## Premises (Phase 3 합의 + Plan B 특화)

1. "고립 상태"가 통합 개념 — n=2 한계, 본인 인터뷰로 보강
2. "AI 옆사람이 매일 짧은 대화로 진정 효과를 만들 수 있다" — **미검증, Approach B의 베팅**
3. "AI가 자연스럽게 미션을 제안하면 사용자가 받아들인다" — 미검증
4. "AI 응답 사고(자살 신호 시 잘못된 응답)는 product를 죽일 수 있는 risk" — Safety architecture가 product의 60% (Plan C의 50%보다 더)
5. "20대 여성 한정"은 trauma-informed 디자인의 narrowness 유지 위해

## Approaches Considered (요약)

| | A: 사람 옆사람 | **B: AI 옆사람 + 미션 (이 문서)** | C: 미션 중심 ([PLAN.md](PLAN.md)) |
|---|---|---|---|
| PRD 매핑 | (a) | (a) + (b) | (b) |
| MVP | 8-12주 | 6-8주 | 4-6주 |
| 위험 | 매칭 콜드 스타트, 안전 | AI 응답 사고, 진정 효과 미검증 | 옆사람 역할 약함 |

## Recommended Approach: B (사용자 선택)

### Core Loop

```
아침 09:00 ─ AI 안부 push: "오늘 아침 어떠세요?"
                │
                ├─ 사용자 응답 → AI 짧은 대화 (3-5 turn)
                │       ├─ 분위기 좋음 → 미션 제안 (선택적, 자연스럽게)
                │       │       └─ 수락 → 미션 카드 + 저녁 체크인
                │       │       └─ 거부 → "오늘은 이대로도 좋아요"
                │       │
                │       ├─ 분위기 어두움 → 경청 모드 (미션 안 함)
                │       │
                │       └─ 위험 신호 → 즉시 임상자원 모달 (AI 응답 중단)
                │
                ├─ "패스" / 무응답 → 저녁 21:00 부드러운 리마인더 1회
                │
                └─ 사용자가 먼저 chat 진입 가능 (24시간 ready)
```

**핵심 차별점 vs Plan C**:
- 대화가 메인, 미션은 대화에서 파생
- AI가 매일 다른 응답 (대화 컨텍스트 누적)
- 사용자가 위기 시 먼저 AI에게 말 걸 수 있음

### AI 옆사람 디자인

**역할 정의 (system prompt 핵심)**:
- 친구처럼 짧게, 가볍게, 정직하게
- 진단·치료 X. 격려·경청·paraphrase O
- 사용자 말의 70%는 그대로 받아주고, 30%만 부드러운 reframe
- 미션 제안은 강요 X. 분위기 보고 자연스럽게.
- 위험 신호 감지 시 즉시 임상자원 연결 (자기 대화 중단)

**페르소나**:
- 이름: 미정 (Phase 0 인터뷰에서 사용자가 원하는 이름 받음)
- 톤: 동년배 친구 톤. 반말·존댓말은 사용자가 선택.
- 절대 금지: "괜찮아요" 식 dismissive 응답, "전문가와 상담하세요" 형식적 회피, 의학 단어

**대화 메모리**:
- 단기 (최근 7일 대화): full transcript
- 장기 (7일 이전): AI가 매주 summary 생성, embedding 저장
- 사용자가 언제든 "기억 삭제" 가능 (UX 명확)

**모델 선택 (계층화)**:
| 상황 | 모델 | 이유 |
|---|---|---|
| 일상 안부 대화 | Claude haiku 4.5 | 비용·반응성 |
| 위험도 판단 | Claude haiku 4.5 (low temp) | 비용 효율 |
| 위험도 ≥ 4 응답 | Claude opus 4.7 | safety-critical, 최고 reasoning |
| 주간 메모리 요약 | Claude haiku 4.5 (배치) | 비용 효율 |

### Mission System (Plan B 통합)

**Plan C의 4단계 라이브러리는 그대로 활용**. 단 차이점:
- AI가 대화 흐름 보고 "이런 거 해볼래요?" 식으로 제안
- 사용자가 chat에서 "오늘 뭐 할까?" 물으면 AI가 추천
- 정적 라이브러리(100개) + AI 자유 생성(낮은 빈도, 검토된 카테고리 안에서만)

**미션 제안 정책**:
- 분위기 어두운 날: 미션 제안 안 함
- 연속 거부 3회: 자동으로 미션 없는 대화만
- L4(사회적 행동)는 사용자가 명시적으로 요청해야 제안

### Safety Architecture (MVP의 60% — Plan C보다 더)

AI가 사용자 발화에 **직접 응답**하므로 safety surface가 훨씬 큼.

```
사용자 입력 ──┐
              ├─→ [클라이언트] 사전 매칭
              │       └─ "죽고싶어", "자해", "맞았어"
              │              → 임상자원 모달 (서버·AI 호출 전)
              │
              ├─→ [서버 step 1] 위험도 판단 LLM (Claude haiku, low temp)
              │       └─ 위험도 0-10
              │
              ├─→ 위험도 ≥ 7 ─→ AI 응답 차단
              │                    → active 임상자원 모달 즉시
              │                    → 미리 정의된 안전한 응답 1개만 표시
              │
              ├─→ 위험도 4-6 ─→ Claude opus 4.7로 escalate
              │                    → "옆사람 모드" prompt (경청 only)
              │                    → soft check-in 풋터 노출
              │
              └─→ 위험도 ≤ 3 ─→ Claude haiku 일반 대화
                                   → 미션 제안 가능
```

**AI 응답 가드레일 (system prompt + output filter)**:
- 응답 후 filter 1회: "이 응답에 의학 단어, 진단 단어, 부정적 framing 있나?" → 있으면 재생성 또는 안전한 default 응답으로 교체
- 모든 응답 로깅 (감사 가능)

**Pre-launch safety testing**:
- 자살 신호 prompt 100개 시나리오 (외부 검증된 데이터셋 또는 자체 작성)로 red team
- 임상 자문관이 응답 100개 직접 review
- pass rate 95% 이상 도달 전 베타 차단

**임상자원 catalog** (Plan C와 동일):
- 1393 자살예방상담 / 1577-0199 정신건강위기상담 / 1366 가정폭력 / 1388 청소년상담 / 카카오 채팅 상담

**데이터 정책 (Plan C보다 강함, 대화 데이터가 많음)**:
- 모든 대화 별도 암호화 storage (AES-256)
- 자살·자해·폭력 키워드 발화는 격리 storage 추가 분리
- 사용자 본인 외 접근 불가 (운영자·개발자 포함)
- LLM API 호출 시 zero data retention (Vercel AI Gateway + Anthropic ZDR)
- 30일 후 자동 삭제, 사용자 즉시 삭제 옵션
- 가입 시 명시적 동의 + 매월 1회 데이터 관리 UI 안내

**미성년자 차단**:
- PASS API 또는 카카오 본인인증 (Plan C와 동일)

## Tech Stack

| 영역 | 선택 | Plan C 대비 차이 |
|---|---|---|
| Frontend | Next.js 15 App Router (PWA) | 동일 |
| Hosting | Vercel (Fluid Compute) | 동일 |
| Auth | Clerk (Vercel Marketplace) | 동일 |
| 본인인증 | PASS / 카카오 본인인증 | 동일 |
| Database | Neon Postgres + 격리 storage | 격리 storage 분리 더 강조 |
| AI | Vercel AI Gateway → haiku (대화) + opus (위기) | **계층화, 비용 ↑** |
| AI SDK | Vercel AI SDK v6 streaming | 새로 추가 |
| 대화 메모리 | Postgres (단기) + pgvector embedding (장기) | 새로 추가 |
| Storage | Vercel Blob (private) | 미션 사진 (보조) |
| Push | Web Push API | 동일 |
| 모니터링 | Vercel Analytics + 자체 safety dashboard | safety dashboard 필수 |

**비용 추정 (베타 10명, 사용자당 일 5 turn)**:
- haiku 호출 ~50/day/user, opus 호출 ~5/day/user
- 월 비용 (10명 기준): ~$50-100 (AI), ~$20 (Vercel 인프라)
- 100명으로 확장 시: ~$500-1000/월. opus 사용 비율이 비용 driver.

## Distribution Plan

Plan C와 동일: PWA → 1:1 초대 베타 → React Native wrap → App Store (단 정신건강 카테고리 심사 까다로움 미리 확인).

## Phase / Milestone Breakdown

### Phase 0: 무명 친구 본인 인터뷰 (Week 0, 코드 0줄)

Plan C와 동일하지만 **추가 질문**:
- "AI랑 매일 짧게 대화하는 거 어떻게 느껴? 부담될까, 도움될까?"
- "AI 옆사람이 친구 같으면 좋겠어, 상담사 같으면 좋겠어?"
- "위기 때 AI한테 먼저 말 걸 수 있을 것 같아?"
- "AI가 미션 제안하면 받아들일 것 같아, 거부할 것 같아?"

**NoGo signal**: 무명 친구가 "AI랑 매일 대화는 부담", "AI는 신뢰 안 됨"이라고 명확히 말하면 Approach B 폐기, Plan C 또는 Plan A로 pivot.

### Phase 1: AI 대화 코어 (Week 1-3)

- Next.js + Clerk + Neon + AI SDK v6 셋업
- 일일 안부 push + chat UI (streaming)
- system prompt 1차 작성 (페르소나 + 가드레일)
- 대화 메모리 (단기 only, 7일 transcript)
- 클라이언트 키워드 사전 + 즉시 임상자원 모달
- **베타 차단**: 아직 사용자에게 안 보임

### Phase 2: Safety 강화 (Week 3-5) — Plan B의 핵심 작업

- 서버 위험도 판단 LLM (haiku low temp)
- opus escalation 경로
- Output filter (의학 단어, 진단 단어 차단)
- Pre-launch red team:
  - 자살 신호 prompt 100개 시나리오 테스트
  - 임상 자문관 응답 100개 review
  - **pass rate 95% 이상 달성 전 베타 차단 유지**
- 미성년자 차단 (PASS 통합)
- 격리 storage + 데이터 정책 동의 UX

### Phase 3: 미션 통합 (Week 5-6)

- 미션 라이브러리 시드 (Plan C와 동일, 100개)
- AI가 대화 흐름에서 미션 제안
- 미션 인증 UI (Plan C와 동일)
- 장기 메모리 (pgvector 주간 요약)

### Phase 4: 검증 & 학습 (Week 7-8)

- 5명 closed beta (사용자 + 무명 친구 + 3명)
- 매주 1:1 인터뷰
- 측정 (내부 dashboard, 사용자 노출 X):
  - DAU / WAU
  - 평균 chat turn / day
  - 미션 수락률 / 완료율
  - 14일 retention
  - 위험 신호 감지 건수 + opus escalation 빈도
  - **AI 응답 사고 0건** (정성 review)
- 정성: "AI랑 대화하는 게 도움이 됐나?" 사용자 직접 인터뷰

## Validation Roadmap

| PRD Open Question | 어디서 해결 |
|---|---|
| 무명 친구 본인 인터뷰 | Phase 0 |
| 매일 앱을 열 동기 | Phase 0 (직접) + Phase 4 (push 응답률, chat 시작률) |
| 온라인 vs 오프라인 분할 | Phase 0 + Phase 4 ("미션이 집 밖으로 나가게 했나") |
| **"1시간 통화" 메커니즘의 product화** | **Plan B의 핵심 검증**. AI 옆사람의 진정 효과 정성 측정. |
| 작은 자극의 행동 변화 효과 | Phase 4 검증 |

## Success Criteria (MVP 8주 후)

- 베타 사용자 5-10명 모집 (Phase 0 인터뷰 후 선별)
- 14일 retention ≥ 30%
- 평균 chat turn ≥ 3/day (Plan C는 미션 완료 횟수 기준, Plan B는 대화 횟수 기준)
- 미션 수락률 ≥ 30% (제안된 미션 중 수락)
- 정성 evidence: 사용자 인터뷰에서 "AI랑 대화가 도움됐다" 사례 ≥ 3건
- Safety: AI 응답 사고 0건, 위험 신호 감지 100% (false negative 0건)

**No-go signals**:
- 14일 retention < 10%
- 사용자가 "AI는 가짜 같다", "신뢰 안 된다"고 표현 (정성 dominant signal)
- AI 응답 사고 1건 이상 (자살 신호에 부적절 응답)
- pre-launch red team pass rate < 95%

## Dependencies

- **법무·임상**:
  - PASS / 카카오 본인인증 계약
  - 정신건강 데이터 처리 법무 검토
  - **임상 자문관 1명 (필수, Plan C에서는 권장이었지만 Plan B는 필수)** — AI 응답 가드레일, red team review
  - 임상자원 핫라인 정확성 검증
- **컨텐츠 / Prompt 엔지니어링**:
  - system prompt 작성·검증 (보통 2-3주 iteration)
  - 미션 라이브러리 (Plan C와 동일)
  - 자살 신호 red team 데이터셋 (외부 검증된 데이터 또는 임상 자문관과 자체 작성)
- **인프라**:
  - Vercel Marketplace: Clerk, Neon
  - Anthropic API (haiku + opus)
  - pgvector (Neon에 extension)

## Reviewer Concerns (자체 review)

1. **"신뢰 없는 AI 옆사람"의 진정 효과는 가장 큰 미검증 가정**. 김지민-사용자의 효과는 수년 신뢰 베이스였음. Plan B 전체가 이 가정 위에 서 있음. Phase 0 인터뷰가 이 가정의 첫 검증이고 부정적이면 즉시 pivot.
2. **AI 응답 사고는 product를 죽일 수 있는 risk**. 자살 신호에 부적절 응답 1건이 언론·SNS로 알려지면 product 신뢰 회복 불능. Safety가 60%인 이유.
3. **Anthropic ZDR 정책 변경 가능성** — 정신건강 데이터를 외부 LLM에 보내는 것 자체가 정책·여론 risk. Self-hosted LLM 옵션도 백업으로 검토.
4. **비용 escalation**: opus 사용 빈도가 위기 신호 빈도에 비례. 사용자 위기가 많은 product 특성상 비용 예측 어려움.
5. **사용자 의존도** — AI에게 의지하느라 실제 임상 자원·친구 관계가 더 멀어지는 risk. 매주 1회 임상자원·실제 관계 envoking UX 필요.

## The Assignment (다음 1주 안에)

**무명 친구 본인 1:1 인터뷰를 진행하세요.** 1시간, 위의 질문 가이드(특히 AI 관련 추가 질문) 들고. Plan B의 핵심 가설("AI 옆사람이 진정 효과를 만든다")이 무명 친구 한 명에게도 부정 응답 나오면 Plan C로 pivot. 인터뷰 노트는 `INTERVIEW-무명친구-{날짜}.md`로 저장.

## What I noticed about how you think

- **Approach C를 먼저 고른 다음 B도 보고 싶다고 한 것** — 두 접근을 비교 검토하려는 의도가 명확합니다. 단일 솔루션에 빠지지 않고 alternatives를 손에 두고 결정하려는 태도. 단 두 plan을 동시에 구현하지 마세요. Phase 0 인터뷰 결과로 둘 중 하나 선택, 다른 하나는 백업으로.
- **김지민 케이스를 경계선으로 처리한 PRD의 framing** — 이 framing은 Plan B에서 더 중요합니다. AI가 옆사람 역할을 한다는 게 김지민 같은 임상 케이스에게도 통한다고 약속하면 안 됨. 명확히 out-of-scope 처리하고 임상자원으로 즉시 escalate하는 정책이 Plan B의 안전성을 결정.
- **"행동변화 유도 약속 안 함" 원칙** — Plan B에서 더 어려워집니다. AI가 매일 대화하면 사용자는 "이 AI가 나를 바꿔줄 거"라고 기대하기 쉬움. system prompt와 마케팅 카피에서 이 원칙을 어떻게 유지할지 미리 작문해두세요.

## Plan B vs Plan C 비교 요약

| | Plan B (이 문서) | Plan C ([PLAN.md](PLAN.md)) |
|---|---|---|
| 메인 | AI chat | 미션 |
| 미션 | 대화 안에서 자연스럽게 | 매일 1개 push |
| 위기 시 | AI가 직접 응답 + escalate | 즉시 임상자원 모달 (AI 응답 최소) |
| MVP 기간 | 6-8주 | 4-6주 |
| Safety 비중 | 60% | 50% |
| 비용 | ~$50-100/월 (10명 베타) | ~$20-50/월 |
| 핵심 검증 | "AI 옆사람의 진정 효과" | "작은 자극의 행동 변화 효과" |
| 최악 시나리오 | AI 응답 사고 → 신뢰 회복 불능 | retention < 10% → pivot |
| 임상 자문관 | 필수 | 강한 권장 |
| Pre-launch red team | 95% pass 필수 | 키워드 사전 검증 |

**선택 기준 (Phase 0 인터뷰 후)**:
- 무명 친구가 "AI랑 매일 대화" 컨셉에 ○ → Plan B
- 무명 친구가 "매일 작은 미션" 컨셉에 ○, AI 대화에 × → Plan C
- 둘 다 부정적 → Approach 자체 재검토
- 둘 다 긍정적 → Plan C로 시작 (더 작은 surface, 빠른 검증), Plan B를 Phase 2로
