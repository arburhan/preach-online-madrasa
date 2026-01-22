import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/LongCourse';
import '@/lib/db/models/Semester'; // Ensure Semester model is registered for populate
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    GraduationCap,
    Plus,
    Clock,
    Tag,
    Eye,
    Pencil
} from 'lucide-react';

export default async function AdminProgramsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs: any[] = await Program.find()
        .populate('semesters', 'number titleBn')
        .sort({ order: 1, createdAt: -1 })
        .lean();

    const publishedCount = programs.filter(p => p.status === 'published').length;
    const draftCount = programs.filter(p => p.status === 'draft').length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <GraduationCap className="h-8 w-8 text-primary" />
                                লং কোর্স / প্রোগ্রাম
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                সেমিস্টার ভিত্তিক দীর্ঘ মেয়াদি কোর্স ম্যানেজ করুন
                            </p>
                        </div>
                        <Link href="/admin/programs/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                নতুন প্রোগ্রাম তৈরি
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">মোট প্রোগ্রাম</p>
                                <p className="text-2xl font-bold">{programs.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Eye className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">প্রকাশিত</p>
                                <p className="text-2xl font-bold">{publishedCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Pencil className="h-8 w-8 text-amber-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">ড্রাফট</p>
                                <p className="text-2xl font-bold">{draftCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Programs List */}
                {programs.length === 0 ? (
                    <div className="bg-card rounded-xl border p-12 text-center">
                        <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">কোনো প্রোগ্রাম নেই</h3>
                        <p className="text-muted-foreground mb-6">
                            প্রথম সেমিস্টার ভিত্তিক লং কোর্স তৈরি করুন
                        </p>
                        <Link href="/admin/programs/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                প্রোগ্রাম তৈরি করুন
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <div
                                key={program._id.toString()}
                                className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Thumbnail */}
                                <div className="h-40 bg-linear-to-br from-purple-500 to-indigo-600 relative">
                                    {program.thumbnail ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={program.thumbnail}
                                            alt={program.titleBn}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <GraduationCap className="h-16 w-16 text-white/50" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${program.status === 'published'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        {program.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                                    </span>

                                    {program.isFeatured && (
                                        <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                                            ফিচার্ড
                                        </span>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{program.titleBn}</h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {program.descriptionBn}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {program.durationMonths} মাস
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="h-4 w-4" />
                                            {program.totalSemesters} সেমিস্টার
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag className="h-4 w-4 text-primary" />
                                        {program.isFree ? (
                                            <span className="text-green-600 font-bold">বিনামূল্যে</span>
                                        ) : (
                                            <span className="font-bold">
                                                {program.discountPrice ? (
                                                    <>
                                                        <span className="line-through text-muted-foreground mr-2">
                                                            ৳{program.price}
                                                        </span>
                                                        ৳{program.discountPrice}
                                                    </>
                                                ) : (
                                                    <>৳{program.price}</>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link href={`/admin/programs/${program._id}`} className="flex-1">
                                            <Button className="w-full" size="sm">
                                                বিস্তারিত
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/programs/${program._id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
