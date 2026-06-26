import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Source archive files (_ds, .dc.html, support.js) live in the repo root as
  // reference assets; keep them out of the build by scoping the app dirs only.
  outputFileTracingExcludes: {
    "*": ["./_ds/**", "./site/**", "./uploads/**"],
  },
};

export default nextConfig;
