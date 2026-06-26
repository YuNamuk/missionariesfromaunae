# 배포 · 연동 가이드 (Vercel + Supabase)

이 문서는 **새 Supabase 프로젝트 생성 → DB 구성 → 시드 → Vercel 배포**까지의 순서입니다.
계정(Vercel·Supabase)은 이미 있다고 가정합니다.

---

## 1. Supabase 프로젝트 만들기

1. <https://app.supabase.com> → **New project**
   - Name: `missionaries` (자유)
   - Database Password: 강력하게 설정하고 따로 보관
   - Region: `Northeast Asia (Seoul)` 권장
2. 생성까지 1–2분 대기.

## 2. 스키마 적용

1. 프로젝트 → 왼쪽 **SQL Editor** → **New query**
2. 이 저장소의 [`db/schema.sql`](db/schema.sql) 내용을 **전체 복사 → 붙여넣기 → Run**
3. 테이블이 생성됐는지 **Table Editor**에서 `people`, `places`, `sources`, `ingestion_candidates` 확인.

> 스키마는 공개 읽기(RLS `public read`)만 허용하고, 쓰기는 service role로만 가능합니다.
> 크롤링 검수 대기열(`ingestion_candidates`)은 공개 정책이 없어 외부에서 읽히지 않습니다.

## 3. 키 확보

프로젝트 → **Project Settings → API**:

| 키 | 환경변수 | 노출 범위 |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | 공개 |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용 · 절대 노출 금지** |

## 4. 로컬 환경변수

```bash
cp .env.example .env.local
# .env.local 을 열어 위 3개 값을 채운다
```

## 5. 시드(원본 데이터 적재)

```bash
npm install
npm run db:seed
```

성공하면 `✓ seeded: 11 people, 8 places, 14 relations …` 가 출력됩니다.
멱등(idempotent)이라 여러 번 돌려도 안전합니다.

> 시드는 `lib/data/seed.ts`(원본 `.dc.html`에서 추출한 데이터)를 그대로 DB에 넣고,
> 모든 행에 "원자료" `source` 출처를 연결합니다.

## 6. 로컬 실행

```bash
npm run dev      # http://localhost:3000
```

`/`, `/map`, `/timeline`, `/network`, `/people` 가 뜨면 OK.
(DB 키가 없어도 시드 모듈로 동작하지만, 키를 넣으면 DB 연동으로 확장 가능합니다.)

---

## 7. Vercel 배포

### A. GitHub 연결 방식(권장)
1. 이 폴더를 Git 저장소로 만들고 GitHub에 push.
   ```bash
   git init && git add -A && git commit -m "init: 조선 선교사 자료실"
   gh repo create missionaries --private --source=. --push
   ```
2. <https://vercel.com/new> → 해당 repo **Import**
3. Framework: **Next.js** 자동 인식. Root Directory: 그대로(저장소 루트).

### B. CLI 방식
```bash
npm i -g vercel
vercel            # 첫 배포(프리뷰)
vercel --prod     # 프로덕션
```

### Vercel 환경변수 등록
Project → **Settings → Environment Variables** 에 추가(Production+Preview):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # Sensitive 체크
CRAWLER_USER_AGENT
INGEST_TOKEN                  # 크롤링 API 보호 토큰(임의 문자열)
```

등록 후 **Redeploy**.

> 💡 Vercel ↔ Supabase는 [Vercel 마켓플레이스의 Supabase Integration](https://vercel.com/integrations/supabase)으로
> 환경변수를 자동 주입할 수도 있습니다. 수동 등록과 둘 중 하나만 쓰세요.

---

## 8. 크롤링(선택) — 출처는 항상 기록

검수 대기열에 공개 자료를 적재합니다. **자동 반영이 아니라** `ingestion_candidates`에
`pending` 상태로 쌓이고, 사람이 검토 후 `people`/`timeline_events` 등으로 승격합니다.

```bash
curl -X POST https://<배포도메인>/api/ingest \
  -H "content-type: application/json" \
  -H "x-ingest-token: $INGEST_TOKEN" \
  -d '{"urls":["https://example.org/article"]}'
```

- `robots.txt`를 확인하고 Disallow면 거부합니다.
- 모든 수집 항목은 `sources.source_url`(NOT NULL)에 원문 URL을 남깁니다 — UI에서 출처를 항상 표기.
- 저작권 본문은 통째 저장하지 않고 요약·발췌 + 출처 링크만 보관합니다.

---

## 다음 단계
- `lib/data/index.ts`를 DB 쿼리로 전환(현재는 시드 모듈 → 동일 반환형 유지).
- `ingestion_candidates` 검수용 관리자 페이지(`/admin/review`) 추가.
- 사이트별 전용 추출기(`lib/crawler/extract.ts` 확장)로 인물/연표 자동 매핑.
