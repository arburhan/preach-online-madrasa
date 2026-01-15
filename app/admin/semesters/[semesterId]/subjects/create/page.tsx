'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
    _id: string;
    name: string;
    email: string;
    image?: string;
    gender: 'male' | 'female';
}

export default function CreateSubjectPage() {
    const router = useRouter();
    const params = useParams();
    const semesterId = params.semesterId as string;

    const [formData, setFormData] = useState({
        type: 'islamic',
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        order: '0',
        liveClassLinkMale: '',
        liveClassLinkFemale: '',
    });

    const [maleTeachers, setMaleTeachers] = useState<Teacher[]>([]);
    const [femaleTeachers, setFemaleTeachers] = useState<Teacher[]>([]);
    const [selectedMaleTeachers, setSelectedMaleTeachers] = useState<string[]>([]);
    const [selectedFemaleTeachers, setSelectedFemaleTeachers] = useState<string[]>([]);
    const [maleSearch, setMaleSearch] = useState('');
    const [femaleSearch, setFemaleSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    // Load teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await fetch('/api/admin/teachers?status=approved');
                const data = await res.json();

                if (Array.isArray(data)) {
                    setMaleTeachers(data.filter((t: Teacher) => t.gender === 'male'));
                    setFemaleTeachers(data.filter((t: Teacher) => t.gender === 'female'));
                }
            } catch (error) {
                console.error('Failed to load teachers:', error);
            } finally {
                setLoadingTeachers(false);
            }
        };
        fetchTeachers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const toggleMaleTeacher = (teacherId: string) => {
        setSelectedMaleTeachers(prev =>
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const toggleFemaleTeacher = (teacherId: string) => {
        setSelectedFemaleTeachers(prev =>
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: semesterId,
                    type: formData.type,
                    titleBn: formData.titleBn,
                    titleEn: formData.titleEn,
                    descriptionBn: formData.descriptionBn,
                    descriptionEn: formData.descriptionEn,
                    order: parseInt(formData.order),
                    maleInstructors: selectedMaleTeachers,
                    femaleInstructors: selectedFemaleTeachers,
                    liveClassLinks: {
                        male: formData.liveClassLinkMale || undefined,
                        female: formData.liveClassLinkFemale || undefined,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'বিষয় তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('বিষয় সফলভাবে তৈরি হয়েছে!');
            router.push(`/admin/semesters/${semesterId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const filteredMaleTeachers = maleTeachers.filter(t =>
        t.name.toLowerCase().includes(maleSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(maleSearch.toLowerCase())
    );

    const filteredFemaleTeachers = femaleTeachers.filter(t =>
        t.name.toLowerCase().includes(femaleSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(femaleSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href={`/admin/semesters/${semesterId}`}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        সেমিস্টারে ফিরে যান
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন বিষয় যোগ করুন</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">বিষয়ের তথ্য</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">বিষয়ের ধরন *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                >
                                    <option value="islamic">ইসলামিক বিষয়</option>
                                    <option value="skill">স্কিল বিষয়</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">ক্রম</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">শিরোনাম (বাংলা) *</label>
                            <input
                                type="text"
                                name="titleBn"
                                value={formData.titleBn}
                                onChange={handleChange}
                                required
                                placeholder="যেমন: আকীদা বেসিক"
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">বিবরণ (বাংলা) *</label>
                            <textarea
                                name="descriptionBn"
                                value={formData.descriptionBn}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Male Instructors */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                            পুরুষ শিক্ষক নির্বাচন
                        </h2>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                                value={maleSearch}
                                onChange={(e) => setMaleSearch(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none"
                            />
                        </div>

                        {loadingTeachers ? (
                            <div className="text-center py-4">লোড হচ্ছে...</div>
                        ) : filteredMaleTeachers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">কোনো পুরুষ শিক্ষক পাওয়া যায়নি</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {filteredMaleTeachers.map(teacher => (
                                    <label
                                        key={teacher._id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedMaleTeachers.includes(teacher._id)
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMaleTeachers.includes(teacher._id)}
                                            onChange={() => toggleMaleTeacher(teacher._id)}
                                            className="rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{teacher.name}</p>
                                            <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            নির্বাচিত: {selectedMaleTeachers.length} জন
                        </p>
                    </div>

                    {/* Female Instructors */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-pink-500" />
                            মহিলা শিক্ষিকা নির্বাচন
                        </h2>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                                value={femaleSearch}
                                onChange={(e) => setFemaleSearch(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none"
                            />
                        </div>

                        {loadingTeachers ? (
                            <div className="text-center py-4">লোড হচ্ছে...</div>
                        ) : filteredFemaleTeachers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">কোনো মহিলা শিক্ষিকা পাওয়া যায়নি</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {filteredFemaleTeachers.map(teacher => (
                                    <label
                                        key={teacher._id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedFemaleTeachers.includes(teacher._id)
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFemaleTeachers.includes(teacher._id)}
                                            onChange={() => toggleFemaleTeacher(teacher._id)}
                                            className="rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{teacher.name}</p>
                                            <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            নির্বাচিত: {selectedFemaleTeachers.length} জন
                        </p>
                    </div>

                    {/* Live Class Links */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">লাইভ ক্লাস লিঙ্ক</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    ছেলে শিক্ষার্থীদের জন্য
                                </div>
                                <input
                                    type="url"
                                    name="liveClassLinkMale"
                                    value={formData.liveClassLinkMale}
                                    onChange={handleChange}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                                    মেয়ে শিক্ষার্থীদের জন্য
                                </div>
                                <input
                                    type="url"
                                    name="liveClassLinkFemale"
                                    value={formData.liveClassLinkFemale}
                                    onChange={handleChange}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    অপেক্ষা করুন...
                                </>
                            ) : (
                                'বিষয় তৈরি করুন'
                            )}
                        </Button>
                        <Link href={`/admin/semesters/${semesterId}`}>
                            <Button type="button" variant="outline">বাতিল</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
