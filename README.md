# 조선 선교사 온라인 자료실 · Missionaries from Aunae (1882–1935)

한국 초기 개신교 선교사들의 발자취를 **지도·연표·관계망**으로 한눈에 살펴보는
디지털 아카이브입니다. 시각화로 맥락을 빠르게 파악하고, 데이터는 DB에 보존·갱신하며,
공개 자료를 출처와 함께 수집해 넓혀가도록 설계했습니다.

## 스택
- **Next.js 16** (App Router) · React 19 · TypeScript
- **Tailwind v4** + Dreamy School 디자인 토큰(`_ds`에서 이식)
- **Supabase / Postgres** (보존·갱신·분석)
- **react-leaflet** 지도 · SVG 관계망 그래프

## 화면
| 경로 | 내용 |
|---|---|
| `/` | 개요 대시보드 — 통계 + 4개 뷰 진입 + 인물 갤러리 |
| `/map` | 인터랙티브 지도 — 입국항·발상지·유적지, 연도 슬라이더, 관계선 |
| `/timeline` | 1882–1935 연표 — 전 인물 사건을 한 줄기로 |
| `/network` | 인물 관계망 — 영향·동역·사제·가족·계승 |
| `/people`, `/people/[id]` | 인물 목록·상세(요약·연표·관계·자료·출처) |

## 데이터
- 원본 큐레이션 데이터는 `조선 선교사 자료실.dc.html`에서 추출해
  타입드 모듈 [`lib/data/seed.ts`](lib/data/seed.ts)로 보존(인물 11 · 장소 8 · 관계 14 · 자료 10).
- 데이터 접근은 [`lib/data/index.ts`](lib/data/index.ts) 한 곳을 통하므로, DB 전환 시 이 레이어만 교체.

## 빠른 시작
```bash
npm install
npm run dev          # http://localhost:3000  (DB 없이도 시드로 동작)
```
DB·배포 연동은 **[SETUP.md](SETUP.md)** 참고 (Supabase 프로젝트 → 스키마 → 시드 → Vercel).

## 크롤링(출처 상시 표기)
`POST /api/ingest` 로 공개 자료를 **검수 대기열**에 적재합니다. robots.txt를 준수하고,
모든 항목은 원문 URL(`sources.source_url`, NOT NULL)을 남깁니다. 자동 반영이 아니라
사람이 검토 후 승격합니다. 상세는 [SETUP.md](SETUP.md) 8절.

## 디렉터리
```
app/                 라우트(개요·지도·연표·관계망·인물·api/ingest)
components/          site-header, person-card, network-graph, map/*
lib/data/            types · seed(원본) · index(접근 레이어)
lib/db/              supabase 클라이언트
lib/crawler/         robots · fetcher · extract · pipeline
db/schema.sql        Postgres 스키마 (RLS·출처 필수·검수 대기열)
scripts/seed.ts      DB 시드
_ds/                 Dreamy School 디자인 시스템(참조)
조선 선교사 자료실.dc.html   원본 인터랙티브 자료실(참조)
```
