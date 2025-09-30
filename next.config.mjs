/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido output: 'export' para permitir API routes y dynamic rendering
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Habilitar optimización de imágenes desde WordPress
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite cualquier dominio (ajustar según tu WordPress)
      },
    ],
  },
  experimental: {
    viewTransition: true,
  },
}

export default nextConfig
