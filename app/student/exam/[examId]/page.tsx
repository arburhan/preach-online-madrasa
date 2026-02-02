'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Question {
    questionBn: string;
    type: 'mcq' | 'short' | 'long';
    options?: string[];
    marks: number;
}

interface Exam {
    _id: string;
    titleBn: string;
    type: string;
    totalMarks: number;
    passMarks: number;
    duration: number;
    questions: Question[];
    startTime: string;
    endTime: string;
    semester?: { titleBn: string };
    subject?: { titleBn: string };
}

interface ExamResult {
    obtainedMarks: number;
    percentage: number;
    grade: string;
    status: string;
}

export default function TakeExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId as string;

    const [exam, setExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<{ answer: string }[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const handleSubmit = useCallback(async () => {
        if (submitting || alreadySubmitted) return;

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

            toast.success('পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে!');
            setResult(data.result);
            setAlreadySubmitted(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [examId, answers, submitting, alreadySubmitted]);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/exams/${examId}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error);
                }

                setExam(data.exam);
                setAlreadySubmitted(data.alreadySubmitted);
                setResult(data.result);
                setAnswers(data.exam.questions?.map(() => ({ answer: '' })) || []);
                setTimeLeft(data.exam.duration * 60);
            } catch (err) {
                console.error(err);
                toast.error('পরীক্ষা লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId]);

    // Timer
    useEffect(() => {
        if (!exam || alreadySubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [exam, alreadySubmitted, timeLeft, handleSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const updateAnswer = (index: number, answer: string) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[index] = { answer };
            return newAnswers;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p>পরীক্ষা লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">পরীক্ষা পাওয়া যায়নি</h1>
                    <Link href="/student/semesters">
                        <Button>ফিরে যান</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Show result if already submitted
    if (alreadySubmitted && result) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-12 max-w-2xl">
                    <div className="bg-card rounded-xl border p-8 text-center">
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-2">{exam.titleBn}</h1>
                        <p className="text-muted-foreground mb-8">আপনার পরীক্ষা সম্পন্ন হয়েছে</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-muted rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">প্রাপ্ত নম্বর</p>
                                <p className="text-2xl font-bold">{result.obtainedMarks}/{exam.totalMarks}</p>
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">শতাংশ</p>
                                <p className="text-2xl font-bold">{result.percentage}%</p>
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">গ্রেড</p>
                                <p className="text-2xl font-bold">{result.grade}</p>
                            </div>
                        </div>

                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${result.obtainedMarks >= exam.passMarks
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {result.obtainedMarks >= exam.passMarks ? 'উত্তীর্ণ ✓' : 'অনুত্তীর্ণ ✗'}
                        </div>

                        <div className="mt-8">
                            <Link href="/student/semesters">
                                <Button>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    ড্যাশবোর্ডে ফিরে যান
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const question = exam.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Timer */}
            <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-bold">{exam.titleBn}</h1>
                            <p className="text-sm text-muted-foreground">
                                প্রশ্ন {currentQuestion + 1}/{exam.questions.length}
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'
                            }`}>
                            <Clock className="h-5 w-5" />
                            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Question Navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {exam.questions.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestion(index)}
                            className={`w-10 h-10 rounded-lg font-medium text-sm ${index === currentQuestion
                                    ? 'bg-primary text-primary-foreground'
                                    : answers[index]?.answer
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-muted'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                {/* Question Card */}
                <div className="bg-card rounded-xl border p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${question.type === 'mcq'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                            {question.type === 'mcq' ? 'MCQ' : question.type === 'short' ? 'সংক্ষিপ্ত' : 'বর্ণনামূলক'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            মার্কস: {question.marks}
                        </span>
                    </div>

                    <h2 className="text-xl font-medium mb-6">{question.questionBn}</h2>

                    {/* Answer Input */}
                    {question.type === 'mcq' && question.options ? (
                        <div className="space-y-3">
                            {question.options.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${answers[currentQuestion]?.answer === option
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${currentQuestion}`}
                                        checked={answers[currentQuestion]?.answer === option}
                                        onChange={() => updateAnswer(currentQuestion, option)}
                                        className="w-4 h-4"
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <textarea
                            value={answers[currentQuestion]?.answer || ''}
                            onChange={(e) => updateAnswer(currentQuestion, e.target.value)}
                            placeholder="আপনার উত্তর লিখুন..."
                            rows={question.type === 'long' ? 8 : 4}
                            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                        />
                    )}
                </div>

                {/* Navigation & Submit */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                    >
                        পূর্ববর্তী
                    </Button>

                    {currentQuestion === exam.questions.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {submitting ? 'জমা হচ্ছে...' : 'পরীক্ষা জমা দিন'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
                        >
                            পরবর্তী
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
