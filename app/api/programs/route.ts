import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/LongCourse';
import { auth } from '@/lib/auth/auth.config';

// GET - Get all programs (public gets published, admin gets all)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const session = await auth();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        // Non-admin users only see published programs
        if (!session?.user || session.user.role !== 'admin') {
            query.status = 'published';
        } else if (status) {
            query.status = status;
        }

        const programs = await Program.find(query)
            .populate('semesters', 'number titleBn level')
            .populate('createdBy', 'name')
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return NextResponse.json(programs);
    } catch (error) {
        console.error('Get programs error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new program (admin only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            thumbnail,
            bannerImage,
            durationMonths,
            totalSemesters,
            semesters,
            price,
            discountPrice,
            isFree,
            enrollmentStartDate,
            enrollmentEndDate,
            maxStudents,
            features,
            requirements,
            targetAudience,
            maleInstructors,
            femaleInstructors,
            status = 'draft',
            isPopular,
            isFeatured,
        } = body;

        // Validation
        if (!titleBn || !titleEn || !descriptionBn) {
            return NextResponse.json(
                { error: 'বাংলা ও ইংরেজি শিরোনাম এবং বিবরণ আবশ্যক' },
                { status: 400 }
            );
        }

        // Generate slug from English title
        const slugBase = titleEn
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .substring(0, 50);
        const slug = slugBase + '-' + Date.now().toString(36);

        const program = await Program.create({
            titleBn,
            titleEn,
            slug,
            descriptionBn,
            descriptionEn,
            thumbnail,
            bannerImage,
            durationMonths: durationMonths || 24,
            totalSemesters: totalSemesters || 8,
            semesters: semesters || [],
            price: price || 0,
            discountPrice,
            isFree: isFree || false,
            enrollmentStartDate: enrollmentStartDate ? new Date(enrollmentStartDate) : undefined,
            enrollmentEndDate: enrollmentEndDate ? new Date(enrollmentEndDate) : undefined,
            maxStudents,
            features: features || [],
            requirements: requirements || [],
            targetAudience: targetAudience || [],
            maleInstructors: maleInstructors || [],
            femaleInstructors: femaleInstructors || [],
            status,
            isPopular: isPopular || false,
            isFeatured: isFeatured || false,
            createdBy: session.user.id,
        });

        return NextResponse.json(program, { status: 201 });
    } catch (error) {
        console.error('Create program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
