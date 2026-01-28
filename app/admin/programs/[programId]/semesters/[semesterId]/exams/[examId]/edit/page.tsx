'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { use } from 'react';

interface Question {
    questionBn: string;
    type: 'mcq' | 'short' | 'long';
    options: string[];
    correctAnswer: string;
    marks: number;
}

interface Subject {
    _id: string;
    titleBn: string;
}

export default function EditSemesterExamPage({
    params,
}: {
    params: Promise<{ programId: string; semesterId: string; examId: string }>;
}) {
    const { programId, semesterId, examId } = use(params);
    const router = useRouter();

    const [formData, setFormData] = useState({
        subject: '',
        titleBn: '',
        type: 'mcq',
        passMarks: '',
        duration: '30',
        hasTiming: false,
        startTime: '',
        endTime: '',
        status: 'draft',
    });

    const [questions, setQuestions] = useState<Question[]>([
        { questionBn: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 }
    ]);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Load exam data
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}`);
                const data = await res.json();
                if (data.exam) {
                    const exam = data.exam;
                    setFormData({
                        subject: exam.subject?._id || exam.subject || '',
                        titleBn: exam.titleBn || '',
                        type: exam.type || 'mcq',
                        passMarks: exam.passMarks?.toString() || '',
                        duration: exam.duration?.toString() || '30',
                        hasTiming: exam.hasTiming || false,
                        startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
                        endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
                        status: exam.status || 'draft',
                    });
                    if (exam.questions?.length > 0) {
                        setQuestions(exam.questions);
                    }
                }
            } catch (error) {
                console.error('Failed to load exam:', error);
                toast.error('পরীক্ষা লোড করতে সমস্যা হয়েছে');
            } finally {
                setFetching(false);
            }
        };
        fetchExam();
    }, [examId]);

    // Load subjects for this semester
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch(`/api/subjects?semesterId=${semesterId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSubjects(data);
                }
            } catch (error) {
                console.error('Failed to load subjects:', error);
            }
        };
        fetchSubjects();
    }, [semesterId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionBn: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
        const updated = [...questions];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updated[index] as any)[field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const calculateTotalMarks = () => {
        return questions.reduce((acc, q) => acc + (q.marks || 0), 0);
    };

    const handleSubmit = async (e: React.FormEvent, newStatus?: string) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/exams/${examId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    totalMarks: calculateTotalMarks(),
                    passMarks: parseInt(formData.passMarks),
                    duration: parseInt(formData.duration),
                    questions,
                    status: newStatus || formData.status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'পরীক্ষা আপডেট করতে সমস্যা হয়েছে');
            }

            toast.success(newStatus === 'published' ? 'পরীক্ষা প্রকাশিত হয়েছে!' : 'পরীক্ষা সংরক্ষিত হয়েছে!');
            router.push(`/admin/programs/${programId}/semesters/${semesterId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const backUrl = `/admin/programs/${programId}/semesters/${semesterId}`;

    if (fetching) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        সেমিস্টারে ফিরে যান
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">পরীক্ষা সম্পাদনা</h1>
                            <p className="text-muted-foreground mt-1">পরীক্ষা আপডেট বা প্রকাশ করুন</p>
                        </div>
                        <div className="flex gap-2">
                            {formData.status === 'draft' && (
                                <Button
                                    onClick={(e) => handleSubmit(e, 'published')}
                                    disabled={loading}
                                    variant="default"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    প্রকাশ করুন
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">পরীক্ষার তথ্য</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">বিষয় (ঐচ্ছিক)</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                >
                                    <option value="">সেমিস্টার পরীক্ষা</option>
                                    {subjects.map(s => (
                                        <option key={s._id} value={s._id}>{s.titleBn}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">পরীক্ষার নাম *</label>
                                <input
                                    type="text"
                                    name="titleBn"
                                    value={formData.titleBn}
                                    onChange={handleChange}
                                    required
                                    placeholder="যেমন: ১ম সেমিস্টার ফাইনাল পরীক্ষা"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">ধরন</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="written">লিখিত</option>
                                    <option value="mixed">মিশ্র</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">মোট মার্কস</label>
                                <input
                                    type="number"
                                    value={calculateTotalMarks()}
                                    disabled
                                    className="w-full rounded-lg border border-input bg-muted px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">পাস মার্কস *</label>
                                <input
                                    type="number"
                                    name="passMarks"
                                    value={formData.passMarks}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">সময় (মিনিট)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min="5"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                        </div>

                        {/* Timing Section - Optional */}
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    id="hasTiming"
                                    name="hasTiming"
                                    checked={formData.hasTiming}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="hasTiming" className="text-sm font-medium">
                                    নির্দিষ্ট সময়সীমা সেট করুন (ঐচ্ছিক)
                                </label>
                            </div>

                            {formData.hasTiming && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">শুরু</label>
                                        <input
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">শেষ</label>
                                        <input
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-semibold">প্রশ্নসমূহ ({questions.length}টি)</h2>
                            <Button type="button" onClick={addQuestion} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                প্রশ্ন যোগ
                            </Button>
                        </div>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        প্রশ্ন #{qIndex + 1}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <textarea
                                    value={q.questionBn}
                                    onChange={(e) => updateQuestion(qIndex, 'questionBn', e.target.value)}
                                    placeholder="প্রশ্ন লিখুন..."
                                    rows={2}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground">ধরন</label>
                                        <select
                                            value={q.type}
                                            onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="mcq">MCQ</option>
                                            <option value="short">সংক্ষিপ্ত</option>
                                            <option value="long">বর্ণনামূলক</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground">মার্কস</label>
                                        <input
                                            type="number"
                                            value={q.marks}
                                            onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                                            min="1"
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>

                                {q.type === 'mcq' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground">অপশন</label>
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctAnswer === opt && opt !== ''}
                                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', opt)}
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    placeholder={`অপশন ${oIndex + 1}`}
                                                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                                />
                                            </div>
                                        ))}
                                        <p className="text-xs text-muted-foreground">
                                            সঠিক উত্তর সিলেক্ট করতে রেডিও বাটন ক্লিক করুন
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    অপেক্ষা করুন...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    সংরক্ষণ করুন
                                </>
                            )}
                        </Button>
                        <Link href={backUrl}>
                            <Button type="button" variant="outline">বাতিল</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
