'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, Eye, ArrowRight, Tag, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail?: string;
    category: { _id: string; nameBn: string; nameEn: string } | null;
    author: { name: string };
    viewCount: number;
    publishedAt: string;
}

interface Category {
    _id: string;
    nameBn: string;
    nameEn: string;
}

interface BlogsClientProps {
    initialPosts: BlogPost[];
    categories: Category[];
}

export default function BlogsClient({ initialPosts, categories }: BlogsClientProps) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchFilteredPosts = useCallback(async () => {
        if (!selectedCategory) {
            setPosts(initialPosts);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/blogs?limit=20&category=${selectedCategory}`);
            const data = await res.json();
            if (res.ok) setPosts(data.posts || []);
        } catch (error) {
            console.error('Failed to fetch filtered blogs:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, initialPosts]);

    useEffect(() => {
        fetchFilteredPosts();
    }, [fetchFilteredPosts]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">সকল পোষ্ট</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16 bg-card border rounded-xl">
                        <p className="text-muted-foreground">
                            কোনো ব্লগ পোষ্ট পাওয়া যায়নি
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((post) => (
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
                                            width={500}
                                            height={300}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-5">
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
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {post.viewCount}
                                            </span>
                                            <span className="text-primary font-medium group-hover:underline">
                                                পড়ুন <ArrowRight className="inline h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    {/* Categories */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            ক্যাটাগরি
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === ''
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-muted'
                                    }`}
                            >
                                সকল ক্যাটাগরি
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat.nameEn)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.nameEn
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    {cat.nameBn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subscribe CTA */}
                    <div className="bg-linear-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-5">
                        <h3 className="font-bold mb-2">নিয়মিত আপডেট পান</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            নতুন ব্লগ পোষ্টের আপডেট পেতে আমাদের সাথে যুক্ত থাকুন
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            যোগাযোগ করুন
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
    );
}
