import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';
import Subject from '@/lib/db/models/Subject';
import LongCourse from '@/lib/db/models/LongCourse';
import Section from '@/lib/db/models/Section';
import Exam from '@/lib/db/models/Exam';
import SemesterContentManager from '@/components/admin/programs/SemesterContentManager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, MoreHorizontal, Layers, FileText, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function SemesterDetailPage({
    params,
}: {
    params: Promise<{ programId: string; semesterId: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    const { programId, semesterId } = await params;
    await connectDB();

    // Fetch semester and program separately to avoid stale schema populate errors in dev
    const semesterPromise = Semester.findById(semesterId).lean();
    const programPromise = LongCourse.findById(programId).select('titleBn').lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [semester, program]: [any, any] = await Promise.all([
        semesterPromise,
        programPromise
    ]);

    if (!semester) {
        notFound();
    }

    // ...

    const subjectsPromise = Subject.find({ semester: semesterId })
        .sort({ order: 1 })
        .lean();

    const sectionsPromise = Section.find({ semester: semesterId })
        .sort({ order: 1 })
        .populate({ path: 'lessons', options: { sort: { order: 1 } } })
        .lean();

    // Fetch exams for this semester
    const examsPromise = Exam.find({ semester: semesterId })
        .sort({ createdAt: -1 })
        .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subjects, sections, exams]: [any[], any[], any[]] = await Promise.all([
        subjectsPromise,
        sectionsPromise,
        examsPromise
    ]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/admin/programs" className="hover:text-foreground">প্রোগ্রাম</Link>
                        <span>/</span>
                        <Link href={`/admin/programs/${programId}`} className="hover:text-foreground">
                            {program?.titleBn || 'প্রোগ্রাম'}
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">{semester.titleBn}</span>
                    </div>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{semester.titleBn}</h1>
                                <Badge variant={semester.status === 'active' ? 'default' : 'secondary'}>
                                    {semester.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </Badge>
                                <Badge variant="outline">{semester.level}</Badge>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">
                                {semester.descriptionBn}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/admin/programs/${programId}/semesters/${semesterId}/exams/create`}>
                                <Button>
                                    <FileText className="mr-2 h-4 w-4" />
                                    পরীক্ষা নিন
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="subjects" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="subjects" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            বিষয়ভিত্তিক
                        </TabsTrigger>
                        <TabsTrigger value="content" className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            সরাসরি কন্টেন্ট
                        </TabsTrigger>
                        <TabsTrigger value="exams" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            পরীক্ষাসমূহ ({exams.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="subjects">
                        {/* Subjects Section */}
                        <div className="bg-card rounded-xl border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">বিষয়সমূহ (Subjects)</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        এই সেমিস্টারের অন্তর্ভুক্ত বিষয়সমূহ
                                    </p>
                                </div>
                                <Link href={`/admin/programs/${programId}/semesters/${semesterId}/subjects/create`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        বিষয় যুক্ত করুন
                                    </Button>
                                </Link>
                            </div>

                            {subjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {subjects.map((subject) => (
                                        <div key={subject._id.toString()} className="border rounded-lg p-4 hover:border-primary transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline">{subject.type === 'islamic' ? 'ইসলামিক' : 'স্কিল'}</Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>সম্পাদনা</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">ডিলিট</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-1">{subject.titleBn}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {subject.descriptionBn}
                                            </p>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>{subject.totalLessons} পাঠ</span>
                                                </div>
                                                {/* Add instructors count later */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-medium">কোনো বিষয় নেই</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                                        এখনো এই সেমিস্টারে কোনো বিষয় যুক্ত করা হয়নি
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="content">
                        <SemesterContentManager
                            programId={programId}
                            semesterId={semesterId}
                            sections={JSON.parse(JSON.stringify(sections))}
                        />
                    </TabsContent>

                    <TabsContent value="exams">
                        <div className="bg-card rounded-xl border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">পরীক্ষাসমূহ</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        এই সেমিস্টারের সকল পরীক্ষা
                                    </p>
                                </div>
                                <Link href={`/admin/programs/${programId}/semesters/${semesterId}/exams/create`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        নতুন পরীক্ষা
                                    </Button>
                                </Link>
                            </div>

                            {exams.length > 0 ? (
                                <div className="space-y-3">
                                    {exams.map((exam) => (
                                        <div
                                            key={exam._id.toString()}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{exam.titleBn}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                        <span>{exam.questions?.length || 0} প্রশ্ন</span>
                                                        <span>•</span>
                                                        <span>{exam.totalMarks} মার্কস</span>
                                                        <span>•</span>
                                                        <span>{exam.duration} মিনিট</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                                                    {exam.status === 'published' ? 'প্রকাশিত' : exam.status === 'completed' ? 'সম্পন্ন' : 'ড্রাফট'}
                                                </Badge>
                                                <Link href={`/admin/programs/${programId}/semesters/${semesterId}/exams/${exam._id.toString()}/edit`}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit2 className="h-4 w-4 mr-1" />
                                                        এডিট
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-medium">কোনো পরীক্ষা নেই</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                                        এখনো এই সেমিস্টারে কোনো পরীক্ষা যুক্ত করা হয়নি
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
