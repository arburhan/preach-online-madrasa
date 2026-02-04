import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Category } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/rbac';

// GET - List all categories
export async function GET() {
    try {
        await connectDB();

        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, nameBn: 1 })
            .lean();

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Categories GET error:', error);
        return NextResponse.json(
            { error: 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create new category (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { nameBn, nameEn, description, order } = await request.json();

        // Validation
        if (!nameBn?.trim()) {
            return NextResponse.json(
                { error: 'বাংলা নাম আবশ্যক' },
                { status: 400 }
            );
        }

        if (!nameEn?.trim()) {
            return NextResponse.json(
                { error: 'ইংরেজি নাম আবশ্যক (slug হিসেবে ব্যবহৃত হবে)' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if nameEn already exists
        const existingCategory = await Category.findOne({
            nameEn: nameEn.toLowerCase().trim()
        });
        if (existingCategory) {
            return NextResponse.json(
                { error: 'এই ইংরেজি নাম ইতিমধ্যে ব্যবহৃত হয়েছে' },
                { status: 400 }
            );
        }

        const category = await Category.create({
            nameBn: nameBn.trim(),
            nameEn: nameEn.toLowerCase().trim(),
            description: description?.trim() || '',
            order: order || 0,
            isActive: true,
        });

        return NextResponse.json({
            message: 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে',
            category,
        });
    } catch (error) {
        console.error('Category POST error:', error);
        return NextResponse.json(
            { error: 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
