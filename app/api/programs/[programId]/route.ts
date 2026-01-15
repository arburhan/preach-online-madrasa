import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/Program';
import { auth } from '@/lib/auth/auth.config';

// GET - Get single program by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        await connectDB();

        const program = await Program.findById(programId)
            .populate('semesters')
            .populate('createdBy', 'name')
            .lean();

        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error('Get program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT - Update program (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId } = await params;
        await connectDB();

        const body = await request.json();

        const program = await Program.findByIdAndUpdate(
            programId,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error('Update program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Delete program (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId } = await params;
        await connectDB();

        const program = await Program.findByIdAndDelete(programId);

        if (!program) {
            return NextResponse.json(
                { error: 'প্রোগ্রাম পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'প্রোগ্রাম মুছে ফেলা হয়েছে' });
    } catch (error) {
        console.error('Delete program error:', error);
        return NextResponse.json(
            { error: 'প্রোগ্রাম মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
