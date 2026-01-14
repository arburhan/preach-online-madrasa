import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, GraduationCap } from 'lucide-react';

export default async function TeachersPage() {
    await connectDB();

    // Fetch all approved teachers (support both old and new data)
    const teachers = await User.find({
        role: 'teacher',
        $or: [
            { approvalStatus: 'approved' }, // New field
            { isTeacherApproved: true }     // Old field for backward compatibility
        ]
    })
        .select('name image teacherBio teacherQualifications')
        .lean();

    // Serialize teachers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedTeachers = teachers.map((teacher: any) => ({
        _id: teacher._id.toString(),
        name: teacher.name,
        image: teacher.image,
        teacherBio: teacher.teacherBio,
        teacherQualifications: teacher.teacherQualifications,
    }));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <GraduationCap className="h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">আমাদের উস্তাযগণ</h1>
                        <p className="text-lg text-white/90 max-w-2xl mx-auto">
                            অভিজ্ঞ ও যোগ্য শিক্ষকদের দ্বারা পরিচালিত মানসম্মত শিক্ষা
                        </p>
                    </div>
                </div>
            </div>

            {/* Teachers Grid */}
            <div className="container mx-auto px-4 py-12">
                {serializedTeachers.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">কোনো উস্তায পাওয়া যায়নি</h3>
                        <p className="text-muted-foreground">শীঘ্রই উস্তাযদের তথ্য যোগ করা হবে</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <p className="text-muted-foreground">মোট {serializedTeachers.length} জন উস্তায</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {serializedTeachers.map((teacher) => (
                                <Link
                                    key={teacher._id}
                                    href={`/teachers/${teacher._id}`}
                                    className="group"
                                >
                                    <div className="bg-card border rounded-xl hover:shadow-lg hover:border-purple-500 transition-all text-center py-6 md:py-8 px-3 md:px-4 w-48 md:w-76">
                                        {/* Round Image */}
                                        <div className="relative w-24 h-24 mx-auto mb-4">
                                            {teacher.image ? (
                                                <Image
                                                    src={teacher.image}
                                                    alt={teacher.name}
                                                    fill
                                                    className="rounded-full object-cover ring-4 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-500 transition-all"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-500 transition-all">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <h3 className="font-semibold text-base mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">
                                            {teacher.name}
                                        </h3>

                                        {/* Qualifications */}
                                        {teacher.teacherQualifications && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {teacher.teacherQualifications}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
