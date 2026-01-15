import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';
import Subject from '@/lib/db/models/Subject';
import StudentSemester from '@/lib/db/models/StudentSemester';
import User from '@/lib/db/models/User';
import Lesson from '@/lib/db/models/Lesson';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    BookOpen,
    Video,
    ExternalLink,
    Play,
} from 'lucide-react';

// Level colors
const levelConfig = {
    basic: { gradient: 'from-green-500 to-emerald-600', label: 'বেসিক' },
    expert: { gradient: 'from-blue-500 to-indigo-600', label: 'এক্সপার্ট' },
    masters: { gradient: 'from-purple-500 to-violet-600', label: 'মাস্টার্স' },
    alim: { gradient: 'from-red-500 to-rose-600', label: 'আলিম' },
};

export default async function StudentSemesterDetailPage({
    params,
}: {
    params: Promise<{ semesterId: string }>;
}) {
    const user = await requireAuth();

    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    const { semesterId } = await params;
    await connectDB();

    // Get user with gender
    const userData = await User.findById(user.id).select('gender').lean();
    const userGender = userData?.gender;

    // Get semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const semester: any = await Semester.findById(semesterId).lean();

    if (!semester) {
        notFound();
    }

    // Get subjects for this semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjects: any[] = await Subject.find({ semester: semesterId })
        .populate('maleInstructors', 'name image')
        .populate('femaleInstructors', 'name image')
        .sort({ order: 1 })
        .lean();

    // Get student's enrollment and progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollment: any = await StudentSemester.findOne({
        student: user.id,
        semester: semesterId,
    }).lean();

    // Get lesson counts for each subject based on gender
    const subjectsWithLessons = await Promise.all(
        subjects.map(async (subject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const query: any = { subject: subject._id };

            // Male students only see male instructor lessons
            if (userGender === 'male') {
                query.instructorGender = 'male';
            }

            const lessons = await Lesson.find(query)
                .select('titleBn order instructorGender')
                .sort({ order: 1 })
                .lean();

            // Get progress for this subject
            const subjectProgress = enrollment?.subjectProgress?.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (sp: any) => sp.subject?.toString() === subject._id.toString()
            );

            return {
                ...subject,
                lessons,
                lessonCount: lessons.length,
                progress: subjectProgress?.percentage || 0,
                completedLessons: subjectProgress?.completedLessons || 0,
            };
        })
    );

    const config = levelConfig[semester.level as keyof typeof levelConfig];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className={`border-b bg-linear-to-r ${config?.gradient || 'from-gray-500 to-gray-600'} text-white`}>
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/student/semesters"
                        className="inline-flex items-center text-white/80 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        সেমিস্টার তালিকা
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm opacity-80">{config?.label}</p>
                            <h1 className="text-3xl font-bold">{semester.titleBn}</h1>
                            <p className="text-white/80 mt-1">{semester.descriptionBn}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-80">মোট বিষয়</p>
                            <p className="text-3xl font-bold">{subjects.length}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjectsWithLessons.map((subject, index) => {
                        // Get appropriate live link based on gender
                        const liveLink = userGender === 'male'
                            ? subject.liveClassLinks?.male
                            : subject.liveClassLinks?.female;

                        return (
                            <div
                                key={subject._id.toString()}
                                className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Subject Header */}
                                <div className={`p-4 ${subject.type === 'islamic'
                                    ? 'bg-emerald-50 border-b border-emerald-100'
                                    : 'bg-amber-50 border-b border-amber-100'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${subject.type === 'islamic'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {subject.type === 'islamic' ? 'ইসলামিক' : 'স্কিল'}
                                            </span>
                                            <h3 className="font-bold text-lg mt-2">{subject.titleBn}</h3>
                                        </div>
                                        <span className="text-2xl font-bold text-muted-foreground">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {subject.descriptionBn}
                                    </p>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-1">
                                                <Video className="h-4 w-4" />
                                                {subject.completedLessons}/{subject.lessonCount} লেসন
                                            </span>
                                            <span>{Math.round(subject.progress)}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${subject.type === 'islamic'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-amber-500'
                                                    }`}
                                                style={{ width: `${subject.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Instructors */}
                                    <div className="text-sm text-muted-foreground mb-4">
                                        {userGender === 'male' ? (
                                            <span>শিক্ষক: {subject.maleInstructors?.length || 0} জন</span>
                                        ) : (
                                            <span>
                                                শিক্ষক: {subject.maleInstructors?.length || 0} জন (পুরুষ),
                                                {subject.femaleInstructors?.length || 0} জন (মহিলা)
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/student/semester/${semesterId}/subject/${subject._id}`}
                                            className="flex-1"
                                        >
                                            <Button className="w-full" size="sm">
                                                <Play className="h-4 w-4 mr-2" />
                                                ক্লাস দেখুন
                                            </Button>
                                        </Link>

                                        {liveLink && (
                                            <a
                                                href={liveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {subjects.length === 0 && (
                    <div className="bg-card rounded-xl border p-12 text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">এখনো কোনো বিষয় নেই</h3>
                        <p className="text-muted-foreground">
                            এই সেমিস্টারে শীঘ্রই বিষয় যোগ করা হবে
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
