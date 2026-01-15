import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    GraduationCap,
    BookOpen,
    Plus,
    Settings,
    ChevronRight
} from 'lucide-react';

// Level colors and labels
const levelConfig = {
    basic: { color: 'bg-green-500', label: 'Basic', labelBn: 'বেসিক' },
    expert: { color: 'bg-blue-500', label: 'Expert', labelBn: 'এক্সপার্ট' },
    masters: { color: 'bg-purple-500', label: 'Masters', labelBn: 'মাস্টার্স' },
    alim: { color: 'bg-red-500', label: 'Alim', labelBn: 'আলিম' },
};

export default async function AdminSemestersPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const semesters: any[] = await Semester.find()
        .populate('subjects')
        .sort({ number: 1 })
        .lean();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                                ← অ্যাডমিন ড্যাশবোর্ড
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            সেমিস্টার ম্যানেজমেন্ট
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            ২ বছর মেয়াদি শিক্ষা কার্যক্রম - ৮ সেমিস্টার পরিচালনা করুন
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Level Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(levelConfig).map(([level, config]) => {
                        const levelSemesters = semesters.filter(s => s.level === level);
                        const totalSubjects = levelSemesters.reduce((acc, s) => acc + (s.subjects?.length || 0), 0);

                        return (
                            <div key={level} className="bg-card rounded-xl border p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                                    <h3 className="font-semibold">{config.labelBn}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">সেমিস্টার</p>
                                        <p className="font-bold text-lg">{levelSemesters.length}/2</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">বিষয়</p>
                                        <p className="font-bold text-lg">{totalSubjects}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Semester Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                        const semester = semesters.find(s => s.number === num);
                        const level = num <= 2 ? 'basic' : num <= 4 ? 'expert' : num <= 6 ? 'masters' : 'alim';
                        const config = levelConfig[level];

                        return (
                            <div
                                key={num}
                                className={`bg-card rounded-xl border overflow-hidden ${semester ? 'hover:shadow-lg transition-shadow' : 'opacity-60'
                                    }`}
                            >
                                {/* Level Header */}
                                <div className={`${config.color} text-white px-4 py-2 text-sm font-medium`}>
                                    {config.labelBn} - {Math.ceil(num / 2) > 1 ? (num % 2 === 0 ? '২' : '১') : (num % 2 === 0 ? '২' : '১')}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">
                                        {semester?.titleBn || `${num}ম সেমিস্টার`}
                                    </h3>

                                    {semester ? (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {semester.descriptionBn}
                                            </p>

                                            <div className="flex items-center justify-between text-sm mb-4">
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>{semester.subjects?.length || 0} বিষয়</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs ${semester.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {semester.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                </span>
                                            </div>

                                            <Link href={`/admin/semesters/${semester._id}`}>
                                                <Button className="w-full" size="sm">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    পরিচালনা করুন
                                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                এই সেমিস্টার এখনো তৈরি করা হয়নি
                                            </p>
                                            <Link href={`/admin/semesters/create?number=${num}&level=${level}`}>
                                                <Button className="w-full" size="sm" variant="outline">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    সেমিস্টার তৈরি করুন
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/semesters/create" className="block">
                        <div className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Plus className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">নতুন সেমিস্টার তৈরি</h3>
                                    <p className="text-sm text-muted-foreground">সেমিস্টার কনফিগার করুন</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
