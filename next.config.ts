import type { NextConfig } from 'next'

/**
 * BUILD_TARGET=export собирает статическую копию сайта для показа вёрстки
 * без сервера. Боевая сборка идёт в standalone: так на Beget поднимается
 * один node-процесс без node_modules на хостинге. На Vercel (тестовый стенд)
 * output не задаём — платформа собирает своим таргетом, standalone ей мешает.
 */
const isStaticPreview = process.env.BUILD_TARGET === 'export'
const isVercel = Boolean(process.env.VERCEL)

const nextConfig: NextConfig = {
  output: isStaticPreview ? 'export' : isVercel ? undefined : 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // В статическом экспорте оптимизатор изображений недоступен:
    // отдаём заранее сжатые webp как есть.
    unoptimized: isStaticPreview,
  },
}

export default nextConfig
