import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';
import { requireAuth } from '@/lib/auth/rbac';

// GET - Get all blog posts (public gets published, admin gets all)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const categoryId = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        // Check if user is admin
        let isAdmin = false;
        try {
            const user = await requireAuth();
            isAdmin = user.role === 'admin';
        } catch {
            // Not authenticated, show only published
        }

        if (!isAdmin) {
            query.status = 'published';
        } else if (status) {
            query.status = status;
        }

        if (categoryId) {
            query.category = categoryId;
        }

        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            BlogPost.find(query)
                .populate('category', 'nameBn nameEn')
                .populate('author', 'name')
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            BlogPost.countDocuments(query),
        ]);

        return NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Blog GET error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create new blog post (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const {
            title,
            excerpt,
            content,
            thumbnail,
            category,
            status = 'draft',
            isFeatured = false,
            metaTitle,
            metaDescription,
        } = body;

        // Validation
        if (!title?.trim()) {
            return NextResponse.json(
                { error: 'শিরোনাম আবশ্যক' },
                { status: 400 }
            );
        }

        if (!excerpt?.trim()) {
            return NextResponse.json(
                { error: 'সংক্ষিপ্ত বিবরণ আবশ্যক' },
                { status: 400 }
            );
        }

        if (!content?.trim()) {
            return NextResponse.json(
                { error: 'বিস্তারিত বিবরণ আবশ্যক' },
                { status: 400 }
            );
        }

        if (!category) {
            return NextResponse.json(
                { error: 'ক্যাটাগরি আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        // Generate slug from title
        let slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\u0980-\u09ff\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);

        // Check for existing slug
        const existingPost = await BlogPost.findOne({ slug });
        if (existingPost) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const post = await BlogPost.create({
            title: title.trim(),
            slug,
            excerpt: excerpt.trim(),
            content,
            thumbnail,
            category,
            author: user.id,
            status,
            isFeatured,
            metaTitle: metaTitle?.trim(),
            metaDescription: metaDescription?.trim(),
            publishedAt: status === 'published' ? new Date() : undefined,
        });

        return NextResponse.json({
            message: 'ব্লগ পোষ্ট সফলভাবে তৈরি হয়েছে',
            post,
        }, { status: 201 });
    } catch (error) {
        console.error('Blog POST error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
