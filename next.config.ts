import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // libsql ships native bindings via prebuilt binaries; bundling them
  // through webpack breaks file:// SQLite. Keep them external on the
  // server so Node resolves them at runtime.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
