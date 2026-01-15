import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';
import { auth } from '@/lib/auth/auth.config';

// GET - Get single semester
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const semester = await Semester.findById(id)
            .populate({
                path: 'subjects',
                populate: [
                    { path: 'maleInstructors', select: 'name image gender' },
                    { path: 'femaleInstructors', select: 'name image gender' },
                ]
            })
            .lean();

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(semester);
    } catch (error) {
        console.error('Get semester error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT - Update semester
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const body = await request.json();

        const semester = await Semester.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(semester);
    } catch (error) {
        console.error('Update semester error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Delete semester
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const semester = await Semester.findByIdAndDelete(id);

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'সেমিস্টার মুছে ফেলা হয়েছে' });
    } catch (error) {
        console.error('Delete semester error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
