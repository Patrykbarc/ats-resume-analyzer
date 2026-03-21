export const faqKeys = [
  'howItWorks',
  'isFree',
  'fileFormats',
  'howQuick'
] as const

export type FaqKey = (typeof faqKeys)[number]
