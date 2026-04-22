import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import { UserCircle, Mail, Phone, MapPin, Calendar, VenusAndMars, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function StudentProfilePage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    await connectDB();

    const user = await Student.findById(session.user.id).lean();

    if (!user) {
        redirect('/auth/signin');
    }

    // Fetch enrolled courses with WhatsApp links to show on profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledCourseIds = (user.enrolledCourses || []).map((e: any) => {
        if (e?.toString && typeof e.toString === 'function' && !e.course) return e;
        return e.course;
    }).filter(Boolean);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledCourses: any[] = enrolledCourseIds.length > 0
        ? await Course.find({ _id: { $in: enrolledCourseIds } })
            .select('titleBn slug whatsappGroupLinkMale whatsappGroupLinkFemale')
            .lean()
        : [];

    const gender = user.gender;
    const coursesWithLinks = enrolledCourses.filter(c =>
        (gender === 'male' && c.whatsappGroupLinkMale) ||
        (gender === 'female' && c.whatsappGroupLinkFemale)
    );

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">প্রোফাইল</h1>
                        <p className="text-muted-foreground mt-1">আপনার ব্যক্তিগত তথ্য দেখুন এবং পরিবর্তন করুন</p>
                    </div>
                    <Link
                        href="/student/profile/edit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        প্রোফাইল এডিট করুন
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="bg-card border rounded-xl overflow-hidden">
                    {/* Header Section with Avatar */}
                    <div className="bg-linear-to-r from-purple-600 to-blue-600 p-8">
                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || ''}
                                        width={96}
                                        height={96}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                ) : (
                                    <UserCircle className="h-16 w-16 text-white" />
                                )}
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user.name || 'নাম যোগ করুন'}</h2>
                                <p className="text-white/80 mt-1">{user.email}</p>
                                <div className="mt-2 inline-flex px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                                    শিক্ষার্থী
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <UserCircle className="h-4 w-4" />
                                    নাম
                                </label>
                                <p className="text-lg font-medium">{user.name || 'যোগ করা হয়নি'}</p>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    ইমেইল (পরিবর্তনযোগ্য নয়)
                                </label>
                                <p className="text-lg font-medium">{user.email}</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    ফোন নম্বর
                                </label>
                                <p className="text-lg font-medium">{user.phone || 'যোগ করা হয়নি'}</p>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    ঠিকানা
                                </label>
                                <p className="text-lg font-medium">{user.address || 'যোগ করা হয়নি'}</p>
                            </div>

                            {/* Join Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    যোগদানের তারিখ
                                </label>
                                <p className="text-lg font-medium">
                                    {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <VenusAndMars className="h-4 w-4" />
                                    লিঙ্গ
                                </label>
                                <p className="text-lg font-medium">
                                    {user.gender === 'male' ? 'পুরুষ' : user.gender === 'female' ? 'মহিলা' : 'যোগ করা হয়নি'}
                                </p>
                            </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="space-y-2 pt-4 border-t">
                                <label className="text-sm font-medium text-muted-foreground">
                                    সম্পর্কে
                                </label>
                                <p className="text-base leading-relaxed">{user.bio}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-xl p-6">
                        <p className="text-sm text-muted-foreground mb-1">এনরোল করা কোর্স</p>
                        <p className="text-3xl font-bold">{user.enrolledCourses?.length || 0}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-6">
                        <p className="text-sm text-muted-foreground mb-1">সার্টিফিকেট</p>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="bg-card border rounded-xl p-6">
                        <p className="text-sm text-muted-foreground mb-1">মোট অগ্রগতি</p>
                        <p className="text-3xl font-bold">--</p>
                    </div>
                </div>

                {/* WhatsApp Groups Section */}
                {coursesWithLinks.length > 0 && (
                    <div className="bg-card border rounded-xl overflow-hidden">
                        <div className="p-6 border-b bg-green-50 dark:bg-green-950/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <MessageCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">আমার হোয়াটসঅ্যাপ গ্রুপসমূহ</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        এনরোল করা কোর্সের হোয়াটসঅ্যাপ গ্রুপে যোগ দিন
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            {coursesWithLinks.map((course) => {
                                const link = gender === 'female'
                                    ? course.whatsappGroupLinkFemale
                                    : course.whatsappGroupLinkMale;
                                return (
                                    <div
                                        key={course._id.toString()}
                                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border"
                                    >
                                        <div>
                                            <p className="font-semibold">{course.titleBn}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {gender === 'female' ? 'মেয়েদের গ্রুপ' : 'ছেলেদের গ্রুপ'}
                                            </p>
                                        </div>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shrink-0"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            গ্রুপে যোগ দিন
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* If gender not set, show notice */}
                {!gender && enrolledCourses.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-4">
                        <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-800 dark:text-amber-200">হোয়াটসঅ্যাপ গ্রুপ লিঙ্ক দেখতে চাইলে</p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                প্রোফাইলে আপনার লিঙ্গ (Gender) যোগ করুন, তারপর আপনার কোর্সের হোয়াটসঅ্যাপ গ্রুপের লিঙ্ক দেখা যাবে।
                            </p>
                            <Link
                                href="/student/profile/edit"
                                className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 underline underline-offset-2"
                            >
                                প্রোফাইল আপডেট করুন →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
