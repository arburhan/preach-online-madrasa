// ============================================
// Centralized SEO Configuration
// ============================================

const rawUrl = process.env.NEXTAUTH_URL || 'https://ioa.bd';
export const SITE_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
export const SITE_NAME = 'ইসলামিক অনলাইন একাডেমি';
export const SITE_NAME_EN = 'Islamic Online Academy';
export const SITE_DESCRIPTION = 'বাংলাদেশের সম্পূর্ণ অনলাইন একাডেমি প্ল্যাটফর্ম। কুরআন, হাদিস এবং ইসলামিক শিক্ষা অনলাইনে শিখুন।';

/**
 * Build an absolute canonical URL from a relative path
 */
export function seoUrl(path: string = ''): string {
  const base = SITE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Default Open Graph image (fallback when no specific image is available)
 */
export const DEFAULT_OG_IMAGE = seoUrl('/og-image.png');

/**
 * Default metadata shared across all pages via layout.tsx template
 */
export const defaultOpenGraph = {
  type: 'website' as const,
  locale: 'bn_BD',
  siteName: SITE_NAME,
  images: [
    {
      url: DEFAULT_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: SITE_NAME,
    },
  ],
};

export const defaultTwitter = {
  card: 'summary_large_image' as const,
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  images: [DEFAULT_OG_IMAGE],
};
