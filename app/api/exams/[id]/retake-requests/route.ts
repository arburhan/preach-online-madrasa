import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import RetakeRequest, { RetakeRequestStatus } from '@/lib/db/models/RetakeRequest';
import { auth } from '@/lib/auth/auth.config';

// GET - Get pending retake requests for an exam (teachers only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অনুমোদিত নন' },
                { status: 401 }
            );
        }

        // Check if user is teacher
        if (session.user.role !== 'teacher') {
            return NextResponse.json(
                { error: 'শুধুমাত্র শিক্ষকরা পুনঃপরীক্ষার অনুরোধ দেখতে পারবেন' },
                { status: 403 }
            );
        }

        await connectDB();

        // Find the exam with course populated
        const exam = await Exam.findById(id).populate('course');

        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if teacher has access (either created the exam or is a course instructor)
        const hasAccess =
            exam.createdBy?.toString() === session.user.id ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (exam.course as any)?.instructors?.some(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (instructorId: any) => instructorId.toString() === session.user.id
            );

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'এই পরীক্ষার অনুরোধ দেখার অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Get pending retake requests
        const requests = await RetakeRequest.find({
            exam: id,
            status: RetakeRequestStatus.PENDING
        })
            .populate('student', 'name email')
            .populate('previousResult', 'percentage')
            .sort({ requestedAt: -1 })
            .lean();

        // Serialize the data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serializedRequests = requests.map((req: any) => ({
            _id: req._id.toString(),
            student: {
                _id: req.student._id.toString(),
                name: req.student.name,
                email: req.student.email,
            },
            reason: req.reason,
            requestedAt: req.requestedAt.toISOString(),
            previousScore: req.previousResult?.percentage || 0,
        }));

        return NextResponse.json({
            requests: serializedRequests,
        });
    } catch (error) {
        console.error('Error fetching retake requests:', error);
        return NextResponse.json(
            { error: 'পুনঃপরীক্ষার অনুরোধ লোড করতে ব্যর্থ হয়েছে' },
            { status: 500 }
        );
    }
}
