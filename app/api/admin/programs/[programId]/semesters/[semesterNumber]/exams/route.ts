import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { auth } from '@/lib/auth/auth.config';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Exam, { ExamFor } from '@/lib/db/models/Exam';
import LongCourse from '@/lib/db/models/LongCourse';

// Helper to check if user is admin or instructor
async function checkProgramAccess(programId: string, userEmail: string | undefined, userRole: string | undefined) {
    if (userRole === 'admin') return true;
    if (!userEmail) return false;

    const program = await LongCourse.findById(programId)
        .populate('maleInstructors', 'email')
        .populate('femaleInstructors', 'email')
        .lean();

    if (!program) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maleMatch = (program as any).maleInstructors?.some((i: { email?: string }) => i?.email === userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const femaleMatch = (program as any).femaleInstructors?.some((i: { email?: string }) => i?.email === userEmail);

    return maleMatch || femaleMatch;
}

// GET - Get all exams for a semester
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterNumber: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId, semesterNumber } = await params;
        const semNum = parseInt(semesterNumber);

        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        // Find the semester
        const semester = await ProgramSemester.findOne({
            program: programId,
            semesterNumber: semNum,
        });

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check for module filter in query params
        const { searchParams } = new URL(request.url);
        const moduleId = searchParams.get('module');

        // Build query - filter by module if provided
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { programSemester: semester._id };
        if (moduleId) {
            query.module = moduleId;
        }

        const exams = await Exam.find(query)
            .sort({ order: 1 })
            .lean();

        return NextResponse.json(exams);
    } catch (error) {
        console.error('Get semester exams error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new exam for a semester
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterNumber: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId, semesterNumber } = await params;
        const semNum = parseInt(semesterNumber);

        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        // Find the semester
        const semester = await ProgramSemester.findOne({
            program: programId,
            semesterNumber: semNum,
        });

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            titleBn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions,
            hasTiming,
            startTime,
            endTime,
            allowRetake,
            status,
            module: moduleId, // Module reference for lesson-based content
        } = body;

        // Validate required fields
        if (!titleBn || !type || !totalMarks || !passMarks || !duration || !questions?.length) {
            return NextResponse.json(
                { error: 'সকল প্রয়োজনীয় তথ্য প্রদান করুন' },
                { status: 400 }
            );
        }

        // Get unified order number (max of both lessons and exams in this semester)
        const Lesson = (await import('@/lib/db/models/Lesson')).default;

        const [lastLesson, lastExam] = await Promise.all([
            Lesson.findOne({ programSemester: semester._id })
                .sort({ order: -1 })
                .select('order')
                .lean(),
            Exam.findOne({ programSemester: semester._id })
                .sort({ order: -1 })
                .select('order')
                .lean()
        ]);

        const maxLessonOrder = lastLesson?.order || 0;
        const maxExamOrder = lastExam?.order || 0;
        const nextOrder = Math.max(maxLessonOrder, maxExamOrder) + 1;

        // Create the exam
        const exam = await Exam.create({
            examFor: ExamFor.PROGRAM_SEMESTER,
            programSemester: semester._id,
            titleBn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions,
            hasTiming: hasTiming || false,
            startTime: hasTiming && startTime ? new Date(startTime) : undefined,
            endTime: hasTiming && endTime ? new Date(endTime) : undefined,
            allowRetake: allowRetake || false,
            status: status || 'draft',
            order: nextOrder,
            createdBy: session.user.id,
            module: moduleId || undefined, // Save module reference if provided
        });

        // Update semester's exam array and count
        await ProgramSemester.findByIdAndUpdate(semester._id, {
            $push: { exams: exam._id },
            $inc: { totalExams: 1 },
        });

        return NextResponse.json(exam, { status: 201 });
    } catch (error) {
        console.error('Create semester exam error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
