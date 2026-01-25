'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, PlayCircle, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
    _id: string;
    titleBn: string;
    videoUrl: string;
    duration: number;
    descriptionBn?: string;
}

interface Section {
    _id: string;
    titleBn: string;
    order: number;
    lessons: Lesson[];
}

interface SemesterContentManagerProps {
    programId: string;
    semesterId: string;
    sections: Section[];
}

export default function SemesterContentManager({
    programId,
    semesterId,
    sections: initialSections,
}: SemesterContentManagerProps) {
    const router = useRouter();
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const handleCreateSection = async () => {
        if (!newSectionTitle.trim()) {
            toast.error('সেকশন শিরোনাম আবশ্যক');
            return;
        }

        try {
            const res = await fetch(`/api/admin/programs/${programId}/semesters/${semesterId}/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titleBn: newSectionTitle }),
            });

            if (!res.ok) throw new Error('Failed to create section');

            toast.success('সেকশন তৈরি হয়েছে');
            setNewSectionTitle('');
            setIsCreatingSection(false);
            router.refresh();
        } catch (_) {
            toast.error('সমস্যা হয়েছে');
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('আপনি কি নিশ্চিত যে আপনি এই সেকশনটি এবং এর সমস্ত পাঠ মুছে ফেলতে চান?')) return;

        try {
            const res = await fetch(`/api/admin/programs/${programId}/semesters/${semesterId}/sections/${sectionId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete section');

            toast.success('সেকশন মুছে ফেলা হয়েছে');
            router.refresh();
        } catch {
            toast.error('মুছতে সমস্যা হয়েছে');
        }
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        if (!confirm('আপনি কি নিশ্চিত যে আপনি এই পাঠটি মুছে ফেলতে চান?')) return;

        try {
            const res = await fetch(`/api/admin/programs/${programId}/semesters/${semesterId}/sections/${sectionId}/lessons/${lessonId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete lesson');

            toast.success('পাঠ মুছে ফেলা হয়েছে');
            router.refresh();
        } catch {
            toast.error('মুছতে সমস্যা হয়েছে');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Add Section Button */}
            <div className="flex justify-end">
                <Dialog open={isCreatingSection} onOpenChange={setIsCreatingSection}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            নতুন সেকশন
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>নতুন সেকশন তৈরি করুন</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <Input
                                placeholder="সেকশন শিরোনাম (যেমন: ভূমিকা)"
                                value={newSectionTitle}
                                onChange={(e) => setNewSectionTitle(e.target.value)}
                            />
                            <Button onClick={handleCreateSection} className="w-full">
                                তৈরি করুন
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Sections List */}
            {initialSections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
                    <p className="text-muted-foreground">কোনো সেকশন নেই। &apos;নতুন সেকশন&apos; বাটনে ক্লিক করে শুরু করুন।</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {initialSections.map((section) => (
                        <div key={section._id} className="border rounded-xl bg-card overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-muted/40 p-4 border-b flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{section.titleBn}</h3>
                                <div className="flex items-center gap-2">
                                    {/* Add Lesson Link - navigates to full page */}
                                    <Link href={`/admin/programs/${programId}/semesters/${semesterId}/sections/${section._id}/lessons/new`}>
                                        <Button variant="outline" size="sm">
                                            <Plus className="mr-2 h-3 w-3" />
                                            পাঠ যুক্ত করুন
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => handleDeleteSection(section._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="p-2 space-y-1">
                                {section.lessons?.length > 0 ? (
                                    section.lessons.map((lesson) => (
                                        <div key={lesson._id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg group">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <PlayCircle className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{lesson.titleBn}</p>
                                                <p className="text-xs text-muted-foreground truncate">{lesson.videoUrl}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteLesson(section._id, lesson._id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground italic">
                                        এই সেকশনে কোনো পাঠ নেই
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}
