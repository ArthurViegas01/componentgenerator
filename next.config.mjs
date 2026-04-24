/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Next 16 usa Turbopack por padrão em `next dev`. A config abaixo vazia
  // silencia o warning "using Turbopack with a webpack config" — na prática
  // os defaults do Turbopack já resolvem o que precisamos (Monaco + fonts).
  turbopack: {},
  // Ainda mantemos a config webpack para `next build` (produção continua no
  // webpack até você passar --turbopack no build também).
  webpack: (config, { isServer }) => {
    // Prettier/standalone é projetado para rodar no browser, mas o webpack
    // pode tentar resolver módulos Node.js (fs, path, os) que ele referencia
    // indiretamente. Estas entradas dizem ao webpack para ignorá-los no
    // bundle do client — o código de runtime nunca chega a importá-los.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    config.module.rules.push({
      test: /\.ttf$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
