import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { ObjectId } from 'mongoose';

interface Teacher {
    _id: string;
    name: string;
    image?: string;
    teacherQualifications?: string;
}

interface TeachersSectionProps {
    teachers: Teacher[];
}

export default function TeachersSection({ teachers }: TeachersSectionProps) {
    // Show only 6 teachers
    const displayTeachers = teachers.slice(0, 6);

    if (displayTeachers.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full mb-4">
                        <GraduationCap className="h-5 w-5" />
                        <span className="font-semibold">আমাদের উস্তাযগণ</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        অভিজ্ঞ শিক্ষকদের থেকে শিখুন
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        আলেম ও অভিজ্ঞ উস্তাযদের তত্ত্বাবধানে আরবি ও ইসলামিক শিক্ষা অর্জন করুন
                    </p>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    {displayTeachers.map((teacher) => (
                        <Link
                            key={teacher._id}
                            href={`/teachers/${teacher._id}`}
                            className="group"
                        >
                            <div className="bg-card border rounded-xl hover:shadow-lg hover:border-purple-500 transition-all text-center py-6 md:py-8 px-3 md:px-4 w-48 md:w-76">
                                {/* Round Image */}
                                <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-4">
                                    {teacher.image ? (
                                        <Image
                                            src={teacher.image}
                                            alt={teacher.name}
                                            fill
                                            className="rounded-full object-cover ring-4 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-500 transition-all"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold ring-4 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-500 transition-all">
                                            {teacher.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <h3 className="font-semibold text-sm md:text-lg lg:text-xl mb-1 group-hover:text-purple-600 transition-colors line-clamp-2 px-1">
                                    {teacher.name}
                                </h3>

                                {/* Qualifications */}
                                {teacher.teacherQualifications && (
                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 px-2">
                                        {teacher.teacherQualifications}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link
                        href="/teachers"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-medium rounded-lg transition-all duration-300"
                    >
                        সমস্ত উস্তাযদের দেখুন
                        <GraduationCap className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
