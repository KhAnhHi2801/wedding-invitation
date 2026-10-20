/** Iframe bản đồ dựng từ `event.mapsQuery` (nguồn duy nhất của địa điểm). */
export const mapsEmbed = (query: string): string =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
