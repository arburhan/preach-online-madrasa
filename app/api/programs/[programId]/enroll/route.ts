import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Program from '@/lib/db/models/LongCourse';
import { requireAuth } from '@/lib/auth/rbac';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const user = await requireAuth();
        const { programId } = await params;

        await connectDB();

        // 1. Check if program exists
        const program = await Program.findById(programId);
        if (!program) {
            return NextResponse.json({ error: 'প্রোগ্রাম পাওয়া যায়নি' }, { status: 404 });
        }

        // 2. Check if already enrolled (using Student model)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const student: any = await Student.findById((user as any).id || (user as any)._id);

        if (!student) {
            return NextResponse.json({ error: 'শিক্ষার্থী পাওয়া যায়নি' }, { status: 404 });
        }

        const isEnrolled = student?.enrolledPrograms?.some(
            (enrollment: { program: { toString: () => string; }; }) => enrollment.program?.toString() === programId
        );

        if (isEnrolled) {
            return NextResponse.json({ message: 'আপনি ইতিমধ্যে এনরোল করেছেন', isEnrolled: true });
        }

        // 3. Enroll student
        await Student.findByIdAndUpdate((user as any).id || (user as any)._id, {
            $push: {
                enrolledPrograms: {
                    program: programId,
                    enrolledAt: new Date(),
                },
            },
        });

        // 4. Update program stats (optional)
        // await Program.findByIdAndUpdate(programId, { $inc: { enrolledCount: 1 } });

        return NextResponse.json({ message: 'এনরোলমেন্ট সফল হয়েছে', isEnrolled: true });

    } catch (error) {
        console.error('Program enrollment error:', error);
        return NextResponse.json(
            { error: 'এনরোল করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
