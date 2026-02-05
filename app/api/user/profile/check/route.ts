import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { requireAuth } from '@/lib/auth/rbac';

// GET /api/user/profile/check - Check if profile is complete for enrollment
export async function GET() {
    try {
        const user = await requireAuth();

        // Only students need profile completeness check
        if (user.role !== 'student') {
            return NextResponse.json({
                isComplete: true,
                missingFields: []
            });
        }

        await connectDB();

        const student = await Student.findById(user.id)
            .select('gender phone')
            .lean();

        if (!student) {
            return NextResponse.json(
                { error: 'শিক্ষার্থী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        const missingFields: string[] = [];

        if (!student.gender) {
            missingFields.push('gender');
        }

        if (!student.phone || student.phone.trim() === '') {
            missingFields.push('phone');
        }

        return NextResponse.json({
            isComplete: missingFields.length === 0,
            missingFields
        });

    } catch (error) {
        console.error('Profile check error:', error);
        return NextResponse.json(
            { error: 'প্রোফাইল চেক করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
