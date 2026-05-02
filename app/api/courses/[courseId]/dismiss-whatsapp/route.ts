import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/courses/[courseId]/dismiss-whatsapp
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        const { courseId } = await params;
        await connectDB();

        // Find the student and their enrollment for this course
        const student = await Student.findById(user.id).select('enrolledCourses');

        if (!student) {
            return NextResponse.json(
                { error: 'ব্যবহারকারী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Find the enrollment index (handle both old ObjectId format and new object format)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enrollmentIndex = (student.enrolledCourses || []).findIndex((e: any) => {
            if (e?.toString && typeof e.toString === 'function' && !e.course) {
                return e.toString() === courseId;
            }
            return e?.course?.toString() === courseId;
        });

        if (enrollmentIndex === -1) {
            return NextResponse.json(
                { error: 'এই কোর্সে আপনি নথিভুক্ত নন' },
                { status: 400 }
            );
        }

        // Update using direct positional index
        await Student.findByIdAndUpdate(user.id, {
            $set: {
                [`enrolledCourses.${enrollmentIndex}.whatsappDismissed`]: true,
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
