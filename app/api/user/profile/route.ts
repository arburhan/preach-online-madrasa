import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { requireAuth } from '@/lib/auth/rbac';

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { name, phone, address, bio } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'নাম আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {
                name: name.trim(),
                phone: phone?.trim() || '',
                address: address?.trim() || '',
                bio: bio?.trim() || ''
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'ব্যবহারকারী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                bio: updatedUser.bio
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// GET /api/user/profile - Get current user profile
export async function GET() {
    try {
        const user = await requireAuth();

        await connectDB();

        const userProfile = await User.findById(user.id)
            .select('-password')
            .lean();

        if (!userProfile) {
            return NextResponse.json(
                { error: 'ব্যবহারকারী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user: userProfile });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'প্রোফাইল লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
