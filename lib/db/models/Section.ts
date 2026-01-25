import mongoose, { Document, Schema, Model } from 'mongoose';

// Section interface - Shared between Course and Subject
export interface ISection extends Document {
    titleBn: string;
    titleEn?: string;
    order: number;

    // Reference - course OR subject OR semester
    course?: mongoose.Types.ObjectId;  // For short course
    subject?: mongoose.Types.ObjectId; // For long program subject
    semester?: mongoose.Types.ObjectId; // For long program semester direct content

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
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
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

// Validation: Must have exactly one parent (Course OR Subject OR Semester)
SectionSchema.pre('save', function () {
    const parents = [this.course, this.subject, this.semester].filter(Boolean);
    if (parents.length === 0) {
        throw new Error('Section must belong to a Course, Subject, or Semester');
    } else if (parents.length > 1) {
        throw new Error('Section cannot belong to multiple parent types simultaneously');
    }
});

// Indexes
SectionSchema.index({ course: 1, order: 1 });
SectionSchema.index({ subject: 1, order: 1 });
SectionSchema.index({ semester: 1, order: 1 });

// Create or retrieve the model
const Section: Model<ISection> =
    mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);

export default Section;
