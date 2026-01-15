import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import StudentSemester from '@/lib/db/models/StudentSemester';
import Semester from '@/lib/db/models/Semester';
import { auth } from '@/lib/auth/auth.config';

// GET - Get student's semester enrollments
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
        const semesterId = searchParams.get('semesterId');

        if (semesterId) {
            // Get specific semester enrollment
            const enrollment = await StudentSemester.findOne({
                student: session.user.id,
                semester: semesterId,
            })
                .populate('semester')
                .populate('subjectProgress.subject')
                .lean();

            return NextResponse.json(enrollment);
        }

        // Get all enrollments
        const enrollments = await StudentSemester.find({
            student: session.user.id,
        })
            .populate('semester')
            .sort({ 'semester.number': 1 })
            .lean();

        return NextResponse.json(enrollments);
    } catch (error) {
        console.error('Get student semesters error:', error);
        return NextResponse.json(
            { error: 'ডাটা লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Enroll student in a semester
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { semesterId } = await request.json();

        if (!semesterId) {
            return NextResponse.json(
                { error: 'সেমিস্টার আইডি প্রয়োজন' },
                { status: 400 }
            );
        }

        // Check if semester exists
        const semester = await Semester.findById(semesterId).populate('subjects');
        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await StudentSemester.findOne({
            student: session.user.id,
            semester: semesterId,
        });

        if (existingEnrollment) {
            return NextResponse.json(
                { error: 'আপনি ইতিমধ্যে এই সেমিস্টারে নথিভুক্ত' },
                { status: 400 }
            );
        }

        // Create enrollment with subject progress
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subjectProgress = semester.subjects.map((subject: any) => ({
            subject: subject._id,
            completedLessons: 0,
            totalLessons: subject.totalLessons || 0,
            percentage: 0,
        }));

        const enrollment = await StudentSemester.create({
            student: session.user.id,
            semester: semesterId,
            status: 'enrolled',
            subjectProgress,
        });

        return NextResponse.json(enrollment, { status: 201 });
    } catch (error) {
        console.error('Enroll semester error:', error);
        return NextResponse.json(
            { error: 'নথিভুক্ত করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
