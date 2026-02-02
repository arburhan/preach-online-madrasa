'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
    questionBn: string;
    type: 'mcq' | 'short' | 'long';
    options?: string[];
    correctAnswer?: string;
    marks: number;
}

interface Exam {
    _id: string;
    titleBn: string;
    totalMarks: number;
    passMarks: number;
    duration?: number;
    questions: Question[];
}

interface ExamResult {
    obtainedMarks: number;
    totalMarks: number;
    passed: boolean;
    canRetake?: boolean;
}

interface ExamViewProps {
    examId: string;
    courseId: string;
    onBack: () => void;
    onNext?: () => void;
}

export default function ExamView({ examId, courseId, onBack, onNext }: ExamViewProps) {
    const [exam, setExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<{ questionIndex: number; answer: string }[]>([]);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [retakeRequested, setRetakeRequested] = useState(false);
    const [requestingRetake, setRequestingRetake] = useState(false);

    // Load exam data
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}`);
                const data = await res.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setExam(data.exam);

                if (data.alreadySubmitted && data.result) {
                    setSubmitted(true);
                    setResult({
                        obtainedMarks: data.result.obtainedMarks,
                        totalMarks: data.result.totalMarks,
                        passed: data.result.obtainedMarks >= data.exam.passMarks,
                        canRetake: data.result.canRetake
                    });

                    // Check for pending retake request
                    if (!data.result.canRetake && data.result.obtainedMarks < data.exam.passMarks) {
                        const retakeRes = await fetch(`/api/exam-retakes?examId=${examId}&status=pending`);
                        const retakeData = await retakeRes.json();
                        if (Array.isArray(retakeData) && retakeData.length > 0) {
                            setRetakeRequested(true);
                        }
                    }
                } else {
                    // Initialize answers
                    setAnswers(data.exam.questions.map((_: Question, i: number) => ({
                        questionIndex: i,
                        answer: ''
                    })));
                    // Start timer
                    if (data.exam.duration) {
                        setTimeLeft(data.exam.duration * 60);
                    }
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'পরীক্ষা লোড করতে সমস্যা হয়েছে');
                onBack();
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId, onBack]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, submitted]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setAnswers(prev =>
            prev.map(a =>
                a.questionIndex === questionIndex ? { ...a, answer } : a
            )
        );
    };

    const handleSubmit = async () => {
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
                throw new Error(data.error || 'জমা দিতে সমস্যা হয়েছে');
            }

            setSubmitted(true);
            setResult({
                obtainedMarks: data.result.obtainedMarks,
                totalMarks: data.result.totalMarks,
                passed: data.result.passed,
                canRetake: false
            });

            // Update lastWatchedLesson to this exam for resume functionality
            try {
                await fetch('/api/progress/lastWatchedLesson', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId, lessonId: examId }),
                });
            } catch (trackErr) {
                console.error('Failed to track exam as last watched:', trackErr);
            }

            toast.success('পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'সমস্যা হয়েছে');
        } finally {
            setSubmitting(false);
        }
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
            toast.error(err instanceof Error ? err.message : 'সমস্যা হয়েছে');
        } finally {
            setRequestingRetake(false);
        }
    };

    const startRetake = () => {
        setSubmitted(false);
        setResult(null);
        setAnswers(exam!.questions.map((_, i) => ({ questionIndex: i, answer: '' })));
        if (exam?.duration) {
            setTimeLeft(exam.duration * 60);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!exam) {
        return null;
    }

    // Result view
    if (submitted && result) {
        return (
            <div className="bg-card border rounded-lg p-8 max-w-2xl mx-auto my-8">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {result.passed ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">
                    {result.passed ? 'অভিনন্দন! 🎉' : 'পরের বার চেষ্টা করুন'}
                </h2>

                <p className="text-center text-muted-foreground mb-6">
                    {exam.titleBn}
                </p>

                <div className="bg-muted rounded-xl p-6 mb-6 text-center">
                    <div className="text-4xl font-bold mb-2">
                        {result.obtainedMarks}/{result.totalMarks}
                    </div>
                    <Badge variant={result.passed ? 'default' : 'destructive'} className="text-sm">
                        {result.passed ? 'পাস' : 'ফেল'} • পাস মার্কস: {exam.passMarks}
                    </Badge>
                </div>

                <div className="flex flex-col gap-3">
                    <Button onClick={onBack} variant="outline" className="w-full">
                        ফিরে যান
                    </Button>
                    {result.passed && onNext && (
                        <Button onClick={onNext} className="w-full">
                            পরবর্তী
                        </Button>
                    )}
                    {!result.passed && (
                        <>
                            {result.canRetake ? (
                                <Button onClick={startRetake} className="w-full">
                                    আবার পরীক্ষা দিন
                                </Button>
                            ) : retakeRequested ? (
                                <Button disabled className="w-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 cursor-not-allowed">
                                    <Clock className="mr-2 h-4 w-4" />
                                    শিক্ষকের অনুমোদনের জন্য অপেক্ষা করুন
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
        );
    }

    // Exam view
    return (
        <div className="bg-card border rounded-lg maxw-4xl mx-auto my-4">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{exam.titleBn}</h1>
                    <p className="text-sm text-muted-foreground">
                        মোট মার্কস: {exam.totalMarks} • পাস মার্কস: {exam.passMarks}
                    </p>
                </div>
                {timeLeft !== null && (
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="h-5 w-5" />
                        <span className={timeLeft < 60 ? 'text-red-600' : ''}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                )}
            </div>

            {/* Questions */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {exam.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div className="flex-1">
                                <p className="font-medium">{question.questionBn}</p>
                                <p className="text-sm text-muted-foreground">মার্কস: {question.marks}</p>
                            </div>
                        </div>

                        {question.type === 'mcq' && question.options ? (
                            <RadioGroup
                                value={answers[index]?.answer || ''}
                                onValueChange={(value) => handleAnswerChange(index, value)}
                            >
                                {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                                        <Label htmlFor={`q${index}-opt${optIndex}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <Textarea
                                placeholder="আপনার উত্তর লিখুন..."
                                value={answers[index]?.answer || ''}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                rows={question.type === 'long' ? 6 : 3}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex gap-3 justify-between">
                <Button onClick={onBack} variant="outline">
                    ফিরে যান
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
