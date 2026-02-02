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

// GET - Get all semesters for a program
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId } = await params;
        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const semesters = await ProgramSemester.find({ program: programId })
            .sort({ semesterNumber: 1 })
            .lean();

        return NextResponse.json(semesters);
    } catch (error) {
        console.error('Get semesters error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new semester
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId } = await params;
        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        // Check program exists
        const program = await LongCourse.findById(programId);
        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { semesterNumber, titleBn, descriptionBn, contentMode } = body;

        // Validate semester number
        if (!semesterNumber || semesterNumber < 1 || semesterNumber > program.totalSemesters) {
            return NextResponse.json(
                { error: 'অবৈধ সেমিস্টার নম্বর' },
                { status: 400 }
            );
        }

        // Check if semester already exists
        const existing = await ProgramSemester.findOne({
            program: programId,
            semesterNumber,
        });

        if (existing) {
            return NextResponse.json(
                { error: 'এই সেমিস্টার ইতিমধ্যে বিদ্যমান' },
                { status: 400 }
            );
        }

        // Create semester
        const semester = await ProgramSemester.create({
            program: programId,
            semesterNumber,
            titleBn: titleBn || `সেমিস্টার ${semesterNumber}`,
            descriptionBn,
            contentMode: contentMode || 'direct',
            status: 'draft',
            order: semesterNumber,
            createdBy: session.user.id,
        });

        // Add to program's semesters array
        await LongCourse.findByIdAndUpdate(programId, {
            $push: { semesters: semester._id }
        });

        return NextResponse.json(semester, { status: 201 });
    } catch (error) {
        console.error('Create semester error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
