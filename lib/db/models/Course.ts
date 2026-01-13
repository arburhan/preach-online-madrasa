import mongoose, { Document, Schema, Model } from 'mongoose';

// Course status enum
export enum CourseStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

// Course level enum
export enum CourseLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}

// Course interface
export interface ICourse extends Document {
    // Basic info
    titleBn: string; // Bengali title
    titleEn?: string; // English title (optional)
    descriptionBn: string;
    descriptionEn?: string;

    // Instructors (multi-teacher support)
    instructors: mongoose.Types.ObjectId[]; // References to Users (teachers)
    createdBy: mongoose.Types.ObjectId; // Admin who created the course

    // Pricing
    price: number; // 0 for free courses
    isFree: boolean;

    // Media
    thumbnail?: string; // Course thumbnail image URL
    previewVideo?: string; // Preview video URL

    // Course details
    level: CourseLevel;
    duration: number; // Total duration in minutes
    courseDuration?: string; // e.g., '30 দিন', '3 মাস'
    language: string; // e.g., 'bn', 'en', 'ar'

    // Status
    status: CourseStatus;

    // Features/What students will learn
    whatYouWillLearn: string[];
    requirements: string[];

    // Stats
    enrolledCount: number;
    totalLessons: number;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

// Course schema
const CourseSchema = new Schema<ICourse>(
    {
        titleBn: {
            type: String,
            required: [true, 'Bengali title is required'],
            trim: true,
        },
        titleEn: {
            type: String,
            trim: true,
        },
        descriptionBn: {
            type: String,
            required: [true, 'Bengali description is required'],
        },
        descriptionEn: {
            type: String,
        },
        instructors: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'At least one instructor is required'],
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator (admin) is required'],
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        isFree: {
            type: Boolean,
            default: true,
        },
        thumbnail: {
            type: String,
        },
        previewVideo: {
            type: String,
        },
        level: {
            type: String,
            enum: Object.values(CourseLevel),
            default: CourseLevel.BEGINNER,
        },
        duration: {
            type: Number,
            default: 0,
        },
        courseDuration: {
            type: String,
        },
        language: {
            type: String,
            default: 'bn',
        },
        status: {
            type: String,
            enum: Object.values(CourseStatus),
            default: CourseStatus.DRAFT,
        },
        whatYouWillLearn: [
            {
                type: String,
            },
        ],
        requirements: [
            {
                type: String,
            },
        ],
        enrolledCount: {
            type: Number,
            default: 0,
        },
        totalLessons: {
            type: Number,
            default: 0,
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CourseSchema.index({ instructors: 1 });
CourseSchema.index({ createdBy: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ isFree: 1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ enrolledCount: -1 });

// Auto-update isFree based on price
CourseSchema.pre('save', async function () {
    this.isFree = this.price === 0;
});

// Create or retrieve the model
const Course: Model<ICourse> =
    mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
