import connectDB from '@/lib/db/mongodb';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import Progress from '@/lib/db/models/Progress';
import ExamResult from '@/lib/db/models/ExamResult';

interface SemesterProgressionResult {
    canAccess: boolean;
    reason?: string;
    previousSemesterNumber?: number;
    completionPercentage?: number;
}

/**
 * শিক্ষার্থী কোন সেমিস্টারে অ্যাক্সেস করতে পারবে কিনা চেক করে
 * 
 * শর্তসমূহ:
 * 1. প্রথম সেমিস্টার সবসময় অ্যাক্সেসযোগ্য
 * 2. পরবর্তী সেমিস্টারে যেতে হলে:
 *    - পূর্ববর্তী সেমিস্টারের সব লেসন দেখতে হবে
 *    - পূর্ববর্তী সেমিস্টারের সব পরীক্ষায় পাস করতে হবে (≥40%)
 *    - এডমিন পূর্ববর্তী সেমিস্টার সম্পন্ন হিসেবে চিহ্নিত করতে হবে
 */
export async function canAccessSemester(
    studentId: string,
    programId: string,
    semesterNumber: number
): Promise<SemesterProgressionResult> {
    await connectDB();

    // প্রথম সেমিস্টার সবসময় অ্যাক্সেসযোগ্য
    if (semesterNumber === 1) {
        return { canAccess: true };
    }

    const previousSemesterNumber = semesterNumber - 1;

    // পূর্ববর্তী সেমিস্টার খুঁজুন
    const previousSemester = await ProgramSemester.findOne({
        program: programId,
        semesterNumber: previousSemesterNumber,
    }).lean();

    // যদি পূর্ববর্তী সেমিস্টার না থাকে, অ্যাক্সেস দিন
    if (!previousSemester) {
        return { canAccess: true };
    }

    // চেক ১: এডমিন কি সেমিস্টার সম্পন্ন হিসেবে চিহ্নিত করেছে?
    if (!previousSemester.isCompleted) {
        return {
            canAccess: false,
            reason: `সেমিস্টার ${previousSemesterNumber} এখনো সম্পন্ন হিসেবে চিহ্নিত করা হয়নি`,
            previousSemesterNumber,
        };
    }

    // চেক ২: সব লেসন দেখা হয়েছে কিনা?
    const semesterId = previousSemester._id;
    const lessons = await Lesson.find({ programSemester: semesterId }).select('_id').lean();
    const lessonIds = lessons.map(l => l._id);

    if (lessonIds.length > 0) {
        const completedLessons = await Progress.countDocuments({
            user: studentId,
            lesson: { $in: lessonIds },
            isCompleted: true,
        });

        if (completedLessons < lessonIds.length) {
            const percentage = Math.round((completedLessons / lessonIds.length) * 100);
            return {
                canAccess: false,
                reason: `সেমিস্টার ${previousSemesterNumber} এর সব পাঠ দেখা হয়নি (${completedLessons}/${lessonIds.length})`,
                previousSemesterNumber,
                completionPercentage: percentage,
            };
        }
    }

    // চেক ৩: সব পরীক্ষায় পাস করেছে কিনা?
    const exams = await Exam.find({ programSemester: semesterId }).select('_id').lean();
    const examIds = exams.map(e => e._id);

    if (examIds.length > 0) {
        const passedExams = await ExamResult.countDocuments({
            student: studentId,
            exam: { $in: examIds },
            percentage: { $gte: 40 }, // ডি গ্রেড বা তার উপরে
            isLatest: true,
        });

        if (passedExams < examIds.length) {
            return {
                canAccess: false,
                reason: `সেমিস্টার ${previousSemesterNumber} এর সব পরীক্ষায় পাস করা হয়নি (${passedExams}/${examIds.length})`,
                previousSemesterNumber,
            };
        }
    }

    // সব শর্ত পূরণ হয়েছে
    return { canAccess: true };
}

/**
 * একটি সেমিস্টারের সম্পূর্ণ প্রোগ্রেস ক্যালকুলেট করে
 */
export async function getSemesterProgress(
    studentId: string,
    semesterId: string
): Promise<{
    lessonsCompleted: number;
    totalLessons: number;
    examsPassed: number;
    totalExams: number;
    overallPercentage: number;
}> {
    await connectDB();

    // লেসন প্রোগ্রেস
    const lessons = await Lesson.find({ programSemester: semesterId }).select('_id').lean();
    const lessonIds = lessons.map(l => l._id);

    const lessonsCompleted = lessonIds.length > 0
        ? await Progress.countDocuments({
            user: studentId,
            lesson: { $in: lessonIds },
            isCompleted: true,
        })
        : 0;

    // এক্সাম প্রোগ্রেস
    const exams = await Exam.find({ programSemester: semesterId }).select('_id').lean();
    const examIds = exams.map(e => e._id);

    const examsPassed = examIds.length > 0
        ? await ExamResult.countDocuments({
            student: studentId,
            exam: { $in: examIds },
            percentage: { $gte: 40 },
            isLatest: true,
        })
        : 0;

    // ওভারঅল পার্সেন্টেজ
    const totalItems = lessonIds.length + examIds.length;
    const completedItems = lessonsCompleted + examsPassed;
    const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
        lessonsCompleted,
        totalLessons: lessonIds.length,
        examsPassed,
        totalExams: examIds.length,
        overallPercentage,
    };
}
