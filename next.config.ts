import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone — the self-contained server bundle the Dockerfile copies into the
  // runtime image. Without this, `.next/standalone` never exists and the Docker build fails.
  output: "standalone",
  images: {
    // Avatars and product photos are served straight from MinIO, whose host differs per
    // environment (localhost:9000 in dev, the compose service or a real bucket domain in
    // production) and is only known at deploy time. Rather than thread that host through as
    // another build ARG, skip the optimizer: this is an authenticated internal dashboard, so
    // the bandwidth win never justified a hard "hostname is not configured" crash on every
    // remote image.
    unoptimized: true,
  },
};

export default nextConfig;
