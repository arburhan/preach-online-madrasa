import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { requireAuth } from '@/lib/auth/rbac';

// GET /api/admin/gender-requests - Get all gender change requests
export async function GET() {
    try {
        const user = await requireAuth();

        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অ্যাক্সেস অস্বীকৃত' },
                { status: 403 }
            );
        }

        await connectDB();

        const students = await Student.find({
            'genderChangeRequest.status': { $exists: true }
        })
            .select('name email gender genderChangeRequest image')
            .sort({ 'genderChangeRequest.requestedAt': -1 })
            .lean();

        return NextResponse.json({ requests: students });

    } catch (error) {
        console.error('Get gender requests error:', error);
        return NextResponse.json(
            { error: 'তথ্য লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/gender-requests - Approve or reject a request
export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth();

        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অ্যাক্সেস অস্বীকৃত' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { studentId, action } = body;

        if (!studentId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'অবৈধ অনুরোধ' },
                { status: 400 }
            );
        }

        await connectDB();

        const student = await Student.findById(studentId);

        if (!student) {
            return NextResponse.json(
                { error: 'শিক্ষার্থী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        if (!student.genderChangeRequest || student.genderChangeRequest.status !== 'pending') {
            return NextResponse.json(
                { error: 'কোনো পেন্ডিং অনুরোধ নেই' },
                { status: 400 }
            );
        }

        if (action === 'approve') {
            student.genderChangeRequest.status = 'approved';
        } else {
            student.genderChangeRequest.status = 'rejected';
        }

        await student.save();

        return NextResponse.json({
            message: action === 'approve'
                ? 'অনুরোধ অনুমোদন করা হয়েছে'
                : 'অনুরোধ প্রত্যাখ্যান করা হয়েছে',
            status: student.genderChangeRequest.status
        });

    } catch (error) {
        console.error('Update gender request error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
