import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/programs/[programId]/dismiss-whatsapp
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        const { programId } = await params;
        await connectDB();

        // Find the student and their program enrollment
        const student = await Student.findById(user.id).select('enrolledPrograms');

        if (!student) {
            return NextResponse.json(
                { error: 'ব্যবহারকারী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Find the enrollment index
        const enrollmentIndex = (student.enrolledPrograms || []).findIndex(
            (e: { program: { toString: () => string } }) =>
                e.program?.toString() === programId
        );

        if (enrollmentIndex === -1) {
            return NextResponse.json(
                { error: 'এই প্রোগ্রামে আপনি নথিভুক্ত নন' },
                { status: 400 }
            );
        }

        // Update using direct positional index
        await Student.findByIdAndUpdate(user.id, {
            $set: {
                [`enrolledPrograms.${enrollmentIndex}.whatsappDismissed`]: true,
            },
        });

        return NextResponse.json({
            message: 'হোয়াটসঅ্যাপ সেকশন বন্ধ করা হয়েছে',
            dismissed: true,
        });
    } catch (error) {
        console.error('Dismiss WhatsApp error:', error);
        return NextResponse.json(
            { error: 'সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
