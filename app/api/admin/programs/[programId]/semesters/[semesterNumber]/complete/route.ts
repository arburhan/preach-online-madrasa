import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { auth } from '@/lib/auth/auth.config';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
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

// PATCH - Mark semester as completed/uncompleted
export async function PATCH(
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

        // Toggle completion status
        semester.isCompleted = !semester.isCompleted;
        semester.completedAt = semester.isCompleted ? new Date() : undefined;

        // If marking as completed, also set status to active
        if (semester.isCompleted && semester.status === 'draft') {
            semester.status = 'active';
        }

        await semester.save();

        return NextResponse.json({
            success: true,
            isCompleted: semester.isCompleted,
            message: semester.isCompleted
                ? 'সেমিস্টার সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে'
                : 'সেমিস্টার সম্পন্ন চিহ্ন সরানো হয়েছে',
        });
    } catch (error) {
        console.error('Semester completion error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
