import mongoose, { Document, Schema, Model } from 'mongoose';

// Subject progress interface
export interface ISubjectProgress {
    subject: mongoose.Types.ObjectId;
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    lastWatchedLesson?: mongoose.Types.ObjectId;
}

// Semester result interface
export interface ISemesterResult {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    position?: number;
    completedAt?: Date;
}

// StudentSemester interface
export interface IStudentSemester extends Document {
    student: mongoose.Types.ObjectId;
    semester: mongoose.Types.ObjectId;
    enrolledAt: Date;
    status: 'enrolled' | 'in_progress' | 'completed' | 'failed';
    subjectProgress: ISubjectProgress[];
    semesterResult?: ISemesterResult;
    createdAt: Date;
    updatedAt: Date;
}

// StudentSemester schema
const StudentSemesterSchema = new Schema<IStudentSemester>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'শিক্ষার্থী আবশ্যক'],
        },
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'সেমিস্টার আবশ্যক'],
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['enrolled', 'in_progress', 'completed', 'failed'],
            default: 'enrolled',
        },
        subjectProgress: [{
            subject: {
                type: Schema.Types.ObjectId,
                ref: 'Subject',
                required: true,
            },
            completedLessons: {
                type: Number,
                default: 0,
            },
            totalLessons: {
                type: Number,
                default: 0,
            },
            percentage: {
                type: Number,
                default: 0,
            },
            lastWatchedLesson: {
                type: Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        }],
        semesterResult: {
            totalMarks: Number,
            obtainedMarks: Number,
            percentage: Number,
            grade: String,
            position: Number,
            completedAt: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
StudentSemesterSchema.index({ student: 1, semester: 1 }, { unique: true });
StudentSemesterSchema.index({ student: 1 });
StudentSemesterSchema.index({ semester: 1 });
StudentSemesterSchema.index({ status: 1 });

// Create or retrieve the model
const StudentSemester: Model<IStudentSemester> =
    mongoose.models.StudentSemester || mongoose.model<IStudentSemester>('StudentSemester', StudentSemesterSchema);

export default StudentSemester;
