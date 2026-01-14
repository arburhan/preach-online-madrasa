'use client';

import Link from 'next/link';
import { Lock, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface PlaylistLesson {
    _id: string;
    titleBn: string;
    duration?: number;
    order: number;
    isFree?: boolean;
}

interface LessonPlaylistProps {
    courseId: string;
    currentLessonId: string;
    lessons: PlaylistLesson[];
    currentIndex: number;
    isEnrolled: boolean;
}

export function LessonPlaylist({ courseId, currentLessonId, lessons, currentIndex, isEnrolled }: LessonPlaylistProps) {
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

    // Fetch completed lessons progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await fetch(`/api/progress/course?courseId=${courseId}`);
                if (response.ok) {
                    const data = await response.json();
                    const completed = new Set<string>(
                        data.progress
                            ?.filter((p: { isCompleted: boolean }) => p.isCompleted)
                            .map((p: { lesson: { toString: () => string } }) => p.lesson.toString()) || []
                    );
                    setCompletedLessons(completed);
                }
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            }
        };

        if (isEnrolled) {
            fetchProgress();
        }
    }, [courseId, isEnrolled]);

    return (
        <div className="bg-card rounded-xl border overflow-hidden sticky top-6">
            <div className="p-4 border-b">
                <h3 className="font-semibold">কোর্স সূচিপত্র</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {lessons.length} টি পাঠ
                </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                    const lessonId = lesson._id;
                    const isCurrent = lessonId === currentLessonId;
                    const isCompleted = completedLessons.has(lessonId);

                    // Strict sequential enforcement
                    // User can only access: 
                    // 1. Current lesson
                    // 2. Completed lessons
                    // 3. Next lesson after current (if enrolled)
                    // 4. Free lessons (if not enrolled)
                    const canAccess =
                        !isEnrolled ? lesson.isFree : // Not enrolled: only free lessons
                            isCompleted || // Completed lessons
                            isCurrent || // Current lesson
                            index === currentIndex + 1 || // Next lesson
                            index <= currentIndex; // Previous lessons

                    const isLocked = !canAccess;

                    return (
                        <Link
                            key={lessonId}
                            href={isLocked ? '#' : `/student/watch/${courseId}/${lessonId}`}
                            className={`block p-4 border-b hover:bg-muted/50 transition-colors ${isCurrent ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                                } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                            onClick={(e) => {
                                if (isLocked) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                {/* Lesson Number/Status Icon */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted ? 'bg-green-100 dark:bg-green-900' :
                                    isCurrent ? 'bg-purple-100 dark:bg-purple-900' :
                                        'bg-muted'
                                    }`}>
                                    {isLocked ? (
                                        <Lock className="h-4 w-4" />
                                    ) : isCompleted ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : isCurrent ? (
                                        <PlayCircle className="h-4 w-4 text-purple-600" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm mb-1 ${isCurrent ? 'text-purple-600' :
                                        isCompleted ? 'text-green-600' : ''
                                        }`}>
                                        {lesson.titleBn}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {lesson.duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{Math.floor(lesson.duration / 60)} মিনিট</span>
                                            </div>
                                        )}
                                        {isLocked && (
                                            <span className="text-red-600">
                                                {!isEnrolled ? 'Enroll করুন' : 'আগের পাঠ সম্পূর্ণ করুন'}
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="text-green-600">সম্পূর্ণ</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
