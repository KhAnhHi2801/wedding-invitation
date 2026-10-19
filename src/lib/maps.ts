/** Link và iframe bản đồ đều dựng từ `event.mapsQuery`, để không bao giờ lệch nhau. */

export const mapsLink = (query: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const mapsEmbed = (query: string): string =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
