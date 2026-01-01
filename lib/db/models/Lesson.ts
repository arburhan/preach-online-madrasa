import mongoose, { Document, Schema, Model } from 'mongoose';

// Lesson interface
export interface ILesson extends Document {
    // Course reference
    course: mongoose.Types.ObjectId;

    // Basic info
    titleBn: string;
    titleEn?: string;
    descriptionBn?: string;
    descriptionEn?: string;

    // Video details
    videoUrl: string; // Cloudflare R2 URL
    videoKey: string; // Storage key for generating signed URLs
    duration: number; // Duration in seconds

    // Order and access
    order: number; // Lesson order within the course
    isFree: boolean; // Free preview lesson

    // Resources
    attachments: Array<{
        name: string;
        url: string;
        type: string; // pdf, doc, etc.
    }>;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Lesson schema
const LessonSchema = new Schema<ILesson>(
    {
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required'],
        },
        titleBn: {
            type: String,
            required: [true, 'Bengali title is required'],
            trim: true,
        },
        titleEn: {
            type: String,
            trim: true,
        },
        descriptionBn: {
            type: String,
        },
        descriptionEn: {
            type: String,
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
        },
        videoKey: {
            type: String,
            required: [true, 'Video key is required'],
        },
        duration: {
            type: Number,
            default: 0,
        },
        order: {
            type: Number,
            required: [true, 'Lesson order is required'],
            default: 0,
        },
        isFree: {
            type: Boolean,
            default: false,
        },
        attachments: [
            {
                name: String,
                url: String,
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
LessonSchema.index({ course: 1, order: 1 });
LessonSchema.index({ course: 1 });

// Ensure unique order within a course
LessonSchema.index({ course: 1, order: 1 }, { unique: true });

// Create or retrieve the model
const Lesson: Model<ILesson> =
    mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
