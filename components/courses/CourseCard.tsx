'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, Clock } from 'lucide-react';
import EnrollButton from './EnrollButton';

interface CourseCardProps {
    course: {
        _id: string;
        titleBn: string;
        descriptionBn: string;
        thumbnailUrl?: string;
        price: number;
        isFree: boolean;
        totalLessons: number;
        studentsEnrolled: number;
        totalDuration?: number;
        instructorNames: string;
    };
    isEnrolled?: boolean;
    isLoggedIn: boolean;
}

export default function CourseCard({ course, isEnrolled = false, isLoggedIn }: CourseCardProps) {
    return (
        <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail */}
            <Link href={`/courses/${course._id}`}>
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                    {course.thumbnailUrl ? (
                        <Image
                            src={course.thumbnailUrl}
                            alt={course.titleBn}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-16 w-16 text-gray-400" />
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-6">
                <Link href={`/courses/${course._id}`}>
                    <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {course.titleBn}
                    </h3>
                </Link>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.descriptionBn}
                </p>

                {/* Meta Info - with proper spacing and Bengali labels */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalLessons || 0} পাঠ</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.studentsEnrolled || 0} জন</span>
                    </div>
                    {course.totalDuration && course.totalDuration > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.floor(course.totalDuration / 60)} মিনিট</span>
                        </div>
                    )}
                </div>

                {/* Instructor */}
                <p className="text-sm text-muted-foreground mb-4">
                    উস্তায: {course.instructorNames}
                </p>

                {/* Price & Enroll - Vertical Layout */}
                <div className="space-y-3">
                    <div>
                        {course.isFree ? (
                            <span className="font-bold text-green-600">
                                বিনামূল্যে
                            </span>
                        ) : (
                            <span className="text-lg font-bold text-purple-600">
                                ৳{course.price}
                            </span>
                        )}
                    </div>

                    <EnrollButton
                        courseId={course._id}
                        isEnrolled={isEnrolled}
                        isLoggedIn={isLoggedIn}
                        isFree={course.isFree}
                        price={course.price}
                    />
                </div>
            </div>
        </div>
    );
}
