import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // libsql ships native bindings via prebuilt binaries; bundling them
  // through webpack breaks file:// SQLite. Keep them external on the
  // server in production so Node resolves them at runtime.
  serverExternalPackages: isProduction ? ["@libsql/client", "libsql"] : [],
};

export default nextConfig;
