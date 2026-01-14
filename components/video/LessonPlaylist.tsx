'use client';

import Link from 'next/link';
import { Clock, Lock } from 'lucide-react';

export interface PlaylistLesson {
    _id: string;
    titleBn: string;
    duration?: number;
    order: number;
    isFree?: boolean;
    isCompleted?: boolean;
}

interface LessonPlaylistProps {
    courseId: string;
    currentLessonId: string;
    lessons: PlaylistLesson[];
}

export function LessonPlaylist({ courseId, currentLessonId, lessons }: LessonPlaylistProps) {

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
                    const isCompleted = lesson.isCompleted || false;

                    // Find the index of the last completed lesson
                    const lastCompletedIndex = lessons.reduce((acc, lesson, idx) => {
                        return lesson.isCompleted ? idx : acc;
                    }, -1);

                    // Allow access if:
                    // 1. Lesson is completed
                    // 2. Lesson is current
                    // 3. Lesson is previous to or immediately following the last completed lesson
                    //    (e.g., if L1 is done, L2 is unlocked. If L1, L2 done, L3 unlocked)
                    // 4. Force unlock the first lesson always
                    const canAccess =
                        index === 0 ||
                        isCompleted ||
                        isCurrent ||
                        index <= lastCompletedIndex + 1;

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
                                {/* Lesson Number - Green badge for completed */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isCurrent
                                        ? 'bg-purple-600 text-white'
                                        : isLocked
                                            ? 'bg-muted text-muted-foreground'
                                            : 'bg-muted text-foreground'
                                    }`}>
                                    {isLocked ? (
                                        <Lock className="h-4 w-4" />
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
                                                লক করা - পর্যায়ক্রমে দেখুন
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
