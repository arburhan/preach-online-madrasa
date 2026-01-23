import mongoose, { Document, Schema, Model } from 'mongoose';

// Section interface - Shared between Course and Subject
export interface ISection extends Document {
    titleBn: string;
    titleEn?: string;
    order: number;

    // Reference - either course OR subject (not both)
    course?: mongoose.Types.ObjectId;  // For short course
    subject?: mongoose.Types.ObjectId; // For long program subject

    // Lessons in this section
    lessons: mongoose.Types.ObjectId[];

    createdAt: Date;
    updatedAt: Date;
}

// Section schema
const SectionSchema = new Schema<ISection>(
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
        order: {
            type: Number,
            required: [true, 'ক্রম নম্বর আবশ্যক'],
            default: 0,
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
        },
        lessons: [{
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
        }],
    },
    {
        timestamps: true,
    }
);

// Validation: Must have either course OR subject (not both, not neither)
SectionSchema.pre('save', function () {
    if (!this.course && !this.subject) {
        throw new Error('Section must belong to either a Course or Subject');
    } else if (this.course && this.subject) {
        throw new Error('Section cannot belong to both Course and Subject');
    }
});

// Indexes
SectionSchema.index({ course: 1, order: 1 });
SectionSchema.index({ subject: 1, order: 1 });

// Create or retrieve the model
const Section: Model<ISection> =
    mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);

export default Section;
