import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/LongCourse';
import '@/lib/db/models/Teacher';
import '@/lib/db/models/ProgramSemester';
import Link from 'next/link';
import Image from 'next/image';
import { seoUrl, SITE_NAME } from '@/lib/seo';
import { EnrollButton } from '@/components/programs/EnrollButton';
import { auth } from '@/lib/auth/auth.config';
import Student from '@/lib/db/models/Student';
import {
    GraduationCap,
    Clock,
    Tag,
    Users,
    CheckCircle,
    Calendar,
    ArrowLeft,
    Star
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await connectDB();

    // Check if slug looks like a MongoDB ObjectId (24 hex chars)
    const isValidObjectId = /^[a-f\d]{24}$/i.test(slug);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { status: 'published' };
    if (isValidObjectId) {
        query.$or = [{ slug }, { _id: slug }];
    } else {
        query.slug = slug;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program: any = await Program.findOne(query).lean();

    if (!program) {
        return { title: 'প্রোগ্রাম পাওয়া যায়নি' };
    }

    const description = typeof program.descriptionBn === 'string'
        ? program.descriptionBn.substring(0, 160).replace(/[{}"]/g, '')
        : '';

    return {
        title: program.titleBn,
        description,
        openGraph: {
            title: `${program.titleBn} | ${SITE_NAME}`,
            description,
            url: seoUrl(`/programs/${program.slug}`),
            type: 'website',
            ...(program.thumbnail ? { images: [{ url: program.thumbnail, width: 1200, height: 630, alt: program.titleBn }] } : {}),
        },
        alternates: {
            canonical: seoUrl(`/programs/${program.slug}`),
        },
    };
}

export default async function ProgramDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    await connectDB();

    // Find by slug or ID
    // Check if slug looks like a MongoDB ObjectId (24 hex chars)
    const isValidObjectId = /^[a-f\d]{24}$/i.test(slug);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { status: 'published' };
    if (isValidObjectId) {
        query.$or = [{ slug }, { _id: slug }];
    } else {
        query.slug = slug;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program: any = await Program.findOne(query)
        .populate('semesters', 'number titleBn level')
        .populate('maleInstructors', 'name image')
        .populate('femaleInstructors', 'name image')
        .lean();

    if (!program) {
        notFound();
    }

    // Check if current user is enrolled (using Student model for consistency)
    let isEnrolled = false;
    const session = await auth();
    if (session?.user?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const student: any = await Student.findById(session.user.id)
            .select('enrolledPrograms')
            .lean();
        isEnrolled = student?.enrolledPrograms?.some(
            (e: { program: { toString: () => string } }) => e.program?.toString() === program._id.toString()
        ) || false;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-12">
                <div className="container mx-auto px-4">
                    <Link
                        href="/courses"
                        className="inline-flex items-center text-purple-200 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        সকল কোর্স
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {program.isFeatured && (
                                    <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-white" />
                                        ফিচার্ড
                                    </span>
                                )}
                                {program.isPopular && (
                                    <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">
                                        জনপ্রিয়
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{program.titleBn}</h1>


                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                                    <Clock className="h-5 w-5" />
                                    {program.durationMonths} মাস
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                                    <GraduationCap className="h-5 w-5" />
                                    {program.totalSemesters} সেমিস্টার
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                                    <Tag className="h-5 w-5" />
                                    {program.isFree ? 'বিনামূল্যে' : `৳${program.discountPrice || program.price}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {program.descriptionBn && (
                            <div className="bg-card rounded-xl border p-6">
                                <h2 className="text-xl font-semibold mb-4">প্রোগ্রাম বিবরণ</h2>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    {/* Check if it's Lexical JSON or plain text */}
                                    {program.descriptionBn.startsWith('{') ? (
                                        <div dangerouslySetInnerHTML={{
                                            __html: JSON.parse(program.descriptionBn)?.root?.children
                                                ?.map((node: { children?: { text?: string }[] }) =>
                                                    node.children?.map((child: { text?: string }) => child.text || '').join('')
                                                ).join('<br/>') || program.descriptionBn
                                        }} />
                                    ) : (
                                        <p className="text-muted-foreground whitespace-pre-wrap">{program.descriptionBn}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {program.features?.length > 0 && (
                            <div className="bg-card rounded-xl border p-6">
                                <h2 className="text-xl font-semibold mb-4">এই প্রোগ্রামে আপনি পাবেন</h2>
                                <ul className="space-y-3">
                                    {program.features.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Instructors */}
                        <div className="bg-card rounded-xl border p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                শিক্ষকমণ্ডলী
                            </h2>

                            {/* Male Instructors */}
                            {program.maleInstructors?.length > 0 && (
                                <div className="mb-6">
                                    <div className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                                        পুরুষ শিক্ষার্থীদের জন্য শিক্ষক
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {program.maleInstructors.map((teacher: { _id: string; name: string; image?: string }) => (
                                            <div key={teacher._id} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {teacher.name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium">{teacher.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Female Instructors */}
                            {program.femaleInstructors?.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-pink-500" />
                                        মহিলা শিক্ষার্থীদের জন্য শিক্ষিকা
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {program.femaleInstructors.map((teacher: { _id: string; name: string; image?: string }) => (
                                            <div key={teacher._id} className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                                                    {teacher.name?.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium">{teacher.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!program.maleInstructors?.length && !program.femaleInstructors?.length) && (
                                <p className="text-muted-foreground">শিক্ষক তথ্য শীঘ্রই যোগ করা হবে</p>
                            )}
                        </div>

                        {/* Semesters */}
                        {program.semesters?.length > 0 && (
                            <div className="bg-card rounded-xl border p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    সেমিস্টার ওভারভিউ
                                </h2>
                                <div className="space-y-3">
                                    {program.semesters.map((semester: { _id: string; number: number; titleBn: string; level: string }, index: number) => (
                                        <div
                                            key={semester._id}
                                            className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                                        >
                                            <span className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium">{semester.titleBn}</p>
                                                <p className="text-sm text-muted-foreground">{semester.level}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Enrollment Card */}
                        <div className="bg-card rounded-xl border p-6 sticky top-4 space-y-6">
                            {/* Thumbnail */}
                            <div className="w-full">
                                <div className="aspect-video rounded-xl overflow-hidden bg-purple-500/30 relative" suppressHydrationWarning>
                                    {program.thumbnail ? (
                                        <Image
                                            src={program.thumbnail}
                                            width={500}
                                            height={500}
                                            alt={program.titleBn}
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <GraduationCap className="h-20 w-20 text-white/30" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                {program.isFree ? (
                                    <div className="text-3xl font-bold text-green-600 mb-2">বিনামূল্যে</div>
                                ) : (
                                    <div>
                                        {program.discountPrice && (
                                            <span className="text-lg line-through text-muted-foreground mr-2">
                                                ৳{program.price}
                                            </span>
                                        )}
                                        <span className="text-3xl font-bold text-primary">
                                            ৳{program.discountPrice || program.price}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <EnrollButton
                                programId={program._id.toString()}
                                programSlug={program.slug}
                                programTitle={program.titleBn}
                                isEnrolled={isEnrolled}
                            />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">মেয়াদ</span>
                                    <span className="font-medium">{program.durationMonths} মাস</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">সেমিস্টার</span>
                                    <span className="font-medium">{program.totalSemesters}টি</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">শিক্ষক</span>
                                    <span className="font-medium">
                                        {(program.maleInstructors?.length || 0) + (program.femaleInstructors?.length || 0)} জন
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
