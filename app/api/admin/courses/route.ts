import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import { requireAuth } from '@/lib/auth/rbac';

// POST /api/admin/courses - Create new course
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'শুধুমাত্র অ্যাডমিন কোর্স তৈরি করতে পারবেন' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            courseDuration,
            price,
            isFree,
            level,
            instructors,
            thumbnail,
            publishImmediately,
        } = body;

        // Validation
        if (!titleBn || !descriptionBn) {
            return NextResponse.json(
                { error: 'শিরোনাম এবং বিবরণ আবশ্যক' },
                { status: 400 }
            );
        }

        if (!instructors || instructors.length === 0) {
            return NextResponse.json(
                { error: 'অন্তত একজন শিক্ষক নিয়োগ করুন' },
                { status: 400 }
            );
        }

        if (!thumbnail) {
            return NextResponse.json(
                { error: 'থাম্বনেইল আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        // Create course
        const course = await Course.create({
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            courseDuration,
            price: isFree ? 0 : price,
            isFree,
            level,
            instructors,
            thumbnail,
            createdBy: user.id,
            status: publishImmediately ? 'published' : 'draft',
            publishedAt: publishImmediately ? new Date() : undefined,
        });

        return NextResponse.json({
            message: 'কোর্স সফলভাবে তৈরি হয়েছে',
            course: {
                _id: course._id.toString(),
                titleBn: course.titleBn,
            },
        });
    } catch (error) {
        console.error('Course creation error:', error);
        return NextResponse.json(
            { error: 'কোর্স তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
