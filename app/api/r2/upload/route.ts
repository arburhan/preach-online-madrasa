import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET } from '@/lib/r2/client';
import { requireAuth } from '@/lib/auth/rbac';

// POST /api/r2/upload - Get presigned URL for direct R2 upload
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        if (!['teacher', 'admin'].includes(user.role)) {
            return NextResponse.json(
                { error: 'শুধুমাত্র শিক্ষক এবং অ্যাডমিন আপলোড করতে পারবেন' },
                { status: 403 }
            );
        }

        const { fileName, fileType } = await request.json();

        if (!fileName || !fileType) {
            return NextResponse.json(
                { error: 'ফাইলের নাম এবং টাইপ আবশ্যক' },
                { status: 400 }
            );
        }

        // Generate unique key for R2
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `videos/${timestamp}-${randomString}-${sanitizedFileName}`;

        // Create presigned URL (valid for 1 hour)
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, {
            expiresIn: 3600, // 1 hour
        });

        // Generate public URL
        const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
            ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
            : `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;

        return NextResponse.json({
            uploadUrl,
            key,
            publicUrl,
        });
    } catch (error) {
        console.error('Presigned URL generation error:', error);
        return NextResponse.json(
            { error: 'আপলোড URL তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
