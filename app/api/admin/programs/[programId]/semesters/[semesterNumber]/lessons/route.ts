import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { auth } from '@/lib/auth/auth.config';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Lesson from '@/lib/db/models/Lesson';
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

// GET - Get all lessons for a semester
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

        const lessons = await Lesson.find(query)
            .sort({ order: 1 })
            .lean();

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Get semester lessons error:', error);
        return NextResponse.json(
            { error: 'পাঠ লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new lesson for a semester
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
            titleEn,
            descriptionBn,
            descriptionEn,
            videoSource,
            videoUrl,
            videoKey,
            isFree,
            attachments,
            module: moduleId, // Module reference for lesson-based content
        } = body;

        // Validate required fields
        if (!titleBn || !videoSource || !videoUrl) {
            return NextResponse.json(
                { error: 'শিরোনাম এবং ভিডিও আবশ্যক' },
                { status: 400 }
            );
        }

        // Get unified order number (max of both lessons and exams in this semester)
        const Exam = (await import('@/lib/db/models/Exam')).default;

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

        // Create the lesson
        const lesson = await Lesson.create({
            programSemester: semester._id,
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            videoSource,
            videoUrl,
            videoKey,
            isFree: isFree || false,
            order: nextOrder,
            attachments: attachments || [],
            module: moduleId || undefined, // Save module reference if provided
        });

        // Update semester's lesson array and count
        await ProgramSemester.findByIdAndUpdate(semester._id, {
            $push: { lessons: lesson._id },
            $inc: { totalLessons: 1 },
        });

        return NextResponse.json(lesson, { status: 201 });
    } catch (error) {
        console.error('Create semester lesson error:', error);
        return NextResponse.json(
            { error: 'পাঠ তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
