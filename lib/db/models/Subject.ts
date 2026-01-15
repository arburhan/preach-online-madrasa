import mongoose, { Document, Schema, Model } from 'mongoose';

// Subject type enum
export enum SubjectType {
    ISLAMIC = 'islamic',
    SKILL = 'skill',
}

// Subject interface
export interface ISubject extends Document {
    semester: mongoose.Types.ObjectId;
    type: SubjectType;
    titleBn: string;
    titleEn?: string;
    descriptionBn: string;
    descriptionEn?: string;

    // Gender-based instructors
    maleInstructors: mongoose.Types.ObjectId[];
    femaleInstructors: mongoose.Types.ObjectId[];

    thumbnail?: string;
    totalLessons: number;
    order: number; // সেমিস্টারে ক্রম
    isActive: boolean;

    // লাইভ ক্লাস লিঙ্ক (শিক্ষার্থীর জেন্ডার অনুযায়ী)
    liveClassLinks?: {
        male: string;   // ছেলে শিক্ষার্থীদের জন্য
        female: string; // মেয়ে শিক্ষার্থীদের জন্য
    };

    createdAt: Date;
    updatedAt: Date;
}

// Subject schema
const SubjectSchema = new Schema<ISubject>(
    {
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'সেমিস্টার আবশ্যক'],
        },
        type: {
            type: String,
            enum: Object.values(SubjectType),
            required: [true, 'বিষয়ের ধরন আবশ্যক'],
        },
        titleBn: {
            type: String,
            required: [true, 'বাংলা শিরোনাম আবশ্যক'],
            trim: true,
        },
        titleEn: {
            type: String,
            trim: true,
        },
        descriptionBn: {
            type: String,
            required: [true, 'বাংলা বিবরণ আবশ্যক'],
        },
        descriptionEn: {
            type: String,
        },
        maleInstructors: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        femaleInstructors: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        thumbnail: {
            type: String,
        },
        totalLessons: {
            type: Number,
            default: 0,
        },
        order: {
            type: Number,
            required: [true, 'ক্রম আবশ্যক'],
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        liveClassLinks: {
            male: { type: String },
            female: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
SubjectSchema.index({ semester: 1, order: 1 });
SubjectSchema.index({ semester: 1 });
SubjectSchema.index({ type: 1 });
SubjectSchema.index({ isActive: 1 });

// Create or retrieve the model
const Subject: Model<ISubject> =
    mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);

export default Subject;
