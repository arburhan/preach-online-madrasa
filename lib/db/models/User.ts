import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// User roles enum
export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin',
}

// User interface
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    gender?: 'male' | 'female';
    role: UserRole;

    // OAuth
    provider?: 'credentials' | 'google';
    providerId?: string;

    // Teacher specific
    isTeacherApproved?: boolean;
    teacherBio?: string;
    teacherQualifications?: string;
    fatherName?: string;
    motherName?: string;
    mobileNumber?: string;
    address?: string;

    // Student specific
    enrolledCourses?: Types.ObjectId[];

    createdAt: Date;
    updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
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
        image: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.STUDENT,
        },
        provider: {
            type: String,
            enum: ['credentials', 'google'],
        },
        providerId: String,

        // Teacher fields
        isTeacherApproved: {
            type: Boolean,
            default: false,
        },
        teacherBio: String,
        teacherQualifications: String,
        fatherName: String,
        motherName: String,
        mobileNumber: String,
        address: String,

        // Student fields
        enrolledCourses: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isTeacherApproved: 1 });

// Export model
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
