import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/LongCourse';
import { auth } from '@/lib/auth/auth.config';

// Helper to check if user is admin or instructor
async function checkProgramAccess(programId: string, userEmail: string | undefined, userRole: string | undefined) {
    if (userRole === 'admin') return true;
    if (!userEmail) return false;

    const program = await Program.findById(programId)
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

// GET - Get single program by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        await connectDB();

        const program = await Program.findById(programId)
            .populate('semesters')
            .populate('createdBy', 'name')
            .lean();

        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error('Get program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT - Update program (admin or assigned instructor)
export async function PUT(
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

        const body = await request.json();

        const program = await Program.findByIdAndUpdate(
            programId,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error('Update program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Delete program (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId } = await params;
        await connectDB();

        const program = await Program.findByIdAndDelete(programId);

        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'প্রোগ্রাম মুছে ফেলা হয়েছে' });
    } catch (error) {
        console.error('Delete program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
