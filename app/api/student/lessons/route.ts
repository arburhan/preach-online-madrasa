import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import User from '@/lib/db/models/User';
import { auth } from '@/lib/auth/auth.config';

// GET - Get lessons for a subject with gender filtering
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const subjectId = searchParams.get('subjectId');

        if (!subjectId) {
            return NextResponse.json(
                { error: 'বিষয় আইডি প্রয়োজন' },
                { status: 400 }
            );
        }

        // Get user's gender
        const user = await User.findById(session.user.id).select('gender');
        const userGender = user?.gender;

        // Build query based on gender
        // Male students: only male instructor lessons
        // Female students: all lessons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { subject: subjectId };

        if (userGender === 'male') {
            query.instructorGender = 'male';
        }
        // Female students see all lessons (no filter)

        const lessons = await Lesson.find(query)
            .populate('instructor', 'name image gender')
            .sort({ order: 1 })
            .lean();

        return NextResponse.json({
            lessons,
            userGender,
            totalLessons: lessons.length,
        });
    } catch (error) {
        console.error('Get lessons error:', error);
        return NextResponse.json(
            { error: 'লেসন লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
