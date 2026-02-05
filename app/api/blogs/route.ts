import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';

// GET - Get blog posts for public (only published)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '12');
        const page = parseInt(searchParams.get('page') || '1');
        const featured = searchParams.get('featured');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { status: 'published' };

        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Join with Category to filter by slug if provided
        const skip = (page - 1) * limit;

        const postsQuery = BlogPost.find(query)
            .populate('category', 'nameBn nameEn')
            .populate('author', 'name')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get all posts first, then filter by category slug if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let posts: any[] = await postsQuery;

        if (categorySlug) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            posts = posts.filter((post: any) =>
                post.category?.nameEn?.toLowerCase() === categorySlug.toLowerCase()
            );
        }

        const total = await BlogPost.countDocuments(query);

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
        console.error('Public Blog GET error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
