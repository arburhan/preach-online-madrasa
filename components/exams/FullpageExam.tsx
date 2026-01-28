'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
    questionBn: string;
    type: 'mcq' | 'short' | 'long';
    options: string[];
    marks: number;
}

interface ExamData {
    _id: string;
    titleBn: string;
    totalMarks: number;
    passMarks: number;
    duration: number;
    questions: Question[];
    allowRetake: boolean;
}

interface ExamResult {
    obtainedMarks: number;
    totalMarks: number;
    status: string;
}

interface FullpageExamProps {
    examId: string;
    onClose: () => void;
    onComplete: (result: ExamResult) => void;
}

export default function FullpageExam({ examId, onClose, onComplete }: FullpageExamProps) {
    const [exam, setExam] = useState<ExamData | null>(null);
    const [answers, setAnswers] = useState<{ questionIndex: number; answer: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [existingResult, setExistingResult] = useState<ExamResult | null>(null);
    const [canRetake, setCanRetake] = useState(false);
    const [retakeRequested, setRetakeRequested] = useState(false);
    const [requestingRetake, setRequestingRetake] = useState(false);

    // Load exam
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}`);
                const data = await res.json();

                if (data.alreadySubmitted) {
                    setAlreadySubmitted(true);
                    setExistingResult(data.result);
                    // Check if can retake (approved by teacher)
                    if (data.result?.canRetake) {
                        setCanRetake(true);
                    }

                    // Check if student has pending retake request
                    if (data.exam && data.result) {
                        const passed = data.result.obtainedMarks >= data.exam.passMarks;
                        if (!passed) {
                            // Check for pending retake request
                            try {
                                const retakeRes = await fetch(`/api/exam-retakes?examId=${examId}&status=pending`);
                                const retakeData = await retakeRes.json();
                                if (Array.isArray(retakeData) && retakeData.length > 0) {
                                    setRetakeRequested(true);
                                }
                            } catch (err) {
                                console.error('Failed to check retake request:', err);
                            }
                        }
                    }
                }

                if (data.exam) {
                    setExam(data.exam);
                    if (!data.alreadySubmitted) {
                        setTimeLeft(data.exam.duration * 60);
                        setAnswers(data.exam.questions.map((_: Question, i: number) => ({
                            questionIndex: i,
                            answer: ''
                        })));
                    }
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

    // Handle submit
    const handleSubmit = useCallback(async () => {
        if (submitting) return;
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
            setAlreadySubmitted(true);
            setExistingResult(data.result);
            onComplete(data.result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [examId, answers, submitting, onComplete]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || alreadySubmitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev && prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev ? prev - 1 : 0;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, alreadySubmitted, handleSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (index: number, answer: string) => {
        setAnswers(prev => prev.map((a, i) => i === index ? { ...a, answer } : a));
    };

    const startRetake = async () => {
        // Start fresh retake (previous result will be marked as not latest automatically)
        setAlreadySubmitted(false);
        setExistingResult(null);
        setCanRetake(false);
        setTimeLeft(exam?.duration ? exam.duration * 60 : null);
        setAnswers(exam?.questions.map((_, i) => ({ questionIndex: i, answer: '' })) || []);
    };

    const handleRetakeRequest = async () => {
        if (requestingRetake) return;
        setRequestingRetake(true);
        try {
            const res = await fetch('/api/exam-retakes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'অনুরোধ জমা দিতে সমস্যা হয়েছে');
            }

            toast.success('আবার পরীক্ষা দেয়ার অনুরোধ জমা দেওয়া হয়েছে। শিক্ষক অনুমোদন করলে আপনি পুনরায় পরীক্ষা দিতে পারবেন।');
            setRetakeRequested(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setRequestingRetake(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4">পরীক্ষা পাওয়া যায়নি</p>
                    <Button onClick={onClose}>ফিরে যান</Button>
                </div>
            </div>
        );
    }

    // Already submitted - show result
    if (alreadySubmitted && existingResult) {
        const passed = existingResult.obtainedMarks >= exam.passMarks;
        return (
            <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-card rounded-2xl border p-8 text-center">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {passed ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
                        </div>

                        <h2 className="text-2xl font-bold mb-2">
                            {passed ? 'অভিনন্দন! 🎉' : 'পরের বার চেষ্টা করুন'}
                        </h2>

                        <p className="text-muted-foreground mb-6">
                            {exam.titleBn}
                        </p>

                        <div className="bg-muted rounded-xl p-6 mb-6">
                            <div className="text-4xl font-bold mb-2">
                                {existingResult.obtainedMarks}/{existingResult.totalMarks}
                            </div>
                            <Badge variant={passed ? 'default' : 'destructive'} className="text-sm">
                                {passed ? 'পাস' : 'ফেল'} • পাস মার্কস: {exam.passMarks}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button onClick={onClose} variant="outline" className="w-full">
                                ফিরে যান
                            </Button>
                            {!passed && (
                                <>
                                    {canRetake ? (
                                        <Button onClick={startRetake} className="w-full">
                                            আবার পরীক্ষা দিন
                                        </Button>
                                    ) : retakeRequested ? (
                                        <Button disabled className="w-full">
                                            অনুরোধ অপেক্ষมান...
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleRetakeRequest}
                                            disabled={requestingRetake}
                                            className="w-full"
                                        >
                                            {requestingRetake ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    জমা দেওয়া হচ্ছে...
                                                </>
                                            ) : (
                                                'আবার পরীক্ষা দেয়ার জন্য অনুরোধ করুন'
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-card border-b p-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-xl font-bold">{exam.titleBn}</h1>
                    <p className="text-sm text-muted-foreground">
                        মোট: {exam.totalMarks} মার্কস • পাস: {exam.passMarks} মার্কস
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 font-mono text-xl px-4 py-2 rounded-lg ${timeLeft && timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-muted'
                        }`}>
                        <Clock className="h-5 w-5" />
                        {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Questions */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    {exam.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-card rounded-xl border p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <span className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                                    {qIndex + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-lg font-medium">{q.questionBn}</p>
                                    <span className="text-sm text-muted-foreground">{q.marks} মার্কস</span>
                                </div>
                            </div>

                            {q.type === 'mcq' ? (
                                <div className="space-y-3 ml-14">
                                    {q.options.map((opt, oIndex) => (
                                        <label
                                            key={oIndex}
                                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[qIndex]?.answer === opt
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted hover:border-primary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${qIndex}`}
                                                value={opt}
                                                checked={answers[qIndex]?.answer === opt}
                                                onChange={() => handleAnswerChange(qIndex, opt)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-base">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={answers[qIndex]?.answer || ''}
                                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                    placeholder={q.type === 'short' ? 'সংক্ষিপ্ত উত্তর লিখুন...' : 'বিস্তারিত উত্তর লিখুন...'}
                                    rows={q.type === 'short' ? 3 : 6}
                                    className="w-full ml-14 rounded-lg border-2 border-muted bg-background px-4 py-3 text-base focus:border-primary outline-none"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-card border-t p-4 shrink-0">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        উত্তর দেওয়া হয়েছে: {answers.filter(a => a.answer.trim() !== '').length}/{exam.questions.length}
                    </div>
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                জমা দেওয়া হচ্ছে...
                            </>
                        ) : (
                            'জমা দিন'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
