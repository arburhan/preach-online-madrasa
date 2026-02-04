'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Calendar, Eye, ArrowRight, Tag } from 'lucide-react';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail?: string;
    category: { _id: string; nameBn: string; nameEn: string };
    author: { name: string };
    viewCount: number;
    publishedAt: string;
}

interface Category {
    _id: string;
    nameBn: string;
    nameEn: string;
}

export default function BlogsPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    const fetchData = async () => {
        try {
            let url = '/api/blogs?limit=20';
            if (selectedCategory) url += `&category=${selectedCategory}`;

            const [postsRes, featuredRes, catRes] = await Promise.all([
                fetch(url),
                fetch('/api/blogs?featured=true&limit=3'),
                fetch('/api/admin/categories')
            ]);

            const postsData = await postsRes.json();
            const featuredData = await featuredRes.json();
            const catData = await catRes.json();

            if (postsRes.ok) setPosts(postsData.posts || []);
            if (featuredRes.ok) setFeaturedPosts(featuredData.posts || []);
            if (catRes.ok && Array.isArray(catData)) setCategories(catData);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-16 md:py-24 bg-linear-to-br from-primary/10 via-purple-500/5 to-background">
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
                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">ফিচারড পোষ্ট</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredPosts.map((post) => (
                                <Link
                                    key={post._id}
                                    href={`/blogs/${post.slug}`}
                                    className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {post.thumbnail && (
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={post.thumbnail}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-white">
                                                    ফিচারড
                                                </span>
                                            </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">সকল পোষ্ট</h2>
                        </div>

                        {posts.length === 0 ? (
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
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
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
                                    href="/contacts"
                                    className="inline-block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    যোগাযোগ করুন
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
