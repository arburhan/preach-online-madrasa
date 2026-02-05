import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Category } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/rbac';

// PUT - Update category
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { id } = await params;
        const { nameBn, nameEn, description, order, isActive } = await request.json();

        await connectDB();

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json(
                { error: 'ক্যাটাগরি পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if nameEn is being changed and already exists
        if (nameEn && nameEn.toLowerCase().trim() !== category.nameEn) {
            const existingCategory = await Category.findOne({
                nameEn: nameEn.toLowerCase().trim(),
                _id: { $ne: id }
            });
            if (existingCategory) {
                return NextResponse.json(
                    { error: 'এই ইংরেজি নাম ইতিমধ্যে ব্যবহৃত হয়েছে' },
                    { status: 400 }
                );
            }
        }

        // Update fields
        if (nameBn) category.nameBn = nameBn.trim();
        if (nameEn) category.nameEn = nameEn.toLowerCase().trim();
        if (description !== undefined) category.description = description.trim();
        if (order !== undefined) category.order = order;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        return NextResponse.json({
            message: 'ক্যাটাগরি সফলভাবে আপডেট হয়েছে',
            category,
        });
    } catch (error) {
        console.error('Category PUT error:', error);
        return NextResponse.json(
            { error: 'ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Delete category
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { id } = await params;

        await connectDB();

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return NextResponse.json(
                { error: 'ক্যাটাগরি পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে',
        });
    } catch (error) {
        console.error('Category DELETE error:', error);
        return NextResponse.json(
            { error: 'ক্যাটাগরি মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
