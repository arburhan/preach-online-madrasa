import mongoose, { Schema, Document, Model } from 'mongoose';

// প্রোগ্রাম সেমিস্টার ইন্টারফেস
export interface IProgramSemester extends Document {
    program: mongoose.Types.ObjectId;      // কোন প্রোগ্রামের সেমিস্টার
    semesterNumber: number;                 // সেমিস্টার নম্বর (1, 2, 3...)
    titleBn: string;                        // সেমিস্টার শিরোনাম (যেমন: প্রথম সেমিস্টার)
    titleEn?: string;                       // English title
    descriptionBn?: string;                 // বিবরণ

    // কন্টেন্ট মোড - ২টি অপশন
    // 'direct' = সরাসরি এক্সাম/কন্টেন্ট যুক্ত (লেসন ছাড়া)
    // 'lesson-based' = লেসনের মধ্যে এক্সাম/কন্টেন্ট যুক্ত
    contentMode: 'direct' | 'lesson-based';

    // Content references
    lessons: mongoose.Types.ObjectId[];     // Lesson রেফারেন্স (lesson-based মোডে)
    exams: mongoose.Types.ObjectId[];       // Exam রেফারেন্স (direct মোডে)

    // Status
    isCompleted: boolean;                   // এডমিন কর্তৃক সম্পন্ন চিহ্নিত
    completedAt?: Date;                     // সম্পন্ন করার তারিখ
    status: 'draft' | 'active';             // ড্রাফট বা সক্রিয়

    // Meta
    order: number;                          // ক্রম (সাধারণত semesterNumber এর সমান)
    totalLessons: number;                   // মোট লেসন সংখ্যা
    totalExams: number;                     // মোট পরীক্ষা সংখ্যা

    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProgramSemesterSchema = new Schema<IProgramSemester>(
    {
        program: {
            type: Schema.Types.ObjectId,
            ref: 'LongCourse',
            required: [true, 'প্রোগ্রাম আবশ্যক'],
            index: true,
        },
        semesterNumber: {
            type: Number,
            required: [true, 'সেমিস্টার নম্বর আবশ্যক'],
            min: 1,
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
        },
        contentMode: {
            type: String,
            enum: ['direct', 'lesson-based'],
            default: 'direct',
        },
        lessons: [{
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
        }],
        exams: [{
            type: Schema.Types.ObjectId,
            ref: 'Exam',
        }],
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['draft', 'active'],
            default: 'draft',
        },
        order: {
            type: Number,
            default: 0,
        },
        totalLessons: {
            type: Number,
            default: 0,
        },
        totalExams: {
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

// Compound index for unique semester per program
ProgramSemesterSchema.index({ program: 1, semesterNumber: 1 }, { unique: true });
ProgramSemesterSchema.index({ program: 1, order: 1 });
ProgramSemesterSchema.index({ status: 1 });

const ProgramSemester: Model<IProgramSemester> =
    mongoose.models.ProgramSemester || mongoose.model<IProgramSemester>('ProgramSemester', ProgramSemesterSchema);

export default ProgramSemester;
