import mongoose, { Document, Schema, Model } from 'mongoose';

// Teacher approval status
export type TeacherApprovalStatus = 'pending' | 'approved' | 'rejected';

// Teacher interface
export interface ITeacher extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    gender: 'male' | 'female';

    // OAuth
    provider?: 'credentials' | 'google';
    providerId?: string;

    // Contact Info
    phone?: string;
    mobileNumber?: string;
    address?: string;

    // Personal Info
    fatherName?: string;
    motherName?: string;

    // Professional Info
    bio?: string;
    qualifications?: string;

    // Approval
    isApproved: boolean;
    approvalStatus: TeacherApprovalStatus;

    createdAt: Date;
    updatedAt: Date;
}

// Teacher schema
const TeacherSchema = new Schema<ITeacher>(
    {
        name: {
            type: String,
            required: [true, 'নাম আবশ্যক'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'ইমেইল আবশ্যক'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false,
        },
        image: String,
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: [true, 'জেন্ডার আবশ্যক'],
        },

        provider: {
            type: String,
            enum: ['credentials', 'google'],
        },
        providerId: String,

        // Contact
        phone: String,
        mobileNumber: String,
        address: String,

        // Personal
        fatherName: String,
        motherName: String,

        // Professional
        bio: String,
        qualifications: String,

        // Approval
        isApproved: {
            type: Boolean,
            default: false,
        },
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes

TeacherSchema.index({ approvalStatus: 1 });
TeacherSchema.index({ gender: 1 });
TeacherSchema.index({ isApproved: 1 });

const Teacher: Model<ITeacher> =
    mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;
