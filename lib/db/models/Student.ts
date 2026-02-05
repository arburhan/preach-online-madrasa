import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Student interface
export interface IStudent extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    gender?: 'male' | 'female';
    phone?: string;
    address?: string;
    bio?: string;

    // Gender change request (for users who want to change gender after setting)
    genderChangeRequest?: {
        status: 'pending' | 'approved' | 'rejected';
        requestedAt?: Date;
        reason?: string;
    };

    // OAuth
    provider?: 'credentials' | 'google';
    providerId?: string;

    // Email verification
    isEmailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;

    // Password reset
    passwordResetToken?: string;
    passwordResetExpires?: Date;

    // Course enrollments
    enrolledCourses?: Array<{
        course: Types.ObjectId;
        lastWatchedLesson?: Types.ObjectId;
        enrolledAt: Date;
    }>;

    // Program (long course) enrollments
    enrolledPrograms?: Array<{
        program: Types.ObjectId;
        currentSemesterNumber: number;           // বর্তমানে কোন সেমিস্টারে আছে
        completedSemesterNumbers: number[];      // কোন কোন সেমিস্টার শেষ করেছে
        enrolledAt: Date;
    }>;

    createdAt: Date;
    updatedAt: Date;
}

// Student schema
const StudentSchema = new Schema<IStudent>(
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
        },
        phone: String,
        address: String,
        bio: String,

        genderChangeRequest: {
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
            },
            requestedAt: Date,
            reason: String,
        },

        provider: {
            type: String,
            enum: ['credentials', 'google'],
        },
        providerId: String,

        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,

        passwordResetToken: String,
        passwordResetExpires: Date,

        enrolledCourses: [
            {
                course: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                },
                lastWatchedLesson: {
                    type: Schema.Types.ObjectId,
                    ref: 'Lesson',
                },
                enrolledAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        enrolledPrograms: [
            {
                program: {
                    type: Schema.Types.ObjectId,
                    ref: 'LongCourse',
                    required: true,
                },
                currentSemesterNumber: {
                    type: Number,
                    default: 1,
                },
                completedSemesterNumbers: [{
                    type: Number,
                }],
                enrolledAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes


const Student: Model<IStudent> =
    mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
