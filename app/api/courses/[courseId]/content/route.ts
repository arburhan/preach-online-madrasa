import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// GET /api/courses/[courseId]/content - Get unified content (lessons + exams) for watch page
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { courseId } = await params;
        await connectDB();

        // Fetch lessons
        const lessons = await Lesson.find({ course: courseId })
            .sort({ order: 1 })
            .select('_id titleBn titleEn duration order isFree')
            .lean();

        // Fetch exams
        const exams = await Exam.find({ course: courseId })
            .sort({ order: 1 })
            .select('_id titleBn titleEn order totalMarks passMarks questions')
            .lean();

        // Get user's progress
        const Progress = (await import('@/lib/db/models/Progress')).default;
        const progresses = await Progress.find({
            user: session.user.id,
            course: courseId
        }).lean();

        const completedLessonIds = new Set(
            progresses
                .filter((p: any) => p.isCompleted)
                .map((p: any) => p.lesson?.toString())
        );

        // Get user's exam results
        const examResults = await ExamResult.find({
            student: session.user.id,
            course: courseId
        }).lean();

        const examResultsMap = new Map();
        examResults.forEach((result: any) => {
            const examId = result.exam.toString();
            if (!examResultsMap.has(examId) || result.createdAt > examResultsMap.get(examId).createdAt) {
                examResultsMap.set(examId, result);
            }
        });

        // Combine and sort content
        const content: any[] = [];

        // Add lessons
        lessons.forEach((lesson: any) => {
            content.push({
                type: 'lesson',
                _id: lesson._id.toString(),
                order: lesson.order || 0,
                titleBn: lesson.titleBn,
                titleEn: lesson.titleEn,
                duration: lesson.duration,
                isCompleted: completedLessonIds.has(lesson._id.toString()),
                isLocked: false, // We'll calculate this below
            });
        });

        // Add exams
        exams.forEach((exam: any) => {
            const examId = exam._id.toString();
            const result = examResultsMap.get(examId);
            const isPassed = result ? result.obtainedMarks >= exam.passMarks : false;

            content.push({
                type: 'exam',
                _id: examId,
                order: exam.order || 999,
                titleBn: exam.titleBn,
                titleEn: exam.titleEn,
                totalMarks: exam.totalMarks,
                passMarks: exam.passMarks,
                questionCount: exam.questions?.length || 0,
                isCompleted: !!result,
                isPassed,
                isLocked: false, // We'll calculate this below
                obtainedMarks: result?.obtainedMarks,
            });
        });

        // Sort by order
        content.sort((a, b) => a.order - b.order);

        // Calculate locked status (sequential unlocking)
        // Only lock if previous EXAM was not passed, don't lock based on lesson completion
        for (let i = 1; i < content.length; i++) {
            const prevContent = content[i - 1];
            const currentContent = content[i];

            // Only lock if previous content was an EXAM that wasn't passed
            if (prevContent.type === 'exam' && !prevContent.isPassed) {
                currentContent.isLocked = true;
            }

            // Note: We don't lock based on lesson completion because:
            // - Lessons might be watched but not marked complete
            // - Users should be able to navigate freely between lessons
            // - Only exam failures should block progress
        }

        return NextResponse.json(content);
    } catch (error) {
        console.error('Get course content error:', error);
        return NextResponse.json(
            { error: 'কন্টেন্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
