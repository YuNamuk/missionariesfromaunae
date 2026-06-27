/* eslint-disable no-console */
// 결정적(모델 0) 사이트 점검. `npm run health` 로 데이터 정합성·로컬 사진·좌표,
// `npm run health -- --links` 로 외부 출처·원격 사진 URL 생존까지 점검한다.
// 각 이슈는 severity(error|warn) + autofix 가능 여부를 표기 → 루프가 안전한 것만 자동 처리.
import fs from "node:fs";
import path from "node:path";
import { PEOPLE, PLACES, BURIAL, GEO } from "../lib/data";
import { PHOTOS } from "../lib/data/photos";
import { HERITAGE } from "../lib/data/heritage";
import { BURIED_EXTRA, BURIED_SOURCE, BURIED_TOTAL } from "../lib/data/cemetery";
import { REGIONS } from "../lib/data/meta";

type Issue = { sev: "error" | "warn"; area: string; msg: string; autofix?: boolean };
const issues: Issue[] = [];
const add = (sev: Issue["sev"], area: string, msg: string, autofix = false) => issues.push({ sev, area, msg, autofix });

const placeIds = new Set(PLACES.map((p) => p.id));
const peopleIds = new Set(PEOPLE.map((p) => p.id));
const KO = { latMin: 32.5, latMax: 43.5, lngMin: 124, lngMax: 132 }; // 한반도 대략 범위

// 1) BURIAL 매핑의 장소 id 유효성
for (const [pid, cem] of Object.entries(BURIAL)) {
  if (!peopleIds.has(pid)) add("error", "BURIAL", `사람 id 없음: ${pid}`);
  if (!placeIds.has(cem)) add("error", "BURIAL", `묘역 place id 없음: ${cem} (←${pid})`);
}
// 2) BURIED_* 키가 실재 묘역 place id 인지
for (const k of [...Object.keys(BURIED_EXTRA), ...Object.keys(BURIED_SOURCE), ...Object.keys(BURIED_TOTAL)]) {
  if (!placeIds.has(k)) add("error", "cemetery", `BURIED_* 키가 place id 아님: ${k}`);
}
// 3) PHOTOS 키가 실재 인물인지
for (const k of Object.keys(PHOTOS)) if (!peopleIds.has(k)) add("warn", "PHOTOS", `PHOTOS 키가 인물 아님: ${k}`);

// 4) 로컬 호스팅 사진(/portraits/*) 파일 존재
const portraitsDir = path.join(process.cwd(), "public", "portraits");
const localPhotos = new Set<string>();
for (const ph of Object.values(PHOTOS)) if (ph.photo?.startsWith("/")) localPhotos.add(ph.photo);
for (const arr of Object.values(BURIED_EXTRA)) for (const b of arr) if (b.photo?.startsWith("/")) localPhotos.add(b.photo);
for (const rel of localPhotos) {
  const fp = path.join(process.cwd(), "public", rel.replace(/^\//, ""));
  if (!fs.existsSync(fp)) add("error", "photo", `로컬 사진 파일 없음: ${rel}`);
}

// 5) 좌표 범위(불확실 표기 없는데 한반도 밖). 국외 거점(cat:origin, 만주·일본)은 제외.
const originIds = new Set(PLACES.filter((p) => p.cat === "origin").map((p) => p.id));
for (const [id, ll] of Object.entries(GEO)) {
  if (!ll || originIds.has(id)) continue;
  const [lat, lng] = ll;
  if (lat < KO.latMin || lat > KO.latMax || lng < KO.lngMin || lng > KO.lngMax)
    add("warn", "coord", `GEO 좌표가 한반도 밖: ${id} (${lat},${lng})`);
}
const regionKeys = new Set(REGIONS.map((r) => r.key));
void regionKeys; // (인물 region은 place 기반이라 별도 점검 생략)
const heritageRegions = new Set(["서울·경기", "인천·강화", "충청", "호남", "영남", "관북·서북(북한)", "제주"]);
const seenH = new Set<string>();
for (const h of HERITAGE) {
  if (seenH.has(h.id)) add("error", "heritage", `중복 id: ${h.id}`);
  seenH.add(h.id);
  if (!heritageRegions.has(h.region)) add("warn", "heritage", `알 수 없는 region: ${h.region} (${h.id})`);
  const northKR = h.region.includes("북한");
  if (!h.coordUncertain && !northKR && (h.lat < KO.latMin || h.lat > KO.latMax || h.lng < KO.lngMin || h.lng > KO.lngMax))
    add("warn", "heritage", `좌표 한반도 밖(근사치 표기 없음): ${h.id} (${h.lat},${h.lng})`);
  if (!h.source?.length) add("warn", "heritage", `출처 없음: ${h.id}`);
}

// 5b) 묘역 명단 정합성: 명단 보유 묘역은 출처·총원 설명을 갖추고, 각 안장자는 이름·행적 필수.
for (const [cemId, arr] of Object.entries(BURIED_EXTRA)) {
  if (!BURIED_SOURCE[cemId]?.length) add("warn", "cemetery", `명단 출처 없음: ${cemId}`);
  if (!BURIED_TOTAL[cemId]) add("warn", "cemetery", `총원 설명 없음: ${cemId}`);
  arr.forEach((b, i) => {
    // 한국어명이 없어도 영문명만 있으면 표시 가능(묘비 OCR 손상·미상 인물). 둘 다 없을 때만 오류.
    if (!b.nameKo && !b.nameEn) add("error", "cemetery", `안장자 이름(한/영) 모두 없음: ${cemId}[${i}]`);
    else if (!b.role) add("warn", "cemetery", `안장자 행적 설명 없음: ${cemId}[${i}] (${b.nameKo || b.nameEn})`);
  });
}

// 6) (옵션) 외부 링크/원격 사진 생존
async function checkLinks() {
  const urls = new Set<string>();
  for (const ph of Object.values(PHOTOS)) if (ph.photo?.startsWith("http")) urls.add(ph.photo);
  for (const arr of Object.values(BURIED_EXTRA)) for (const b of arr) if (b.photo?.startsWith("http")) urls.add(b.photo);
  const list = [...urls];
  let i = 0;
  for (const u of list) {
    i++;
    try {
      const r = await fetch(u, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "MissionariesAtlas/1.0 (health-check; pgm@dreamyedu.net)" } });
      if (r.status === 429) add("warn", "link", `요청 제한(429, 재시도 필요·확정 아님): ${u}`);
      else if (!r.ok) add("error", "link", `사진 URL ${r.status}: ${u}`);
      else if (!(r.headers.get("content-type") || "").startsWith("image")) add("warn", "link", `이미지 아님(${r.headers.get("content-type")}): ${u}`);
    } catch (e) {
      add("warn", "link", `요청 실패: ${u} (${(e as Error).message})`);
    }
    await new Promise((res) => setTimeout(res, 1600)); // Commons rate limit 회피
    if (i % 10 === 0) console.error(`  …링크 ${i}/${list.length}`);
  }
}

async function main() {
  if (process.argv.includes("--links")) await checkLinks();
  const errors = issues.filter((i) => i.sev === "error");
  const warns = issues.filter((i) => i.sev === "warn");
  console.log(`\n=== 사이트 점검 결과 ===`);
  console.log(`데이터: 인물 ${PEOPLE.length} · 장소 ${PLACES.length} · 유적 ${HERITAGE.length} · 묘역명단 ${Object.values(BURIED_EXTRA).reduce((s, a) => s + a.length, 0)}`);
  console.log(`오류 ${errors.length} · 경고 ${warns.length}`);
  for (const i of issues) console.log(`  [${i.sev}] ${i.area}: ${i.msg}`);
  if (errors.length) process.exitCode = 1;
}
main();
