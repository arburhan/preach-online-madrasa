'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail?: string;
    category: { _id: string; nameBn: string; nameEn: string };
    author: { name: string };
    status: 'draft' | 'published' | 'archived';
    viewCount: number;
    createdAt: string;
    publishedAt?: string;
}

interface Category {
    _id: string;
    nameBn: string;
    nameEn: string;
}

export default function AdminBlogsPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, [filterStatus, filterCategory]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            let url = '/api/admin/blogs?limit=100';
            if (filterStatus) url += `&status=${filterStatus}`;
            if (filterCategory) url += `&category=${filterCategory}`;

            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('ব্লগ পোষ্ট লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('আপনি কি নিশ্চিত এই পোষ্ট মুছে ফেলতে চান?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/blogs/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            setPosts(posts.filter(p => p._id !== id));
            toast.success('পোষ্ট সফলভাবে মুছে ফেলা হয়েছে');
        } catch {
            toast.error('পোষ্ট মুছতে সমস্যা হয়েছে');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">প্রকাশিত</span>;
            case 'draft':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">ড্রাফট</span>;
            case 'archived':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">আর্কাইভ</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">ব্লগ পোষ্টসমূহ</h1>
                    <p className="text-muted-foreground mt-1">
                        মোট {posts.length}টি পোষ্ট
                    </p>
                </div>
                <Link href="/admin/blogs/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        নতুন পোষ্ট
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-card border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="শিরোনাম দিয়ে খুঁজুন..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    >
                        <option value="">সকল স্ট্যাটাস</option>
                        <option value="published">প্রকাশিত</option>
                        <option value="draft">ড্রাফট</option>
                        <option value="archived">আর্কাইভ</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    >
                        <option value="">সকল ক্যাটাগরি</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.nameBn}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-card border rounded-lg">
                    <p className="text-muted-foreground mb-4">কোনো ব্লগ পোষ্ট পাওয়া যায়নি</p>
                    <Link href="/admin/blogs/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            প্রথম পোষ্ট তৈরি করুন
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium">শিরোনাম</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium">ক্যাটাগরি</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium">স্ট্যাটাস</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium">ভিউ</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium">তারিখ</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPosts.map((post) => (
                                    <tr key={post._id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {post.thumbnail && (
                                                    <Image
                                                        src={post.thumbnail}
                                                        width={100}
                                                        height={100}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium line-clamp-1">{post.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {post.excerpt}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm">{post.category?.nameBn || '-'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(post.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm">{post.viewCount}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/blogs/${post.slug}`} target="_blank">
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/blogs/${post._id}/edit`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(post._id)}
                                                    disabled={deletingId === post._id}
                                                >
                                                    {deletingId === post._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
