import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    // WebP only: AVIF encoding is too CPU/memory-heavy for the production host.
    formats: ["image/webp"],
    qualities: [75, 100],
  },
  serverExternalPackages: [],
  experimental: {},
  redirects() {
    return ["food", "analytics", "vault"].map(page => ({
      source: `/${page}`,
      destination: `/workspace/${page}`,
      permanent: true,
    }));
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
  rewrites() {
    return [
      {
        source: "/_next/webpack-hmr",
        destination: "/_next/webpack-hmr",
      },
    ];
  },
  webpack(config, { isServer }) {
    config.resolve.alias["@"] = join(__dirname, "src");

    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};
