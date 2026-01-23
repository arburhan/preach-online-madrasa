import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Section from '@/lib/db/models/Section';
import { requireAuth } from '@/lib/auth/rbac';

// PUT /api/admin/sections/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { titleBn, titleEn, order } = body;

        const section = await Section.findByIdAndUpdate(
            id,
            { titleBn, titleEn, order },
            { new: true, runValidators: true }
        );

        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ section });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update section' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/sections/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        await connectDB();

        const { id } = await params;

        const section = await Section.findByIdAndDelete(id);

        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // TODO: Also delete associated lessons

        return NextResponse.json({ message: 'Section deleted' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to delete section' },
            { status: 500 }
        );
    }
}
