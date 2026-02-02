import mongoose, { Schema, Document, Model } from 'mongoose';

// মডিউল ইন্টারফেস - লেসন-ভিত্তিক প্রোগ্রামের জন্য
export interface IModule extends Document {
    titleBn: string;        // বাংলা নাম
    titleEn?: string;       // English name
    programSemester: mongoose.Types.ObjectId;
    order: number;          // সাজানোর ক্রম
    description?: string;   // বিবরণ
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
    {
        titleBn: {
            type: String,
            required: [true, 'বাংলা শিরোনাম আবশ্যক'],
            trim: true,
        },
        titleEn: {
            type: String,
            trim: true,
        },
        programSemester: {
            type: Schema.Types.ObjectId,
            ref: 'ProgramSemester',
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
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
ModuleSchema.index({ programSemester: 1, order: 1 });

const Module: Model<IModule> =
    mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);

export default Module;
