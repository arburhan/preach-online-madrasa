import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import BlogPost from '@/lib/db/models/BlogPost';
import { Category } from '@/lib/db/models';
import '@/lib/db/models/Admin';

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

        // Filter by category at DB level instead of JS level
        if (categorySlug) {
            const category = await Category.findOne({
                nameEn: { $regex: new RegExp(`^${categorySlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            }).select('_id').lean();
            if (category) {
                query.category = category._id;
            } else {
                // Category not found, return empty results
                return NextResponse.json({
                    posts: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                });
            }
        }

        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            BlogPost.find(query)
                .populate('category', 'nameBn nameEn')
                .populate('author', 'name')
                .sort({ publishedAt: -1 })
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
        console.error('Public Blog GET error:', error);
        return NextResponse.json(
            { error: 'ব্লগ পোষ্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
