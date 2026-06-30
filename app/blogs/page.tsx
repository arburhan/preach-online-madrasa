import Link from 'next/link';
import { Calendar, Eye } from 'lucide-react';
import Image from 'next/image';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';
import { Category } from '@/lib/db/models';
import '@/lib/db/models/Admin';
import BlogsClient from '@/components/blogs/BlogsClient';

export default async function BlogsPage() {
    await connectDB();

    // Parallel fetch: posts, featured posts, and categories
    const [postsData, featuredData, categoriesData] = await Promise.all([
        BlogPost.find({ status: 'published' })
            .populate('category', 'nameBn nameEn')
            .populate('author', 'name')
            .sort({ publishedAt: -1 })
            .limit(20)
            .lean(),
        BlogPost.find({ status: 'published', isFeatured: true })
            .populate('category', 'nameBn nameEn')
            .populate('author', 'name')
            .sort({ publishedAt: -1 })
            .limit(3)
            .lean(),
        Category.find({ isActive: true })
            .sort({ order: 1, nameBn: 1 })
            .lean(),
    ]);

    // Serialize data for client components
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializePost = (post: any) => ({
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        thumbnail: post.thumbnail || null,
        category: post.category ? {
            _id: post.category._id.toString(),
            nameBn: post.category.nameBn,
            nameEn: post.category.nameEn,
        } : null,
        author: post.author ? { name: post.author.name } : { name: '' },
        viewCount: post.viewCount || 0,
        publishedAt: post.publishedAt?.toISOString() || post.createdAt?.toISOString() || new Date().toISOString(),
    });

    const posts = postsData.map(serializePost);
    const featuredPosts = featuredData.map(serializePost);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = categoriesData.map((cat: any) => ({
        _id: cat._id.toString(),
        nameBn: cat.nameBn,
        nameEn: cat.nameEn,
    }));

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-5 md:py-12 bg-linear-to-br from-primary/10 via-purple-500/5 to-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                ইসলামিক ব্লগ
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            ইসলামিক জ্ঞান, শিক্ষা, এবং জীবনযাত্রা সম্পর্কে আমাদের নতুন নতুন আর্টিকেল পড়ুন
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {/* Featured Posts (Server-Rendered) */}
                {featuredPosts.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">ফিচারড পোষ্ট</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {featuredPosts.map((post) => (
                                <Link
                                    key={post._id}
                                    href={`/blogs/${post.slug}`}
                                    className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {post.thumbnail && (
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image
                                                src={post.thumbnail}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-white">
                                                    ফিচারড
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                {post.category?.nameBn}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(post.publishedAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {post.viewCount}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Posts + Sidebar (Client Component for category filtering) */}
                <BlogsClient initialPosts={posts} categories={categories} />
            </div>
        </div>
    );
}
