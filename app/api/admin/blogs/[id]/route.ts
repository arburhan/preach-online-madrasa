import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';
import { requireAuth } from '@/lib/auth/rbac';

// GET - Get single blog post by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const post = await BlogPost.findById(id)
            .populate('category', 'nameBn nameEn')
            .populate('author', 'name')
            .lean();

        if (!post) {
            return NextResponse.json(
                { error: 'ব্লগ পোষ্ট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Blog GET error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT - Update blog post
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
        const body = await request.json();
        const {
            title,
            excerpt,
            content,
            thumbnail,
            category,
            status,
            isFeatured,
            metaTitle,
            metaDescription,
        } = body;

        await connectDB();

        const post = await BlogPost.findById(id);
        if (!post) {
            return NextResponse.json(
                { error: 'ব্লগ পোষ্ট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Update fields
        if (title) post.title = title.trim();
        if (excerpt) post.excerpt = excerpt.trim();
        if (content) post.content = content;
        if (thumbnail !== undefined) post.thumbnail = thumbnail;
        if (category) post.category = category;
        if (status) {
            // Set publishedAt if publishing for first time
            if (status === 'published' && post.status !== 'published' && !post.publishedAt) {
                post.publishedAt = new Date();
            }
            post.status = status;
        }
        if (isFeatured !== undefined) post.isFeatured = isFeatured;
        if (metaTitle !== undefined) post.metaTitle = metaTitle?.trim();
        if (metaDescription !== undefined) post.metaDescription = metaDescription?.trim();

        // Update slug if title changed
        if (title && title !== post.title) {
            let newSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9\u0980-\u09ff\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 100);

            const existingPost = await BlogPost.findOne({ slug: newSlug, _id: { $ne: id } });
            if (existingPost) {
                newSlug = `${newSlug}-${Date.now().toString(36)}`;
            }
            post.slug = newSlug;
        }

        await post.save();

        return NextResponse.json({
            message: 'ব্লগ পোষ্ট সফলভাবে আপডেট হয়েছে',
            post,
        });
    } catch (error) {
        console.error('Blog PUT error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Delete blog post
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

        const post = await BlogPost.findByIdAndDelete(id);
        if (!post) {
            return NextResponse.json(
                { error: 'ব্লগ পোষ্ট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'ব্লগ পোষ্ট সফলভাবে মুছে ফেলা হয়েছে',
        });
    } catch (error) {
        console.error('Blog DELETE error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
