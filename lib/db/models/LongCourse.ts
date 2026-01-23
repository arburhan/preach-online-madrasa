import mongoose, { Schema, Document, Model } from 'mongoose';

// প্রোগ্রাম ইন্টারফেস - সেমিস্টার ভিত্তিক লং কোর্স
export interface IProgram extends Document {
    titleBn: string;        // বাংলা নাম (যেমন: আলিম কোর্স)
    titleEn: string;        // English name (required for slug)
    slug: string;           // URL slug
    descriptionBn: string;  // বাংলা বিবরণ
    descriptionEn?: string; // English description
    thumbnail?: string;     // Thumbnail image
    bannerImage?: string;   // Banner image

    // Duration
    durationMonths: number; // মোট মেয়াদ (মাস)
    totalSemesters: number; // মোট সেমিস্টার সংখ্যা

    // Semesters linked to this program
    semesters: mongoose.Types.ObjectId[];

    // Pricing
    price: number;          // কোর্স ফি
    discountPrice?: number; // ছাড়কৃত মূল্য
    isFree: boolean;        // বিনামূল্যে কিনা

    // Content (NEW - Lexical JSON)
    contentBn?: string;  // Lexical JSON for "কি কি থাকবে"

    // Enrollment
    hasEnrollmentPeriod: boolean;  // NEW
    enrollmentStartDate?: Date;  // এনরোলমেন্ট শুরু
    enrollmentEndDate?: Date;    // এনরোলমেন্ট শেষ
    maxStudents?: number;        // সর্বোচ্চ শিক্ষার্থী

    // Features
    features: string[];          // কোর্সের সুবিধাসমূহ
    requirements?: string[];     // পূর্বশর্ত
    targetAudience?: string[];   // কাদের জন্য

    // Instructors
    maleInstructors: mongoose.Types.ObjectId[];
    femaleInstructors: mongoose.Types.ObjectId[];

    // Meta
    status: 'draft' | 'published' | 'archived';
    isPopular: boolean;
    isFeatured: boolean;
    order: number;           // Display order

    // Stats (virtual)
    enrolledCount?: number;

    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
    {
        titleBn: {
            type: String,
            required: [true, 'বাংলা শিরোনাম আবশ্যক'],
            trim: true,
        },
        titleEn: {
            type: String,
            required: [true, 'English title is required'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            sparse: true,
        },
        descriptionBn: {
            type: String,
            required: [true, 'বাংলা বিবরণ আবশ্যক'],
        },
        descriptionEn: String,
        thumbnail: String,
        bannerImage: String,

        durationMonths: {
            type: Number,
            required: true,
            default: 24, // 2 years
        },
        totalSemesters: {
            type: Number,
            required: true,
            default: 8,
        },

        semesters: [{
            type: Schema.Types.ObjectId,
            ref: 'Semester',
        }],

        price: {
            type: Number,
            required: true,
            default: 0,
        },
        discountPrice: Number,
        isFree: {
            type: Boolean,
            default: false,
        },

        contentBn: {
            type: String,
        },

        hasEnrollmentPeriod: {
            type: Boolean,
            default: false,
        },
        enrollmentStartDate: Date,
        enrollmentEndDate: Date,
        maxStudents: Number,

        features: [{
            type: String,
        }],
        requirements: [{
            type: String,
        }],
        targetAudience: [{
            type: String,
        }],

        maleInstructors: [{
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        }],
        femaleInstructors: [{
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        }],

        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ProgramSchema.index({ slug: 1 });
ProgramSchema.index({ status: 1 });
ProgramSchema.index({ isPopular: 1, isFeatured: 1 });
ProgramSchema.index({ createdAt: -1 });

const LongCourse: Model<IProgram> =
    mongoose.models.LongCourse || mongoose.model<IProgram>('LongCourse', ProgramSchema);

export default LongCourse;
