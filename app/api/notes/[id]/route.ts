import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Note from '@/lib/db/models/Note';
import { getCurrentUser } from '@/lib/auth/rbac';

// PUT /api/notes/[id] - Update note
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        await connectDB();

        const note = await Note.findById(id);

        if (!note) {
            return NextResponse.json(
                { error: 'নোট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user owns this note
        if (note.user.toString() !== user.id) {
            return NextResponse.json(
                { error: 'আপনার এই নোট সম্পাদনার অনুমতি নেই' },
                { status: 403 }
            );
        }

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { $set: { content: body.content } },
            { new: true }
        );

        return NextResponse.json({
            message: 'নোট আপডেট হয়েছে',
            note: updatedNote,
        });
    } catch (error) {
        console.error('Update note error:', error);
        return NextResponse.json(
            { error: 'নোট আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const note = await Note.findById(id);

        if (!note) {
            return NextResponse.json(
                { error: 'নোট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user owns this note
        if (note.user.toString() !== user.id) {
            return NextResponse.json(
                { error: 'আপনার এই নোট মুছার অনুমতি নেই' },
                { status: 403 }
            );
        }

        await Note.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'নোট মুছে ফেলা হয়েছে',
        });
    } catch (error) {
        console.error('Delete note error:', error);
        return NextResponse.json(
            { error: 'নোট মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
