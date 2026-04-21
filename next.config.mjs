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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ttf$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
