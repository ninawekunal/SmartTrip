import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadServerTarget() {
  const raw = readFileSync(resolve(process.cwd(), "config/global.config.jsonc"), "utf8");
  const withoutBlockComments = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
  const parsed = JSON.parse(withoutLineComments) as { server: { host: string; port: number } };
  return `http://${parsed.server.host}:${parsed.server.port}`;
}

const serverTarget = loadServerTarget();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${serverTarget}/api/:path*`
      },
      {
        source: "/graphql",
        destination: `${serverTarget}/graphql`
      }
    ];
  }
};

export default nextConfig;
