'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Lock, Unlock, Plus, Pencil, Trash2, X, Check, FolderOpen } from 'lucide-react';

interface Category {
    _id: string;
    nameBn: string;
    nameEn: string;
    description?: string;
    order: number;
    isActive: boolean;
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isAdminRegistrationOpen, setIsAdminRegistrationOpen] = useState(false);

    // Category states
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState({ nameBn: '', nameEn: '', description: '' });
    const [addingCategory, setAddingCategory] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ nameBn: '', nameEn: '', description: '' });
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (res.ok) {
                setIsAdminRegistrationOpen(data.isAdminRegistrationOpen);
            }
        } catch (error) {
            console.error(error);
            toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (res.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoadingCategories(false);
        }
    };

    const toggleRegistration = async () => {
        setUpdating(true);
        try {
            const newValue = !isAdminRegistrationOpen;
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdminRegistrationOpen: newValue }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIsAdminRegistrationOpen(data.isAdminRegistrationOpen);
            toast.success(newValue ? 'অ্যাডমিন নিবন্ধন চালু করা হয়েছে' : 'অ্যাডমিন নিবন্ধন বন্ধ করা হয়েছে');
        } catch {
            toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.nameBn.trim() || !newCategory.nameEn.trim()) {
            toast.error('বাংলা ও ইংরেজি নাম আবশ্যক');
            return;
        }

        setAddingCategory(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCategories([...categories, data.category]);
            setNewCategory({ nameBn: '', nameEn: '', description: '' });
            setShowAddCategory(false);
            toast.success('ক্যাটাগরি সফলভাবে তৈরি হয়েছে');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setAddingCategory(false);
        }
    };

    const startEdit = (category: Category) => {
        setEditingId(category._id);
        setEditData({
            nameBn: category.nameBn,
            nameEn: category.nameEn,
            description: category.description || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ nameBn: '', nameEn: '', description: '' });
    };

    const handleSaveEdit = async (id: string) => {
        if (!editData.nameBn.trim() || !editData.nameEn.trim()) {
            toast.error('বাংলা ও ইংরেজি নাম আবশ্যক');
            return;
        }

        setSavingEdit(true);
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCategories(categories.map(c => c._id === id ? data.category : c));
            setEditingId(null);
            toast.success('ক্যাটাগরি সফলভাবে আপডেট হয়েছে');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('আপনি কি নিশ্চিত এই ক্যাটাগরি মুছে ফেলতে চান?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCategories(categories.filter(c => c._id !== id));
            toast.success('ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'ক্যাটাগরি মুছতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="px-4 py-6 space-y-8">
            <h1 className="text-2xl font-bold">সেটিংস</h1>

            {/* Admin Registration Section */}
            <div className="bg-card border rounded-lg p-6 max-w-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">অ্যাডমিন অ্যাক্সেস কন্ট্রোল</h2>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                        <p className="font-medium text-foreground">অ্যাডমিন নিবন্ধন পেজ</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            বর্তমানে নিবন্ধন {isAdminRegistrationOpen ? <span className="text-green-600 font-medium">চালু</span> : <span className="text-red-600 font-medium">বন্ধ</span>} আছে
                        </p>
                        {isAdminRegistrationOpen && (
                            <p className="text-xs text-muted-foreground mt-1">
                                লিংক: <a href="/admin-register" className="underline hover:text-primary">/admin-register</a>
                            </p>
                        )}
                    </div>

                    <Button
                        variant={isAdminRegistrationOpen ? "destructive" : "default"}
                        onClick={toggleRegistration}
                        disabled={updating}
                        className="w-36 transition-all"
                    >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            isAdminRegistrationOpen ? (
                                <><Lock className="h-4 w-4 mr-2" /> বন্ধ করুন</>
                            ) : (
                                <><Unlock className="h-4 w-4 mr-2" /> চালু করুন</>
                            )
                        )}
                    </Button>
                </div>
            </div>

            {/* Blog Categories Section */}
            <div className="bg-card border rounded-lg p-6 max-w-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">ব্লগ ক্যাটাগরি</h2>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        variant={showAddCategory ? "outline" : "default"}
                    >
                        {showAddCategory ? (
                            <><X className="h-4 w-4 mr-1" /> বাতিল</>
                        ) : (
                            <><Plus className="h-4 w-4 mr-1" /> নতুন ক্যাটাগরি</>
                        )}
                    </Button>
                </div>

                {/* Add Category Form */}
                {showAddCategory && (
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">বাংলা নাম *</label>
                                <Input
                                    placeholder="যেমন: তাফসীর"
                                    value={newCategory.nameBn}
                                    onChange={(e) => setNewCategory({ ...newCategory, nameBn: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">ইংরেজি নাম (Slug) *</label>
                                <Input
                                    placeholder="e.g., tafsir"
                                    value={newCategory.nameEn}
                                    onChange={(e) => setNewCategory({ ...newCategory, nameEn: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">বিবরণ (ঐচ্ছিক)</label>
                            <Input
                                placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAddCategory} disabled={addingCategory} className="w-full">
                            {addingCategory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            ক্যাটাগরি যোগ করুন
                        </Button>
                    </div>
                )}

                {/* Categories List */}
                {loadingCategories ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>কোনো ক্যাটাগরি নেই</p>
                        <p className="text-sm">উপরের বাটনে ক্লিক করে নতুন ক্যাটাগরি যোগ করুন</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                            >
                                {editingId === category._id ? (
                                    <div className="flex-1 flex flex-col gap-2 mr-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="বাংলা নাম"
                                                value={editData.nameBn}
                                                onChange={(e) => setEditData({ ...editData, nameBn: e.target.value })}
                                            />
                                            <Input
                                                placeholder="ইংরেজি নাম"
                                                value={editData.nameEn}
                                                onChange={(e) => setEditData({ ...editData, nameEn: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            />
                                        </div>
                                        <Input
                                            placeholder="বিবরণ"
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium">{category.nameBn}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Slug: {category.nameEn}
                                            {category.description && ` • ${category.description}`}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    {editingId === category._id ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleSaveEdit(category._id)}
                                                disabled={savingEdit}
                                            >
                                                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={cancelEdit}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => startEdit(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(category._id)}
                                                disabled={deletingId === category._id}
                                            >
                                                {deletingId === category._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
