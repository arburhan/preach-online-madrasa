import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import { ICourse } from '@/lib/db/models/Course';
import Student from '@/lib/db/models/Student';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
});

// POST /api/video/signed-url - Generate signed URL for video access
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { lessonId } = body;

        if (!lessonId) {
            return NextResponse.json(
                { error: 'পাঠ ID আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        const lesson = await Lesson.findById(lessonId).populate('course');

        if (!lesson) {
            return NextResponse.json(
                { error: 'পাঠ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        const course = lesson.course as unknown as ICourse;

        // Check if lesson is free or user is enrolled
        if (!lesson.isFree) {
            // Check if user is enrolled in the course
            const enrolledUser = await Student.findOne({
                _id: user.id,
                'enrolledCourses.course': course._id,
            });

            // Allow if user is instructor, admin, or enrolled
            const hasAccess =
                enrolledUser ||
                course.instructors.some((inst) => inst.toString() === user.id) ||
                user.role === 'admin';

            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'এই পাঠে আপনার প্রবেশাধিকার নেই। দয়া করে কোর্সে নথিভুক্ত হন।' },
                    { status: 403 }
                );
            }
        }

        // Generate signed URL (valid for 1 hour)
        const command = new GetObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
            Key: lesson.videoKey,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
        });

        return NextResponse.json({
            signedUrl,
            expiresIn: 3600,
        });
    } catch (error) {
        console.error('Generate signed URL error:', error);
        return NextResponse.json(
            { error: 'ভিডিও URL তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
