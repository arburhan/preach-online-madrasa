import { Metadata } from 'next';
import { seoUrl } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'ইসলামিক ব্লগ',
    description: 'ইসলামিক জ্ঞান, শিক্ষা, এবং জীবনযাত্রা সম্পর্কে আমাদের নতুন নতুন আর্টিকেল পড়ুন।',
    openGraph: {
        title: 'ইসলামিক ব্লগ - ইসলামিক অনলাইন একাডেমি',
        description: 'ইসলামিক জ্ঞান, শিক্ষা, এবং জীবনযাত্রা সম্পর্কে আমাদের নতুন নতুন আর্টিকেল পড়ুন।',
        url: seoUrl('/blogs'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/blogs'),
    },
};

export default function BlogsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
