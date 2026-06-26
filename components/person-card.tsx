import Link from "next/link";
import type { Person } from "@/lib/data/types";

const ORG_TINT: Record<string, string> = {
  북장로회: "var(--sky-500)",
  북감리회: "var(--iris-500)",
};

function tintFor(person: Person) {
  for (const key of Object.keys(ORG_TINT)) {
    if (person.org.includes(key)) return ORG_TINT[key];
  }
  return "var(--aqua-500)";
}

export function PersonCard({ person }: { person: Person }) {
  const tint = tintFor(person);
  return (
    <Link
      href={`/people/${person.id}`}
      className="group flex flex-col rounded-3xl border border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-[3px]"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start gap-3">
        <span
          className="font-display flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-2xl text-white"
          style={{ background: tint }}
        >
          {person.glyph}
        </span>
        <div className="min-w-0">
          <div className="font-display truncate text-[17px] font-extrabold text-ink-900">
            {person.name}
          </div>
          <div className="truncate text-[12px] font-semibold text-ink-500">
            {person.en} · {person.life}
          </div>
        </div>
        <span className="ml-auto flex-none rounded-full bg-ink-50 px-2.5 py-1 text-[12px] font-bold text-ink-600">
          {person.year}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
          style={{ background: tint }}
        >
          {person.org}
        </span>
        <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">
          {person.role}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-600">
        {person.summary}
      </p>
    </Link>
  );
}
