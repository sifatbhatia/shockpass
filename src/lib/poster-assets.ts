export const POSTER_PRESETS = [
  '/assets/willcall-hero-drop-v2.webp',
  '/assets/scan-success-moment.webp',
  '/assets/empty-drops-gallery.webp',
  '/assets/empty-wallet-rope.webp',
] as const

const LEGACY_POSTER_MAP = [
  { needle: 'photo-1501386761578-eac5c94b800a', src: POSTER_PRESETS[0] },
  { needle: 'photo-1470225620780-dba8ba36b745', src: POSTER_PRESETS[1] },
  { needle: 'photo-1492684223066-81342ee5ff30', src: POSTER_PRESETS[2] },
] as const

export function normalizePosterUrl(src?: string | null) {
  if (!src) return src
  return LEGACY_POSTER_MAP.find((item) => src.includes(item.needle))?.src ?? src
}
