import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// GET - Get exam results (teachers only)
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
                { error: 'শুধুমাত্র শিক্ষকরা ফলাফল দেখতে পারবেন' },
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
                { error: 'এই পরীক্ষার ফলাফল দেখার অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Get query parameters for sorting
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get('sortBy') || 'score';
        const order = searchParams.get('order') || 'desc';

        // Build sort object
        const sortField = sortBy === 'date' ? 'completedAt' : 'score';
        const sortOrder = order === 'asc' ? 1 : -1;

        // Get all exam results
        const results = await ExamResult.find({
            exam: id,
        })
            .populate('student', 'name email')
            .sort({ [sortField]: sortOrder })
            .lean();

        // Serialize the data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serializedResults = results.map((result: any) => ({
            _id: result._id.toString(),
            student: {
                _id: result.student._id.toString(),
                name: result.student.name,
                email: result.student.email,
            },
            score: result.obtainedMarks,
            totalMarks: result.totalMarks,
            percentage: result.percentage,
            passed: result.percentage >= 40,
            completedAt: result.submittedAt?.toISOString() || new Date().toISOString(),
        }));

        return NextResponse.json({
            results: serializedResults,
        });
    } catch (error) {
        console.error('Error fetching exam results:', error);
        return NextResponse.json(
            { error: 'ফলাফল লোড করতে ব্যর্থ হয়েছে' },
            { status: 500 }
        );
    }
}
