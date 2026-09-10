import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The receipt image reads its fonts from disk at request time. Vercel only
     ships files it can see being imported, so name the folder explicitly or
     the route would 500 in production while working locally. */
  outputFileTracingIncludes: {
    "/api/receipt/[saleId]": ["./assets/receipt-fonts/**"],
  },
};

export default nextConfig;
