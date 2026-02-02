import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { SystemSetting } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/rbac';

export async function GET() {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectDB();

        let setting = await SystemSetting.findOne();
        if (!setting) {
            setting = await SystemSetting.create({ isAdminRegistrationOpen: true });
        }

        return NextResponse.json({ isAdminRegistrationOpen: setting.isAdminRegistrationOpen });
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { isAdminRegistrationOpen } = await request.json();

        await connectDB();

        let setting = await SystemSetting.findOne();
        if (!setting) {
            setting = new SystemSetting({ isAdminRegistrationOpen });
        } else {
            setting.isAdminRegistrationOpen = isAdminRegistrationOpen;
        }

        await setting.save();

        return NextResponse.json({
            message: 'Settings updated',
            isAdminRegistrationOpen: setting.isAdminRegistrationOpen
        });
    } catch (error) {
        console.error('Settings PUT error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
