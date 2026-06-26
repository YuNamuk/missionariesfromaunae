import { fetchOverlay } from "@/lib/db/content";
(async () => {
  const o = await fetchOverlay();
  console.log("overlay yearMin:", o?.yearMin, "yearMax:", o?.yearMax);
})();
