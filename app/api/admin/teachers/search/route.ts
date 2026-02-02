import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Teacher from '@/lib/db/models/Teacher';
import { requireAuth } from '@/lib/auth/rbac';

// GET /api/admin/teachers/search - Search approved teachers
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'শুধুমাত্র অ্যাডমিন এই অ্যাকশন করতে পারবেন' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        await connectDB();

        // Search approved teachers by name or email
        const teachers = await Teacher.find({
            isApproved: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        })
            .select('_id name email gender')
            .limit(10)
            .lean();

        // Serialize results
        const serializedTeachers = teachers.map((teacher) => ({
            _id: teacher._id.toString(),
            name: teacher.name,
            email: teacher.email,
            gender: teacher.gender,
        }));

        return NextResponse.json({ teachers: serializedTeachers });
    } catch (error) {
        console.error('Teacher search error:', error);
        return NextResponse.json(
            { error: 'শিক্ষক খুঁজতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
