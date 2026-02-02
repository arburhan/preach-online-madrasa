import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/courses/[id]/enroll - Enroll in a course
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

        const course = await Course.findById(courseId);

        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if course is published
        if (course.status !== 'published') {
            return NextResponse.json(
                { error: 'এই কোর্সটি এখনো প্রকাশিত হয়নি' },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const userData = await Student.findById(user.id);

        // Support both old format (ObjectId) and new format ({course, lastWatchedLesson, enrolledAt})
        const alreadyEnrolled = userData?.enrolledCourses?.some(
            (e) => {
                // Old format: e is just an ObjectId
                if ((e as unknown as { toString: () => string })?.toString && !(e as { course?: unknown }).course) {
                    return (e as unknown as { toString: () => string }).toString() === courseId;
                }
                // New format: e has course property
                return (e as { course: { toString: () => string } })?.course?.toString() === courseId;
            }
        );

        if (alreadyEnrolled) {
            return NextResponse.json(
                { error: 'আপনি ইতিমধ্যে এই কোর্সে নথিভুক্ত আছেন' },
                { status: 400 }
            );
        }

        // For paid courses, check payment (will implement later with SSL Commerz)
        if (!course.isFree) {
            // TODO: Check if payment is completed
            // For now, we'll allow free enrollment for testing
            return NextResponse.json(
                {
                    error: 'পেমেন্ট সিস্টেম এখনো সক্রিয় নয়। শীঘ্রই আসছে।',
                    requiresPayment: true,
                    coursePrice: course.price,
                },
                { status: 402 }
            );
        }

        // Enroll user in the course
        await Student.findByIdAndUpdate(user.id, {
            $push: {
                enrolledCourses: {
                    course: courseId,
                    enrolledAt: new Date(),
                },
            },
        });

        // Update course enrolled count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { enrolledCount: 1 },
        });

        return NextResponse.json({
            message: 'কোর্সে নথিভুক্তি সফল হয়েছে',
            enrolled: true,
        });
    } catch (error) {
        console.error('Enroll course error:', error);
        return NextResponse.json(
            { error: 'কোর্সে নথিভুক্ত হতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE /api/courses/[id]/enroll - Unenroll from a course
export async function DELETE(
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

        const course = await Course.findById(courseId);

        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if enrolled
        const userData = await Student.findById(user.id);

        // Support both old format (ObjectId) and new format ({course, lastWatchedLesson, enrolledAt})
        const isEnrolled = userData?.enrolledCourses?.some(
            (e) => {
                // Old format: e is just an ObjectId
                if ((e as unknown as { toString: () => string })?.toString && !(e as { course?: unknown }).course) {
                    return (e as unknown as { toString: () => string }).toString() === courseId;
                }
                // New format: e has course property
                return (e as { course: { toString: () => string } })?.course?.toString() === courseId;
            }
        );

        if (!isEnrolled) {
            return NextResponse.json(
                { error: 'আপনি এই কোর্সে নথিভুক্ত নন' },
                { status: 400 }
            );
        }

        // Unenroll user from the course
        await Student.findByIdAndUpdate(user.id, {
            $pull: { enrolledCourses: { course: courseId } },
        });

        // Update course enrolled count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { enrolledCount: -1 },
        });

        return NextResponse.json({
            message: 'কোর্স থেকে বাদ দেওয়া হয়েছে',
        });
    } catch (error) {
        console.error('Unenroll course error:', error);
        return NextResponse.json(
            { error: 'কোর্স থেকে বাদ দিতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

