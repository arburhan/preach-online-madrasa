import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';
import Admin from '@/lib/db/models/Admin';
import { requireAuth } from '@/lib/auth/rbac';

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { name, phone, address, bio, gender, qualifications, subjects } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'নাম আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        let updatedUser;

        if (user.role === 'teacher') {
            updatedUser = await Teacher.findByIdAndUpdate(
                user.id,
                {
                    name: name.trim(),
                    phone: phone?.trim() || '',
                    address: address?.trim() || '',
                    bio: bio?.trim() || '',
                    qualifications: qualifications || [],
                    subjects: subjects || []
                },
                { new: true }
            );
        } else if (user.role === 'admin') {
            updatedUser = await Admin.findByIdAndUpdate(
                user.id,
                {
                    name: name.trim(),
                    // Admin schema does not support phone, address, bio
                },
                { new: true }
            );
        } else {
            // Default to Student
            // First, get current student to check gender status
            const currentStudent = await Student.findById(user.id).lean();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                name: name.trim(),
                phone: phone?.trim() || '',
                address: address?.trim() || '',
                bio: bio?.trim() || ''
            };

            // Gender update logic:
            // 1. If gender is not set yet, allow setting it
            // 2. If gender is set but genderChangeRequest.status is 'approved', allow changing
            // 3. Otherwise, ignore gender update
            if (gender && (gender === 'male' || gender === 'female')) {
                const currentGender = currentStudent?.gender;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const changeRequest = (currentStudent as any)?.genderChangeRequest;

                if (!currentGender) {
                    // No gender set yet - allow setting
                    updateData.gender = gender;
                } else if (changeRequest?.status === 'approved') {
                    // Change request approved - allow one-time change
                    updateData.gender = gender;
                    // Clear the change request after successful update
                    updateData.genderChangeRequest = null;
                }
                // If gender is already set and no approved request, ignore the gender update
            }

            updatedUser = await Student.findByIdAndUpdate(
                user.id,
                updateData,
                { new: true }
            );
        }

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'ব্যবহারকারী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userResponse: any = updatedUser.toObject ? updatedUser.toObject() : updatedUser;

        return NextResponse.json({
            message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
            user: {
                id: userResponse._id,
                name: userResponse.name,
                email: userResponse.email,
                phone: userResponse.phone || '',
                address: userResponse.address || '',
                bio: userResponse.bio || '',
                gender: userResponse.gender || null
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

        let userProfile;

        if (user.role === 'teacher') {
            userProfile = await Teacher.findById(user.id).select('-password').lean();
        } else if (user.role === 'admin') {
            userProfile = await Admin.findById(user.id).select('-password').lean();
        } else {
            // Default to Student
            userProfile = await Student.findById(user.id).select('-password').lean();
        }

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
