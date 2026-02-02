import mongoose, { Document, Schema, Model } from 'mongoose';

// Lesson interface
export interface ILesson extends Document {
    // Section reference (NEW - primary organization)
    section?: mongoose.Types.ObjectId;

    // Backward compatibility references
    course?: mongoose.Types.ObjectId;
    subject?: mongoose.Types.ObjectId;
    semester?: mongoose.Types.ObjectId;

    // Program semester reference (for long courses)
    programSemester?: mongoose.Types.ObjectId;

    // Module reference (for lesson-based programs)
    module?: mongoose.Types.ObjectId;

    // Instructor info for gender-based filtering
    instructor?: mongoose.Types.ObjectId;
    instructorGender?: 'male' | 'female';

    // Basic info
    titleBn: string;
    titleEn?: string;
    descriptionBn?: string;
    descriptionEn?: string;

    // Video details (NEW structure)
    videoSource: 'r2' | 'youtube';  // Teacher chooses source
    videoUrl: string;               // YouTube URL or R2 signed URL
    videoKey?: string;              // R2 key (only if source is R2)
    duration: number;               // Duration in minutes

    // Order and access
    order: number;
    isFree: boolean;

    // Resources (NEW - improved structure)
    resources: Array<{
        type: 'pdf' | 'link' | 'other';
        title: string;
        url: string;
    }>;

    // Legacy field (keep for compatibility)
    attachments: Array<{
        name: string;
        url: string;
        type: string;
    }>;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Lesson schema
const LessonSchema = new Schema<ILesson>(
    {
        section: {
            type: Schema.Types.ObjectId,
            ref: 'Section',
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
        programSemester: {
            type: Schema.Types.ObjectId,
            ref: 'ProgramSemester',
        },
        module: {
            type: Schema.Types.ObjectId,
            ref: 'Module',
        },
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        },
        instructorGender: {
            type: String,
            enum: ['male', 'female'],
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
        videoSource: {
            type: String,
            enum: ['r2', 'youtube', 'file'],
            required: [true, 'Video source is required'],
        },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required'],
        },
        videoKey: {
            type: String,
            // Optional - only needed for R2 uploads
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
        resources: [
            {
                type: {
                    type: String,
                    enum: ['pdf', 'link', 'other'],
                },
                title: String,
                url: String,
            },
        ],
        attachments: [
            {
                name: String,
                url: String,
                type: { type: String },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
LessonSchema.index({ section: 1, order: 1 });
LessonSchema.index({ course: 1, order: 1 });
LessonSchema.index({ course: 1 });
LessonSchema.index({ subject: 1, order: 1 });
LessonSchema.index({ subject: 1 });
LessonSchema.index({ semester: 1 });
LessonSchema.index({ instructorGender: 1 });

// Create or retrieve the model
const Lesson: Model<ILesson> =
    mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
