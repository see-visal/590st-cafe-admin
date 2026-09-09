import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone — the self-contained server bundle the Dockerfile copies into the
  // runtime image. Without this, `.next/standalone` never exists and the Docker build fails.
  output: "standalone",
};

export default nextConfig;
