import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/lib/db/models/Subject';
import Student from '@/lib/db/models/Student';
import { auth } from '@/lib/auth/auth.config';

// GET - Get live class link for a subject based on student gender
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
        const user = await Student.findById(session.user.id).select('gender');
        const userGender = user?.gender;

        // Get subject with live class links
        const subject = await Subject.findById(subjectId)
            .select('titleBn liveClassLinks')
            .lean();

        if (!subject) {
            return NextResponse.json(
                { error: 'বিষয় পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Return appropriate link based on student gender
        // Male students get male link, Female students get female link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subjectData = subject as any;
        const liveLink = userGender === 'male'
            ? subjectData.liveClassLinks?.male
            : subjectData.liveClassLinks?.female;

        return NextResponse.json({
            subjectTitle: subjectData.titleBn,
            liveLink: liveLink || null,
            userGender,
        });
    } catch (error) {
        console.error('Get live link error:', error);
        return NextResponse.json(
            { error: 'লাইভ লিঙ্ক লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
