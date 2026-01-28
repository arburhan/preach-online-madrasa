import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// GET - Get single exam or submit exam
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const exam = await Exam.findById(id)
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
            exam: id,
            isLatest: true,
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
            alreadySubmitted: existingResult && !existingResult.canRetake,
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const { answers } = await request.json();

        // Get exam
        const exam = await Exam.findById(id);
        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if already submitted (and not allowed to retake)
        const existingResult = await ExamResult.findOne({
            student: session.user.id,
            exam: id,
            isLatest: true,
        });

        if (existingResult && !existingResult.canRetake) {
            return NextResponse.json(
                { error: 'আপনি ইতিমধ্যে এই পরীক্ষা দিয়েছেন' },
                { status: 400 }
            );
        }

        // Check if exam is still active (only if timing is enabled)
        const now = new Date();
        if (exam.hasTiming && exam.startTime && exam.endTime) {
            if (now < exam.startTime || now > exam.endTime) {
                return NextResponse.json(
                    { error: 'পরীক্ষার সময় শেষ বা শুরু হয়নি' },
                    { status: 400 }
                );
            }
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

        // If retaking, mark previous attempts as not latest and increment attempt number
        let attemptNumber = 1;
        if (existingResult) {
            // Mark previous attempt as not latest
            await ExamResult.updateMany(
                { student: session.user.id, exam: id },
                { $set: { isLatest: false } }
            );
            attemptNumber = (existingResult.attemptNumber || 1) + 1;
        }

        // Calculate percentage and passed status
        const percentage = exam.totalMarks > 0
            ? Math.round((obtainedMarks / exam.totalMarks) * 100)
            : 0;
        const passed = obtainedMarks >= exam.passMarks;

        // Create result
        const result = await ExamResult.create({
            student: session.user.id,
            exam: id,
            course: exam.course, // Short course এর জন্য
            semester: exam.semester, // Long course এর জন্য
            answers: gradedAnswers,
            totalMarks: exam.totalMarks,
            obtainedMarks,
            percentage,
            status: allMcq ? 'graded' : 'submitted',
            attemptNumber,
            isLatest: true,
            canRetake: false, // Reset after retake
            submittedAt: new Date(),
            gradedAt: allMcq ? new Date() : undefined,
        });

        return NextResponse.json({
            message: 'পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে',
            result: {
                ...result.toObject(),
                passed, // Include passed status for frontend
                percentage,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Submit exam error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা জমা দিতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT - Update exam (admin/teacher)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !['admin', 'teacher'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const exam = await Exam.findById(id);
        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            titleBn,
            titleEn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions,
            hasTiming,
            startTime,
            endTime,
            status,
        } = body;

        // Update fields
        if (titleBn !== undefined) exam.titleBn = titleBn;
        if (titleEn !== undefined) exam.titleEn = titleEn;
        if (type !== undefined) exam.type = type;
        if (totalMarks !== undefined) exam.totalMarks = totalMarks;
        if (passMarks !== undefined) exam.passMarks = passMarks;
        if (duration !== undefined) exam.duration = duration;
        if (questions !== undefined) exam.questions = questions;
        if (hasTiming !== undefined) exam.hasTiming = hasTiming;
        if (startTime !== undefined) exam.startTime = hasTiming ? new Date(startTime) : undefined;
        if (endTime !== undefined) exam.endTime = hasTiming ? new Date(endTime) : undefined;
        if (status !== undefined) exam.status = status;

        await exam.save();

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Update exam error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Delete exam
// Teachers can only delete draft exams
// Admins can delete any exam
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অনুমোদিত নন' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find the exam
        const exam = await Exam.findById(id);

        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Admin can delete any exam
        if (session.user.role === 'admin') {
            await Exam.findByIdAndDelete(id);
            await ExamResult.deleteMany({ exam: id });
            return NextResponse.json(
                { message: 'পরীক্ষা মুছে ফেলা হয়েছে' },
                { status: 200 }
            );
        }

        // Teacher can only delete draft exams they own
        if (session.user.role === 'teacher') {
            // Check if exam is draft
            if (exam.status !== 'draft') {
                return NextResponse.json(
                    { error: 'শুধুমাত্র ড্রাফট পরীক্ষা মুছে ফেলা যায়। প্রকাশিত পরীক্ষা মুছতে পারবেন না।' },
                    { status: 400 }
                );
            }

            // Check if teacher owns the exam
            if (exam.createdBy?.toString() !== session.user.id) {
                return NextResponse.json(
                    { error: 'এই পরীক্ষা মুছার অনুমতি নেই' },
                    { status: 403 }
                );
            }

            await Exam.findByIdAndDelete(id);
            return NextResponse.json(
                { message: 'পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে' },
                { status: 200 }
            );
        }

        // Other roles cannot delete
        return NextResponse.json(
            { error: 'পরীক্ষা মুছার অনুমতি নেই' },
            { status: 403 }
        );
    } catch (error) {
        console.error('Error deleting exam:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা মুছতে ব্যর্থ হয়েছে' },
            { status: 500 }
        );
    }
}
