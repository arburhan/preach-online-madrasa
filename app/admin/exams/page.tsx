import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Plus,
    Calendar,
    Clock,
    Users,
    BarChart3
} from 'lucide-react';

export default async function AdminExamsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    await connectDB();

    // Get all exams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exams: any[] = await Exam.find()
        .populate('semester', 'number titleBn level')
        .populate('subject', 'titleBn')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .lean();
    // Stats
    const draftExams = exams.filter(e => e.status === 'draft').length;
    const publishedExams = exams.filter(e => e.status === 'published').length;
    const completedExams = exams.filter(e => e.status === 'completed').length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                পরীক্ষা ম্যানেজমেন্ট
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                পরীক্ষা তৈরি, প্রকাশ এবং ফলাফল দেখুন
                            </p>
                        </div>
                        <Link href="/admin/exams/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                নতুন পরীক্ষা
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">মোট পরীক্ষা</p>
                                <p className="text-2xl font-bold">{exams.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-amber-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">ড্রাফট</p>
                                <p className="text-2xl font-bold">{draftExams}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">প্রকাশিত</p>
                                <p className="text-2xl font-bold">{publishedExams}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">সম্পন্ন</p>
                                <p className="text-2xl font-bold">{completedExams}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exams Table */}
                {exams.length === 0 ? (
                    <div className="bg-card rounded-xl border p-12 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">কোনো পরীক্ষা নেই</h3>
                        <p className="text-muted-foreground mb-6">
                            এখনো কোনো পরীক্ষা তৈরি করা হয়নি
                        </p>
                        <Link href="/admin/exams/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                প্রথম পরীক্ষা তৈরি করুন
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-4 font-medium">পরীক্ষা</th>
                                    <th className="text-left p-4 font-medium">সেমিস্টার</th>
                                    <th className="text-left p-4 font-medium">ধরন</th>
                                    <th className="text-left p-4 font-medium">মার্কস</th>
                                    <th className="text-left p-4 font-medium">সময়</th>
                                    <th className="text-left p-4 font-medium">স্ট্যাটাস</th>
                                    <th className="text-left p-4 font-medium">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam) => (
                                    <tr key={exam._id.toString()} className="border-t">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{exam.titleBn}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {exam.questions?.length || 0} প্রশ্ন
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {exam.semester?.titleBn || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${exam.type === 'mcq'
                                                ? 'bg-blue-100 text-blue-700'
                                                : exam.type === 'written'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {exam.type === 'mcq' ? 'MCQ' : exam.type === 'written' ? 'লিখিত' : 'মিশ্র'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {exam.totalMarks} ({exam.passMarks} পাস)
                                        </td>
                                        <td className="p-4">
                                            {exam.duration} মিনিট
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${exam.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : exam.status === 'completed'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {exam.status === 'published' ? 'প্রকাশিত' :
                                                    exam.status === 'completed' ? 'সম্পন্ন' : 'ড্রাফট'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/admin/exams/${exam._id}`}>
                                                <Button size="sm" variant="outline">
                                                    বিস্তারিত
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
