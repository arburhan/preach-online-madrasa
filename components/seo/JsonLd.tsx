import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, seoUrl } from '@/lib/seo';

// ─── Helper to render JSON-LD script tag ───
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// ─── Organization (for root layout) ───
export function OrganizationJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: seoUrl('/icon-512.png'),
        description: SITE_DESCRIPTION,
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'www.ioa.bd@gmail.com',
            contactType: 'customer service',
            availableLanguage: ['Bengali', 'English'],
        },
    };
    return <JsonLdScript data={data} />;
}

// ─── Course (for course detail pages) ───
export function CourseJsonLd({
    name,
    description,
    url,
    image,
    provider,
    isFree,
    price,
}: {
    name: string;
    description: string;
    url: string;
    image?: string;
    provider?: string;
    isFree: boolean;
    price?: number;
}) {
    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        url,
        provider: {
            '@type': 'Organization',
            name: provider || SITE_NAME,
            sameAs: SITE_URL,
        },
        inLanguage: 'bn',
        isAccessibleForFree: isFree,
    };

    if (image) {
        data.image = image;
    }

    if (!isFree && price) {
        data.offers = {
            '@type': 'Offer',
            price: price,
            priceCurrency: 'BDT',
            availability: 'https://schema.org/InStock',
        };
    }

    return <JsonLdScript data={data} />;
}

// ─── Article (for blog posts) ───
export function ArticleJsonLd({
    title,
    description,
    url,
    image,
    authorName,
    publishedAt,
    updatedAt,
}: {
    title: string;
    description: string;
    url: string;
    image?: string;
    authorName: string;
    publishedAt: string;
    updatedAt?: string;
}) {
    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        url,
        inLanguage: 'bn',
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: seoUrl('/icon-512.png'),
            },
        },
        datePublished: publishedAt,
        dateModified: updatedAt || publishedAt,
    };

    if (image) {
        data.image = image;
    }

    return <JsonLdScript data={data} />;
}

// ─── FAQ Page (for /faq) ───
export function FAQPageJsonLd({
    questions,
}: {
    questions: { question: string; answer: string }[];
}) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
            },
        })),
    };
    return <JsonLdScript data={data} />;
}

// ─── Breadcrumb ───
export function BreadcrumbJsonLd({
    items,
}: {
    items: { name: string; url: string }[];
}) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
    return <JsonLdScript data={data} />;
}
