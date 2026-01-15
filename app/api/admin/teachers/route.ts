import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Teacher from '@/lib/db/models/Teacher';

// GET /api/admin/teachers - Get teachers by status
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        await connectDB();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (status === 'approved') {
            query.isApproved = true;
        } else if (status === 'pending') {
            query.isApproved = false;
        }

        const teachers = await Teacher.find(query)
            .select('_id name email gender qualifications mobileNumber isApproved createdAt')
            .sort({ createdAt: -1 })
            .lean();

        // Serialize results
        const serializedTeachers = teachers.map((teacher) => ({
            _id: teacher._id.toString(),
            name: teacher.name,
            email: teacher.email,
            gender: teacher.gender,
            qualifications: teacher.qualifications,
            mobileNumber: teacher.mobileNumber,
            isApproved: teacher.isApproved,
            createdAt: teacher.createdAt,
        }));

        return NextResponse.json(serializedTeachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        return NextResponse.json(
            { error: 'শিক্ষক লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
