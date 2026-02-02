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

// Exam for type
export enum ExamFor {
    COURSE = 'course',
    SEMESTER = 'semester',
    SUBJECT = 'subject',
    PROGRAM_SEMESTER = 'program_semester',  // Long course semester exam
}

// Exam interface
export interface IExam extends Document {
    examFor: ExamFor;
    course?: mongoose.Types.ObjectId; // Short Course এর জন্য
    semester?: mongoose.Types.ObjectId; // Long Course/Semester এর জন্য
    programSemester?: mongoose.Types.ObjectId; // Long Course Program Semester এর জন্য
    module?: mongoose.Types.ObjectId; // Module reference (for lesson-based programs)
    subject?: mongoose.Types.ObjectId;
    titleBn: string;
    titleEn?: string;
    type: ExamType;
    order: number; // Content sequence order (used with lessons)
    totalMarks: number;
    passMarks: number;
    duration: number; // মিনিটে
    questions: IQuestion[];
    hasTiming: boolean; // সময়সীমা আছে কিনা
    startTime?: Date;
    endTime?: Date;
    allowRetake: boolean; // ফেল করলে আবার পরীক্ষা দেওয়া যাবে
    status: 'draft' | 'published' | 'completed';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Exam schema
const ExamSchema = new Schema<IExam>(
    {
        examFor: {
            type: String,
            enum: Object.values(ExamFor),
            required: [true, 'পরীক্ষার ধরন (course/semester/subject) আবশ্যক'],
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
        },
        programSemester: {
            type: Schema.Types.ObjectId,
            ref: 'ProgramSemester',
        },
        module: {
            type: Schema.Types.ObjectId,
            ref: 'Module',
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
        order: {
            type: Number,
            required: [true, 'ক্রম নম্বর আবশ্যক'],
            min: 0,
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
        hasTiming: {
            type: Boolean,
            default: false,
        },
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        allowRetake: {
            type: Boolean,
            default: false,
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
ExamSchema.index({ examFor: 1 });
ExamSchema.index({ course: 1 });
ExamSchema.index({ semester: 1 });
ExamSchema.index({ subject: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ startTime: 1 });

// Create or retrieve the model
const Exam: Model<IExam> =
    mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;
