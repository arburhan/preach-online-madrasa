import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';
import '@/lib/db/models/Category';
import '@/lib/db/models/Admin';
import { seoUrl, SITE_NAME } from '@/lib/seo';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import BlogPostClient from '@/components/blogs/BlogPostClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ─── Dynamic Metadata for SEO ───
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    await connectDB();

    const post = await BlogPost.findOne({ slug, status: 'published' })
        .select('title excerpt thumbnail slug publishedAt')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .lean() as any;

    if (!post) {
        return { title: 'পোষ্ট পাওয়া যায়নি' };
    }

    const description = post.excerpt?.substring(0, 160) || '';
    const publishedTime = post.publishedAt instanceof Date
        ? post.publishedAt.toISOString()
        : typeof post.publishedAt === 'string' ? post.publishedAt : undefined;

    return {
        title: post.title,
        description,
        openGraph: {
            title: `${post.title} | ${SITE_NAME}`,
            description,
            url: seoUrl(`/blogs/${post.slug}`),
            type: 'article',
            publishedTime,
            ...(post.thumbnail ? { images: [{ url: post.thumbnail, width: 1200, height: 630, alt: post.title }] } : {}),
        },
        alternates: {
            canonical: seoUrl(`/blogs/${post.slug}`),
        },
    };
}

// ─── Server Component: Fetch data from DB ───
export default async function BlogPostPage({ params }: PageProps) {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    await connectDB();

    // Fetch the post
    const post = await BlogPost.findOne({ slug, status: 'published' })
        .populate('category', 'nameBn nameEn')
        .populate('author', 'name')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .lean() as any;

    if (!post) {
        notFound();
    }

    // Increment view count (fire and forget)
    BlogPost.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } }).exec();

    // Fetch related posts from same category
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedPosts: any[] = [];
    if (post.category?._id) {
        const related = await BlogPost.find({
            status: 'published',
            category: post.category._id,
            _id: { $ne: post._id },
        })
            .select('title slug thumbnail publishedAt')
            .sort({ publishedAt: -1 })
            .limit(3)
            .lean();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        relatedPosts = related.map((p: any) => ({
            _id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            thumbnail: p.thumbnail || undefined,
            publishedAt: p.publishedAt?.toISOString() || new Date().toISOString(),
        }));
    }

    // Serialize the post data for the client component
    const serializedPost = {
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        thumbnail: post.thumbnail || undefined,
        category: post.category ? {
            _id: post.category._id.toString(),
            nameBn: post.category.nameBn,
            nameEn: post.category.nameEn,
        } : null,
        author: post.author ? { name: post.author.name } : null,
        viewCount: post.viewCount || 0,
        publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    };

    return (
        <>
            <ArticleJsonLd
                title={serializedPost.title}
                description={serializedPost.excerpt}
                url={seoUrl(`/blogs/${slug}`)}
                image={serializedPost.thumbnail}
                authorName={serializedPost.author?.name || 'ইসলামিক অনলাইন একাডেমি'}
                publishedAt={serializedPost.publishedAt}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'হোম', url: seoUrl('/') },
                    { name: 'ব্লগ', url: seoUrl('/blogs') },
                    { name: serializedPost.title, url: seoUrl(`/blogs/${slug}`) },
                ]}
            />
            <BlogPostClient post={serializedPost} relatedPosts={relatedPosts} />
        </>
    );
}
