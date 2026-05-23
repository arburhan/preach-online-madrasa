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

// PUT - Update a semester
export async function PUT(
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

        const { programId, semesterNumber: semesterNumStr } = await params;
        const semesterNumber = parseInt(semesterNumStr);
        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { titleBn, descriptionBn, status } = body;

        // Find and update the semester
        const semester = await ProgramSemester.findOneAndUpdate(
            { program: programId, semesterNumber },
            {
                $set: {
                    ...(titleBn !== undefined && { titleBn }),
                    ...(descriptionBn !== undefined && { descriptionBn }),
                    ...(status !== undefined && { status }),
                },
            },
            { new: true, runValidators: true }
        );

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(semester);
    } catch (error) {
        console.error('Update semester error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
