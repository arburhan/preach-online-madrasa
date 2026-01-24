import mongoose, { Document, Schema, Model } from 'mongoose';
import './Teacher'; // Ensure Teacher model is registered before Course references it
import './Admin';   // Ensure Admin model is registered before Course references it

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
    // Basic info
    titleBn: string; // Bengali title
    titleEn: string; // English title (required for slug)
    slug: string;    // URL friendly slug (unique)
    descriptionBn: string;
    // descriptionEn removed as per request

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

    // Course content (NEW - Lexical JSON)
    contentBn?: string;  // Lexical JSON for "কি কি থাকবে"
    contentEn?: string;  // Lexical JSON (optional)

    // Sections (NEW - organize lessons)
    sections: mongoose.Types.ObjectId[];

    // Enrollment period (NEW - optional)
    hasEnrollmentPeriod: boolean;
    enrollmentStartDate?: Date;
    enrollmentEndDate?: Date;

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
            required: [true, 'English title is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        descriptionBn: {
            type: String,
            required: [true, 'Bengali description is required'],
        },
        // descriptionEn removed
        instructors: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Teacher',
                required: true,
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
            default: 0,
        },
        isFree: {
            type: Boolean,
            default: false,
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
            required: [true, 'Course level is required'],
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
        contentBn: {
            type: String,
        },
        contentEn: {
            type: String,
        },
        sections: [{
            type: Schema.Types.ObjectId,
            ref: 'Section',
        }],
        hasEnrollmentPeriod: {
            type: Boolean,
            default: false,
        },
        enrollmentStartDate: {
            type: Date,
        },
        enrollmentEndDate: {
            type: Date,
        },
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
// CourseSchema.index({ slug: 1 }); // Already indexed by unique: true
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
