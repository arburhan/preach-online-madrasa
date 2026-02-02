import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Module from '@/lib/db/models/Module';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Program from '@/lib/db/models/LongCourse';

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

// GET - মডিউল তালিকা
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterNumber: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 });
        }

        const { programId, semesterNumber } = await params;
        const semNum = parseInt(semesterNumber);

        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 });
        }

        // Find semester
        const semester = await ProgramSemester.findOne({
            program: programId,
            semesterNumber: semNum,
        });

        if (!semester) {
            return NextResponse.json({ error: 'সেমিস্টার পাওয়া যায়নি' }, { status: 404 });
        }

        // Fetch modules
        const modules = await Module.find({ programSemester: semester._id })
            .sort({ order: -1 })
            .lean();

        return NextResponse.json(modules);
    } catch (error) {
        console.error('Module fetch error:', error);
        return NextResponse.json({ error: 'সমস্যা হয়েছে' }, { status: 500 });
    }
}

// POST - নতুন মডিউল তৈরি
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterNumber: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 });
        }

        const { programId, semesterNumber } = await params;
        const semNum = parseInt(semesterNumber);
        const body = await request.json();

        await connectDB();

        // Check if user has access (admin or instructor)
        const hasAccess = await checkProgramAccess(programId, session.user.email ?? undefined, session.user.role);
        if (!hasAccess) {
            return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 });
        }

        // Verify program exists and is lesson-based
        const program = await Program.findById(programId);
        if (!program) {
            return NextResponse.json({ error: 'প্রোগ্রাম পাওয়া যায়নি' }, { status: 404 });
        }

        if (program.contentMode !== 'lesson-based') {
            return NextResponse.json(
                { error: 'মডিউল শুধুমাত্র লেসন-ভিত্তিক প্রোগ্রামে তৈরি করা যায়' },
                { status: 400 }
            );
        }

        // Find or create semester
        let semester = await ProgramSemester.findOne({
            program: programId,
            semesterNumber: semNum,
        });

        if (!semester) {
            semester = await ProgramSemester.create({
                program: programId,
                semesterNumber: semNum,
                titleBn: `সেমিস্টার ${semNum}`,
                contentMode: 'lesson-based',
                status: 'draft',
                order: semNum,
                createdBy: session.user.id,
            });
        }

        // Get max order for new module
        const maxOrderModule = await Module.findOne({ programSemester: semester._id })
            .sort({ order: -1 })
            .select('order');
        const newOrder = maxOrderModule ? maxOrderModule.order + 1 : 1;

        // Create module
        const newModule = await Module.create({
            titleBn: body.titleBn,
            titleEn: body.titleEn,
            description: body.description,
            programSemester: semester._id,
            order: body.order || newOrder,
            createdBy: session.user.id,
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        console.error('Module create error:', error);
        return NextResponse.json({ error: 'মডিউল তৈরি করতে সমস্যা হয়েছে' }, { status: 500 });
    }
}
