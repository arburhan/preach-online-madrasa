import mongoose, { Schema, Document, Model } from 'mongoose';
import './Category'; // Ensure Category model is registered

// Blog Post status enum
export enum BlogStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

// Blog Post interface
export interface IBlogPost extends Document {
    title: string;           // Post title
    slug: string;            // URL friendly slug (unique)
    excerpt: string;         // Short description/summary
    content: string;         // Lexical JSON content
    thumbnail?: string;      // Featured image URL

    // Category
    category: mongoose.Types.ObjectId;

    // Author
    author: mongoose.Types.ObjectId;

    // Meta
    status: BlogStatus;
    viewCount: number;
    isFeatured: boolean;

    // SEO
    metaTitle?: string;
    metaDescription?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

// Blog Post schema
const BlogPostSchema = new Schema<IBlogPost>(
    {
        title: {
            type: String,
            required: [true, 'শিরোনাম আবশ্যক'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        excerpt: {
            type: String,
            required: [true, 'সংক্ষিপ্ত বিবরণ আবশ্যক'],
            maxlength: [500, 'সংক্ষিপ্ত বিবরণ ৫০০ অক্ষরের বেশি হতে পারবে না'],
        },
        content: {
            type: String,
            required: [true, 'বিস্তারিত বিবরণ আবশ্যক'],
        },
        thumbnail: {
            type: String,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'ক্যাটাগরি আবশ্যক'],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(BlogStatus),
            default: BlogStatus.DRAFT,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        metaTitle: {
            type: String,
            trim: true,
        },
        metaDescription: {
            type: String,
            trim: true,
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for slug and status
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ publishedAt: -1 });

// Pre-save hook to set publishedAt when status changes to published
BlogPostSchema.pre('save', function () {
    if (this.isModified('status') && this.status === BlogStatus.PUBLISHED && !this.publishedAt) {
        this.publishedAt = new Date();
    }
});

const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
