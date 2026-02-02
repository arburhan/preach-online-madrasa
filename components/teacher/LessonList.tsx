'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface LessonListProps {
    lessons: Array<{
        _id: string;
        titleBn: string;
        titleEn?: string;
        duration?: number;
        order: number;
        isFree: boolean;
    }>;
    courseId: string;
}

export default function LessonList({ lessons, courseId }: LessonListProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (lessonId: string) => {
        if (!confirm('আপনি কি নিশ্চিত এই পাঠটি মুছে ফেলতে চান?')) {
            return;
        }

        setDeleting(lessonId);

        try {
            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'পাঠ মুছতে সমস্যা হয়েছে');
            }

            toast.success('পাঠ মুছে ফেলা হয়েছে');
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'পাঠ মুছতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setDeleting(null);
        }
    };

    if (lessons.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">এখনো কোনো পাঠ যোগ করা হয়নি</p>
                <p className="text-sm text-muted-foreground mt-2">
                    উপরের বাটনে ক্লিক করে প্রথম পাঠ যোগ করুন
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {lessons.map((lesson, index) => (
                <div
                    key={lesson._id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                {index + 1}.
                            </span>
                            <h4 className="font-semibold">{lesson.titleBn}</h4>
                            {lesson.isFree && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                                    বিনামূল্যে
                                </span>
                            )}
                        </div>
                        {lesson.duration && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {Math.floor(lesson.duration / 60)} মিনিট
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/teacher/courses/${courseId}/lessons/${lesson._id}`)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(lesson._id)}
                            disabled={deleting === lesson._id}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
