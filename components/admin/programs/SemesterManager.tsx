'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, BookOpen, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Semester {
    _id: string;
    number: number;
    titleBn: string;
    level: string;
    descriptionBn: string;
    status: string;
}

interface Program {
    _id: string;
    totalSemesters: number;
    semesters: Semester[];
    // Add other fields as needed for the component, strict typing optional for now
    [key: string]: any;
}

interface SemesterManagerProps {
    program: Program;
    programId: string;
}

export default function SemesterManager({ program, programId }: SemesterManagerProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        titleBn: '',
        descriptionBn: '',
        level: 'basic',
        duration: 3
    });

    const semesters = program.semesters || [];
    const canAddSemester = semesters.length < program.totalSemesters;
    const nextSemesterNumber = semesters.length + 1;

    const handleCreate = async () => {
        if (!formData.titleBn || !formData.descriptionBn) {
            toast.error('শিরোনাম এবং বিবরণ আবশ্যক');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/programs/${programId}/semesters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'সমস্যা হয়েছে');
            }

            toast.success('সেমিস্টার সফলভাবে তৈরি হয়েছে');
            setIsOpen(false);
            setFormData({ titleBn: '', descriptionBn: '', level: 'basic', duration: 3 }); // Reset
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">সেমিস্টার ম্যানেজমেন্ট</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        মোট {program.totalSemesters} টির মধ্যে {semesters.length} টি তৈরি করা হয়েছে
                    </p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!canAddSemester}>
                            <Plus className="mr-2 h-4 w-4" />
                            সেমিস্টার যুক্ত করুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>নতুন সেমিস্টার যোগ করুন ({nextSemesterNumber})</DialogTitle>
                            <DialogDescription>
                                এই সেমিস্টারের তথ্য পূরণ করুন। এটি অটোমেটিক <b>সেমিস্টার {nextSemesterNumber}</b> হিসেবে যুক্ত হবে।
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">সেমিস্টার নাম (বাংলা)</label>
                                <input
                                    type="text"
                                    value={formData.titleBn}
                                    onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                                    placeholder={`যেমন: সেমিস্টার ${nextSemesterNumber} বা প্রাথমিক পর্ব`}
                                    className="w-full rounded-md border p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">বিবরণ</label>
                                <textarea
                                    value={formData.descriptionBn}
                                    onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                                    placeholder="সংক্ষিপ্ত বিবরণ..."
                                    className="w-full rounded-md border p-2 text-sm"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">লেভেল</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full rounded-md border p-2 text-sm"
                                    >
                                        <option value="basic">বেসিক (Basic)</option>
                                        <option value="expert">এক্সপার্ট (expert)</option>
                                        <option value="alim">আলিম (Alim)</option>
                                        <option value="masters">মাস্টার্স (Masters)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">মেয়াদ (মাস)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full rounded-md border p-2 text-sm"
                                        min={1}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>বাতিল</Button>
                            <Button onClick={handleCreate} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                সংরক্ষণ করুন
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Warning if limit reached */}
            {!canAddSemester && (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm mb-4 border border-amber-200">
                    পূর্ণ! আপনি নির্ধারিত সকল সেমিস্টার তৈরি করেছেন। আরও যোগ করতে চাইলে প্রোগ্রামের সেটিংস থেকে মোট সেমিস্টার সংখ্যা বাড়ান।
                </div>
            )}

            {/* List */}
            {semesters.length > 0 ? (
                <div className="space-y-3">
                    {semesters.map((semester) => (
                        <div
                            key={semester._id}
                            className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold">
                                    {semester.number}
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{semester.titleBn}</h4>
                                        <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground uppercase">
                                            {semester.level}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{semester.descriptionBn}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/admin/programs/${programId}/semesters/${semester._id}`)}
                                >
                                    ম্যানেজ
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">কোনো সেমিস্টার নেই</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                        &apos;সেমিস্টার যুক্ত করুন&apos; বাটনে ক্লিক করে প্রথম সেমিস্টার তৈরি করুন
                    </p>
                </div>
            )}
        </div>
    );
}
