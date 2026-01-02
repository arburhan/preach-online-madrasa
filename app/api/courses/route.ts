import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course, { CourseStatus } from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// GET /api/courses - List all published courses
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const level = searchParams.get('level');
        const isFree = searchParams.get('isFree');

        // Build query
        interface CourseQuery {
            status: CourseStatus;
            $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
            level?: string;
            isFree?: boolean;
        }

        const query: CourseQuery = { status: CourseStatus.PUBLISHED };

        if (search) {
            query.$or = [
                { titleBn: { $regex: search, $options: 'i' } },
                { titleEn: { $regex: search, $options: 'i' } },
                { descriptionBn: { $regex: search, $options: 'i' } },
            ];
        }

        if (level) {
            query.level = level;
        }

        if (isFree !== null && isFree !== undefined) {
            query.isFree = isFree === 'true';
        }

        const skip = (page - 1) * limit;

        const [courses, total] = await Promise.all([
            Course.find(query)
                .populate('instructor', 'name image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Course.countDocuments(query),
        ]);

        return NextResponse.json({
            courses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get courses error:', error);
        return NextResponse.json(
            { error: 'কোর্স লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST /api/courses - Create new course (teacher/admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !['teacher', 'admin'].includes(user.role)) {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            price,
            level,
            language,
            whatYouWillLearn,
            requirements,
            thumbnail,
            previewVideo,
        } = body;

        if (!titleBn || !descriptionBn) {
            return NextResponse.json(
                { error: 'কোর্সের শিরোনাম এবং বর্ণনা আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        const course = await Course.create({
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            instructor: user.id,
            price: price || 0,
            level,
            language: language || 'bn',
            whatYouWillLearn: whatYouWillLearn || [],
            requirements: requirements || [],
            thumbnail,
            previewVideo,
            status: CourseStatus.DRAFT,
        });

        return NextResponse.json(
            {
                message: 'কোর্স তৈরি হয়েছে',
                course,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create course error:', error);
        return NextResponse.json(
            { error: 'কোর্স তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
