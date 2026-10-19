import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { weddingConfig } from './src/config/wedding-config.ts'
import imageManifest from './src/generated/image-manifest.json' with { type: 'json' }

const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Thay các dấu %SITE_*% trong index.html bằng giá trị từ `wedding-config.ts`,
 * để title, mô tả, màu và thẻ chia sẻ chỉ có MỘT nguồn.
 * og:image/og:url chỉ xuất hiện khi `meta.siteUrl` đã điền (cần địa chỉ tuyệt đối).
 * Đường dẫn preload ảnh phong bì theo `base` của Vite nên deploy vào thư mục con vẫn đúng.
 */
function weddingHtmlMeta(): Plugin {
  let base = '/'
  const { title, description, siteUrl, ogImage, themeColor } = weddingConfig.meta
  const siteBase = siteUrl.replace(/\/$/, '')
  const shareTags = siteBase
    ? `<meta property="og:url" content="${escapeAttr(`${siteBase}/`)}" />\n    <meta property="og:image" content="${escapeAttr(`${siteBase}/${ogImage.replace(/^\//, '')}`)}" />`
    : ''
  const hero = (imageManifest as Record<string, { width: number; smallWidth: number }>)[weddingConfig.hero.photo]
  const heroKey = weddingConfig.hero.photo

  return {
    name: 'wedding-html-meta',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml(html) {
      // Ảnh trong phong bì là ảnh lớn đầu tiên: tải sớm để khỏi trễ lần vẽ đầu (khớp `sizes` của <Photo> trong envelope-intro)
      const heroPreload = hero
        ? `<link rel="preload" as="image" fetchpriority="high" imagesrcset="${base}${heroKey}-640.webp ${hero.smallWidth}w, ${base}${heroKey}.webp ${hero.width}w" imagesizes="(min-width: 640px) 30rem, 80vw" />`
        : ''
      const values: Record<string, string> = {
        '%SITE_TITLE%': escapeAttr(title),
        '%SITE_DESCRIPTION%': escapeAttr(description),
        '%SITE_THEME_COLOR%': escapeAttr(themeColor),
        '%SITE_SHARE_TAGS%': shareTags,
        '%SITE_PRELOAD%': heroPreload,
      }
      return Object.entries(values).reduce((out, [key, value]) => out.replaceAll(key, value), html)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), weddingHtmlMeta()],
})
