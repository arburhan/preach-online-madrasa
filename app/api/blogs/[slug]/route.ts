import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';

// GET - Get single blog post by slug (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        await connectDB();

        const post = await BlogPost.findOne({ slug, status: 'published' })
            .populate('category', 'nameBn nameEn')
            .populate('author', 'name')
            .lean();

        if (!post) {
            return NextResponse.json(
                { error: 'পোষ্ট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Increment view count
        await BlogPost.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Blog GET error:', error);
        return NextResponse.json(
            { error: 'পোষ্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
