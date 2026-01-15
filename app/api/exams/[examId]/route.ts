import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// GET - Get single exam or submit exam
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { examId } = await params;
        await connectDB();

        const exam = await Exam.findById(examId)
            .populate('semester', 'number titleBn')
            .populate('subject', 'titleBn')
            .lean();

        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if student has already submitted
        const existingResult = await ExamResult.findOne({
            student: session.user.id,
            exam: examId,
        }).lean();

        // Hide correct answers for students taking exam
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const examData: any = { ...exam };

        if (session.user.role === 'student' && !existingResult) {
            examData.questions = examData.questions?.map((q: { correctAnswer?: string }) => ({
                ...q,
                correctAnswer: undefined, // Hide correct answer
            }));
        }

        return NextResponse.json({
            exam: examData,
            alreadySubmitted: !!existingResult,
            result: existingResult || null,
        });
    } catch (error) {
        console.error('Get exam error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Submit exam answers
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { examId } = await params;
        await connectDB();

        const { answers } = await request.json();

        // Get exam
        const exam = await Exam.findById(examId);
        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if already submitted
        const existingResult = await ExamResult.findOne({
            student: session.user.id,
            exam: examId,
        });

        if (existingResult) {
            return NextResponse.json(
                { error: 'আপনি ইতিমধ্যে এই পরীক্ষা দিয়েছেন' },
                { status: 400 }
            );
        }

        // Check if exam is still active
        const now = new Date();
        if (now < exam.startTime || now > exam.endTime) {
            return NextResponse.json(
                { error: 'পরীক্ষার সময় শেষ বা শুরু হয়নি' },
                { status: 400 }
            );
        }

        // Grade MCQ questions automatically
        let obtainedMarks = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gradedAnswers = answers.map((answer: any, index: number) => {
            const question = exam.questions[index];
            if (!question) return answer;

            const isCorrect = question.type === 'mcq' &&
                question.correctAnswer === answer.answer;

            const marks = isCorrect ? question.marks : 0;
            obtainedMarks += marks;

            return {
                questionIndex: index,
                answer: answer.answer,
                marks: question.type === 'mcq' ? marks : undefined,
                isCorrect: question.type === 'mcq' ? isCorrect : undefined,
            };
        });

        // Check if all questions are MCQ (auto-grade completely)
        const allMcq = exam.questions.every(q => q.type === 'mcq');

        // Create result
        const result = await ExamResult.create({
            student: session.user.id,
            exam: examId,
            semester: exam.semester,
            answers: gradedAnswers,
            totalMarks: exam.totalMarks,
            obtainedMarks,
            status: allMcq ? 'graded' : 'submitted',
            submittedAt: new Date(),
            gradedAt: allMcq ? new Date() : undefined,
        });

        return NextResponse.json({
            message: 'পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে',
            result,
        }, { status: 201 });
    } catch (error) {
        console.error('Submit exam error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা জমা দিতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
