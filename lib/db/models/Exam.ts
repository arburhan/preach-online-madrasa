import mongoose, { Document, Schema, Model } from 'mongoose';

// Exam type enum
export enum ExamType {
    MCQ = 'mcq',
    WRITTEN = 'written',
    MIXED = 'mixed',
}

// Question type enum
export enum QuestionType {
    MCQ = 'mcq',
    SHORT = 'short',
    LONG = 'long',
}

// Question interface
export interface IQuestion {
    questionBn: string;
    questionEn?: string;
    type: QuestionType;
    options?: string[]; // MCQ হলে
    correctAnswer?: string; // MCQ এর জন্য
    marks: number;
}

// Exam interface
export interface IExam extends Document {
    semester: mongoose.Types.ObjectId;
    subject?: mongoose.Types.ObjectId;
    titleBn: string;
    titleEn?: string;
    type: ExamType;
    totalMarks: number;
    passMarks: number;
    duration: number; // মিনিটে
    questions: IQuestion[];
    startTime: Date;
    endTime: Date;
    status: 'draft' | 'published' | 'completed';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Exam schema
const ExamSchema = new Schema<IExam>(
    {
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'সেমিস্টার আবশ্যক'],
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
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
        type: {
            type: String,
            enum: Object.values(ExamType),
            required: [true, 'পরীক্ষার ধরন আবশ্যক'],
        },
        totalMarks: {
            type: Number,
            required: [true, 'মোট নম্বর আবশ্যক'],
            min: 1,
        },
        passMarks: {
            type: Number,
            required: [true, 'পাস নম্বর আবশ্যক'],
            min: 0,
        },
        duration: {
            type: Number,
            required: [true, 'সময়সীমা আবশ্যক'],
            min: 1,
        },
        questions: [{
            questionBn: {
                type: String,
                required: true,
            },
            questionEn: String,
            type: {
                type: String,
                enum: Object.values(QuestionType),
                required: true,
            },
            options: [String],
            correctAnswer: String,
            marks: {
                type: Number,
                required: true,
                min: 0,
            },
        }],
        startTime: {
            type: Date,
            required: [true, 'শুরুর সময় আবশ্যক'],
        },
        endTime: {
            type: Date,
            required: [true, 'শেষের সময় আবশ্যক'],
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'completed'],
            default: 'draft',
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
ExamSchema.index({ semester: 1 });
ExamSchema.index({ subject: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ startTime: 1 });

// Create or retrieve the model
const Exam: Model<IExam> =
    mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;
