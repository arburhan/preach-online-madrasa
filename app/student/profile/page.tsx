import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { UserCircle, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function StudentProfilePage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    await connectDB();

    const user = await User.findById(session.user.id).lean();

    if (!user) {
        redirect('/auth/signin');
    }

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
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8">
                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || ''}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <UserCircle className="h-16 w-16 text-white" />
                                )}
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user.name || 'নাম যোগ করুন'}</h2>
                                <p className="text-white/80 mt-1">{user.email}</p>
                                <div className="mt-2 inline-flex px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm">
                                    {user.role === 'student' ? 'শিক্ষার্থী' : user.role === 'teacher' ? 'উস্তায' : 'অ্যাডমিন'}
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

                            {/* Email (Non-editable) */}
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
                        </div>

                        {/* Additional Info */}
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

                {/* Stats Cards - For Students */}
                {user.role === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card border rounded-xl p-6">
                            <p className="text-sm text-muted-foreground mb-1">Enrolled Courses</p>
                            <p className="text-3xl font-bold">{user.enrolledCourses?.length || 0}</p>
                        </div>
                        <div className="bg-card border rounded-xl p-6">
                            <p className="text-sm text-muted-foreground mb-1">Certificates</p>
                            <p className="text-3xl font-bold">0</p>
                        </div>
                        <div className="bg-card border rounded-xl p-6">
                            <p className="text-sm text-muted-foreground mb-1">Total Progress</p>
                            <p className="text-3xl font-bold">--</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
