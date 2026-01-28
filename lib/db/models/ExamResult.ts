import mongoose, { Document, Schema, Model } from 'mongoose';

// Grade enum
export enum Grade {
    A_PLUS = 'A+',
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    F = 'F',
}

// Answer interface
export interface IAnswer {
    questionIndex: number;
    answer: string;
    marks?: number;
    isCorrect?: boolean;
}

// ExamResult interface
export interface IExamResult extends Document {
    student: mongoose.Types.ObjectId;
    exam: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId; // Short Course এর জন্য
    semester?: mongoose.Types.ObjectId; // Long Course/Semester এর জন্য
    answers: IAnswer[];
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: Grade;
    status: 'submitted' | 'graded';
    attemptNumber: number; // কততম attempt
    isLatest: boolean; // সর্বশেষ attempt কিনা
    canRetake: boolean; // শিক্ষক অনুমোদন দিয়েছেন কিনা
    submittedAt: Date;
    gradedAt?: Date;
    gradedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ExamResult schema
const ExamResultSchema = new Schema<IExamResult>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'শিক্ষার্থী আবশ্যক'],
        },
        exam: {
            type: Schema.Types.ObjectId,
            ref: 'Exam',
            required: [true, 'পরীক্ষা আবশ্যক'],
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
        },
        answers: [{
            questionIndex: {
                type: Number,
                required: true,
            },
            answer: {
                type: String,
                required: true,
            },
            marks: Number,
            isCorrect: Boolean,
        }],
        totalMarks: {
            type: Number,
            required: true,
        },
        obtainedMarks: {
            type: Number,
            default: 0,
        },
        percentage: {
            type: Number,
            default: 0,
        },
        grade: {
            type: String,
            enum: Object.values(Grade),
        },
        status: {
            type: String,
            enum: ['submitted', 'graded'],
            default: 'submitted',
        },
        attemptNumber: {
            type: Number,
            default: 1,
            min: 1,
        },
        isLatest: {
            type: Boolean,
            default: true,
        },
        canRetake: {
            type: Boolean,
            default: false,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        gradedAt: {
            type: Date,
        },
        gradedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ExamResultSchema.index({ student: 1, exam: 1, attemptNumber: 1 }, { unique: true });
ExamResultSchema.index({ student: 1, exam: 1, isLatest: 1 });
ExamResultSchema.index({ student: 1, semester: 1 });
ExamResultSchema.index({ exam: 1 });
ExamResultSchema.index({ status: 1 });

// Auto-calculate percentage and grade before saving
ExamResultSchema.pre('save', async function () {
    if (this.totalMarks > 0) {
        this.percentage = Math.round((this.obtainedMarks / this.totalMarks) * 100);

        // Calculate grade
        if (this.percentage >= 80) this.grade = Grade.A_PLUS;
        else if (this.percentage >= 70) this.grade = Grade.A;
        else if (this.percentage >= 60) this.grade = Grade.B;
        else if (this.percentage >= 50) this.grade = Grade.C;
        else if (this.percentage >= 40) this.grade = Grade.D;
        else this.grade = Grade.F;
    }
});

// Create or retrieve the model
const ExamResult: Model<IExamResult> =
    mongoose.models.ExamResult || mongoose.model<IExamResult>('ExamResult', ExamResultSchema);

export default ExamResult;
