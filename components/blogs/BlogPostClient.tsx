'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, ArrowLeft, Tag, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const LexicalRenderer = dynamic(() => import('@/components/editor/LexicalRenderer'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />,
});

interface BlogPostData {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail?: string;
    category: { _id: string; nameBn: string; nameEn: string } | null;
    author: { name: string } | null;
    viewCount: number;
    publishedAt: string;
}

interface RelatedPost {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    publishedAt: string;
}

export default function BlogPostClient({
    post,
    relatedPosts,
}: {
    post: BlogPostData;
    relatedPosts: RelatedPost[];
}) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url,
                });
            } catch {
                // User cancelled or share failed
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('লিংক কপি হয়েছে!');
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            {/* Hero Section with Thumbnail */}
            {post.thumbnail && (
                <section className="relative h-[30vh] min-h-[300px]">
                    <Image
                        src={post.thumbnail}
                        width={1000}
                        height={1000}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                </section>
            )}

            <div className="container mx-auto px-4">
                {/* Back Button */}
                <div className="py-6">
                    <Link href="/blogs">
                        <Button variant="ghost" className="group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            ব্লগে ফিরে যান
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-16">
                    {/* Main Content */}
                    <article className="lg:col-span-3">
                        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
                            {/* Category & Meta */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {post.category && (
                                    <Link href={`/blogs?category=${post.category.nameEn}`}>
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                                            <Tag className="h-3 w-3" />
                                            {post.category.nameBn}
                                        </span>
                                    </Link>
                                )}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(post.publishedAt)}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    {post.viewCount} জন পড়েছেন
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            <p className="text-lg text-muted-foreground mb-8 border-l-4 border-primary pl-4 italic">
                                {post.excerpt}
                            </p>

                            {/* Author & Share */}
                            <div className="flex items-center justify-between border-y py-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{post.author?.name || 'অজানা'}</p>
                                        <p className="text-xs text-muted-foreground">লেখক</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleShare}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    শেয়ার করুন
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                                <LexicalRenderer content={post.content} />
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="bg-card border rounded-xl p-5">
                                    <h3 className="font-bold mb-4">সম্পর্কিত পোষ্ট</h3>
                                    <div className="space-y-4">
                                        {relatedPosts.map((p) => (
                                            <Link
                                                key={p._id}
                                                href={`/blogs/${p.slug}`}
                                                className="block group"
                                            >
                                                <div className="flex gap-3">
                                                    {p.thumbnail && (
                                                        <Image
                                                            src={p.thumbnail}
                                                            width={1000}
                                                            height={1000}
                                                            alt={p.title}
                                                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                            {p.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {formatDate(p.publishedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share */}
                            <div className="bg-linear-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-5">
                                <h3 className="font-bold mb-2">পছন্দ হলে শেয়ার করুন</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    এই পোষ্টটি আপনার বন্ধুদের সাথে শেয়ার করুন
                                </p>
                                <Button
                                    onClick={handleShare}
                                    className="w-full"
                                >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    শেয়ার করুন
                                </Button>
                            </div>

                            {/* Back to Blogs */}
                            <Link href="/blogs" className="block">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    আরো পোষ্ট দেখুন
                                </Button>
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
