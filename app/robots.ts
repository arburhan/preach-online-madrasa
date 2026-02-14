import type { MetadataRoute } from 'next';
import { seoUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/admin-register/',
                    '/student/',
                    '/teacher/',
                    '/teacherRegister/',
                    '/api/',
                    '/auth/',
                ],
            },
        ],
        sitemap: seoUrl('/sitemap.xml'),
    };
}
