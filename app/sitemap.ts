import type { MetadataRoute } from 'next';
import { seoUrl } from '@/lib/seo';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Program from '@/lib/db/models/LongCourse';
import BlogPost from '@/lib/db/models/BlogPost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connectDB();

    // ─── Static pages ───
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: seoUrl('/'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: seoUrl('/courses'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: seoUrl('/blogs'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: seoUrl('/about'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: seoUrl('/contact'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: seoUrl('/faq'),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: seoUrl('/teachers'),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // ─── Dynamic: Published Courses ───
    const courses = await Course.find({ status: 'published' })
        .select('slug updatedAt')
        .lean();

    const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
        url: seoUrl(`/courses/${course.slug}`),
        lastModified: course.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // ─── Dynamic: Published Programs ───
    const programs = await Program.find({ status: 'published' })
        .select('slug updatedAt')
        .lean();

    const programPages: MetadataRoute.Sitemap = programs.map((program) => ({
        url: seoUrl(`/programs/${program.slug}`),
        lastModified: program.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // ─── Dynamic: Published Blog Posts ───
    const posts = await BlogPost.find({ status: 'published' })
        .select('slug updatedAt')
        .lean();

    const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
        url: seoUrl(`/blogs/${post.slug}`),
        lastModified: post.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...coursePages, ...programPages, ...blogPages];
}
