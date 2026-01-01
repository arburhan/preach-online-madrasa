import mongoose, { Document, Schema, Model } from 'mongoose';

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
    password?: string; // Optional for OAuth users
    image?: string;
    role: UserRole;

    // Teacher-specific fields
    isTeacherApproved: boolean;
    teacherBio?: string;
    teacherQualifications?: string;

    // Profile fields
    phone?: string;
    address?: string;

    // Enrollment tracking
    enrolledCourses: mongoose.Types.ObjectId[];

    // OAuth fields
    provider?: 'credentials' | 'google';
    providerId?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false, // Don't include password by default in queries
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.STUDENT,
        },
        isTeacherApproved: {
            type: Boolean,
            default: false,
        },
        teacherBio: {
            type: String,
        },
        teacherQualifications: {
            type: String,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        enrolledCourses: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        provider: {
            type: String,
            enum: ['credentials', 'google'],
            default: 'credentials',
        },
        providerId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isTeacherApproved: 1, role: 1 });

// Create or retrieve the model
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
