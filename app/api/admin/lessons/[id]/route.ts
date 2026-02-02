import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import { requireAuth } from '@/lib/auth/rbac';

// PUT /api/admin/lessons/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        await connectDB();

        const { id } = await params;
        const body = await req.json();

        const lesson = await Lesson.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!lesson) {
            return NextResponse.json(
                { error: 'Lesson not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ lesson });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update lesson' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/lessons/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        await connectDB();

        const { id } = await params;

        const lesson = await Lesson.findByIdAndDelete(id);

        if (!lesson) {
            return NextResponse.json(
                { error: 'Lesson not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Lesson deleted' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to delete lesson' },
            { status: 500 }
        );
    }
}
