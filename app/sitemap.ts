import type { MetadataRoute } from "next";
import { PEOPLE } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missionaries-khaki.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // "/map"은 "/"로 리다이렉트되는 별칭이라 사이트맵에서 제외(중복 방지).
  const routes = ["", "/people", "/network", "/dictionary", "/cemetery", "/history", "/timeline"];
  const staticPages: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${SITE_URL}${r}`,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
  const people: MetadataRoute.Sitemap = PEOPLE.map((p) => ({
    url: `${SITE_URL}/people/${p.id}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));
  return [...staticPages, ...people];
}
