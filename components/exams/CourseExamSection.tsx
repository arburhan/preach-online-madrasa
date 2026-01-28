'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Exam {
    _id: string;
    titleBn: string;
    type: string;
    totalMarks: number;
    passMarks: number;
    duration: number;
    status: string;
    questionsCount?: number;
}

interface ExamResult {
    _id: string;
    obtainedMarks: number;
    totalMarks: number;
    status: string;
}

interface CourseExamSectionProps {
    courseId: string;
}

export default function CourseExamSection({ courseId }: CourseExamSectionProps) {
    const [exams, setExams] = useState<Exam[]>([]);
    const [results, setResults] = useState<{ [examId: string]: ExamResult }>({});
    const [loading, setLoading] = useState(true);
    const [activeExam, setActiveExam] = useState<string | null>(null);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch(`/api/exams?courseId=${courseId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Filter only published exams
                    setExams(data.filter((e: Exam) => e.status === 'published'));
                }
            } catch (error) {
                console.error('Failed to load exams:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, [courseId]);

    // Check for each exam if user has already submitted
    useEffect(() => {
        const checkResults = async () => {
            const resultsMap: { [examId: string]: ExamResult } = {};
            for (const exam of exams) {
                try {
                    const res = await fetch(`/api/exams/${exam._id}`);
                    const data = await res.json();
                    if (data.result) {
                        resultsMap[exam._id] = data.result;
                    }
                } catch (error) {
                    console.error('Failed to check exam result:', error);
                }
            }
            setResults(resultsMap);
        };
        if (exams.length > 0) {
            checkResults();
        }
    }, [exams]);

    if (loading) {
        return (
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (exams.length === 0) {
        return null; // Don't show section if no exams
    }

    return (
        <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">পরীক্ষাসমূহ</h3>
                <Badge variant="secondary">{exams.length}</Badge>
            </div>

            <div className="space-y-3">
                {exams.map((exam) => {
                    const result = results[exam._id];
                    const hasSubmitted = !!result;
                    const passed = hasSubmitted && result.obtainedMarks >= exam.passMarks;

                    return (
                        <div
                            key={exam._id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-medium">{exam.titleBn}</h4>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {exam.duration} মিনিট
                                        </span>
                                        <span>•</span>
                                        <span>{exam.totalMarks} মার্কস</span>
                                        <span>•</span>
                                        <span>পাস: {exam.passMarks}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {hasSubmitted ? (
                                        <div className="flex items-center gap-2">
                                            <Badge variant={passed ? 'default' : 'destructive'}>
                                                {passed ? (
                                                    <><CheckCircle className="h-3 w-3 mr-1" /> পাস</>
                                                ) : (
                                                    <><AlertCircle className="h-3 w-3 mr-1" /> ফেল</>
                                                )}
                                            </Badge>
                                            <span className="text-sm font-medium">
                                                {result.obtainedMarks}/{result.totalMarks}
                                            </span>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => setActiveExam(exam._id)}
                                        >
                                            পরীক্ষা দিন
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Exam Interface */}
                            {activeExam === exam._id && !hasSubmitted && (
                                <ExamTakingInterface
                                    examId={exam._id}
                                    onComplete={(result) => {
                                        setResults({ ...results, [exam._id]: result });
                                        setActiveExam(null);
                                    }}
                                    onCancel={() => setActiveExam(null)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Exam Taking Interface
interface ExamTakingInterfaceProps {
    examId: string;
    onComplete: (result: ExamResult) => void;
    onCancel: () => void;
}

interface Question {
    questionBn: string;
    type: 'mcq' | 'short' | 'long';
    options: string[];
    marks: number;
}

function ExamTakingInterface({ examId, onComplete, onCancel }: ExamTakingInterfaceProps) {
    const [exam, setExam] = useState<{ questions: Question[]; duration: number; titleBn: string } | null>(null);
    const [answers, setAnswers] = useState<{ questionIndex: number; answer: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Load exam questions
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}`);
                const data = await res.json();
                if (data.exam) {
                    setExam(data.exam);
                    setTimeLeft(data.exam.duration * 60); // Convert to seconds
                    // Initialize answers array
                    setAnswers(data.exam.questions.map((_: Question, i: number) => ({
                        questionIndex: i,
                        answer: ''
                    })));
                }
            } catch (error) {
                console.error('Failed to load exam:', error);
                toast.error('পরীক্ষা লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev && prev <= 1) {
                    handleSubmit(); // Auto-submit when time is up
                    return 0;
                }
                return prev ? prev - 1 : 0;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (index: number, answer: string) => {
        setAnswers(prev => prev.map((a, i) => i === index ? { ...a, answer } : a));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/exams/${examId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'পরীক্ষা জমা দিতে সমস্যা হয়েছে');
            }

            toast.success('পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে!');
            onComplete(data.result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mt-4 p-6 border-t flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!exam) return null;

    return (
        <div className="mt-4 pt-4 border-t space-y-4">
            {/* Timer Bar */}
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <span className="font-medium">{exam.titleBn}</span>
                <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft && timeLeft < 60 ? 'text-destructive' : ''}`}>
                    <Clock className="h-4 w-4" />
                    {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {exam.questions.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-3">
                        <div className="flex items-start gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">
                                {qIndex + 1}
                            </span>
                            <div className="flex-1">
                                <p className="font-medium">{q.questionBn}</p>
                                <span className="text-xs text-muted-foreground">({q.marks} মার্কস)</span>
                            </div>
                        </div>

                        {q.type === 'mcq' ? (
                            <div className="space-y-2 ml-8">
                                {q.options.map((opt, oIndex) => (
                                    <label
                                        key={oIndex}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[qIndex]?.answer === opt
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${qIndex}`}
                                            value={opt}
                                            checked={answers[qIndex]?.answer === opt}
                                            onChange={() => handleAnswerChange(qIndex, opt)}
                                            className="w-4 h-4"
                                        />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                value={answers[qIndex]?.answer || ''}
                                onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                placeholder={q.type === 'short' ? 'সংক্ষিপ্ত উত্তর লিখুন...' : 'বিস্তারিত উত্তর লিখুন...'}
                                rows={q.type === 'short' ? 2 : 4}
                                className="w-full ml-8 rounded-lg border border-input bg-background px-4 py-3 text-sm"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel} disabled={submitting}>
                    বাতিল
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            জমা দেওয়া হচ্ছে...
                        </>
                    ) : (
                        'জমা দিন'
                    )}
                </Button>
            </div>
        </div>
    );
}
