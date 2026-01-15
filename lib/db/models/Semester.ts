import mongoose, { Document, Schema, Model } from 'mongoose';

// Semester level enum
export enum SemesterLevel {
    BASIC = 'basic',
    EXPERT = 'expert',
    MASTERS = 'masters',
    ALIM = 'alim',
}

// Semester interface
export interface ISemester extends Document {
    number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    level: SemesterLevel;
    titleBn: string;
    titleEn?: string;
    descriptionBn: string;
    descriptionEn?: string;
    duration: number; // মাসে (সাধারণত ৩)
    subjects: mongoose.Types.ObjectId[];
    status: 'active' | 'inactive';
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Semester schema
const SemesterSchema = new Schema<ISemester>(
    {
        number: {
            type: Number,
            required: [true, 'সেমিস্টার নম্বর আবশ্যক'],
            enum: [1, 2, 3, 4, 5, 6, 7, 8],
            unique: true,
        },
        level: {
            type: String,
            enum: Object.values(SemesterLevel),
            required: [true, 'লেভেল আবশ্যক'],
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
        duration: {
            type: Number,
            default: 3, // ৩ মাস
        },
        subjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Subject',
        }],
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
SemesterSchema.index({ number: 1 });
SemesterSchema.index({ level: 1 });
SemesterSchema.index({ status: 1 });

// Create or retrieve the model
const Semester: Model<ISemester> =
    mongoose.models.Semester || mongoose.model<ISemester>('Semester', SemesterSchema);

export default Semester;
