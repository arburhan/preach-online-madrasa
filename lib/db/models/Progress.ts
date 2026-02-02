import mongoose, { Document, Schema, Model } from 'mongoose';

// Progress interface
export interface IProgress extends Document {
    // References
    user: mongoose.Types.ObjectId;
    lesson: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;

    // Progress tracking
    watchedDuration: number; // Seconds watched
    totalDuration: number; // Total lesson duration
    progressPercentage: number; // 0-100

    // Completion
    isCompleted: boolean;
    completedAt?: Date;

    // Last watched position
    lastWatchedPosition: number; // Seconds

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Progress schema
const ProgressSchema = new Schema<IProgress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'User reference is required'],
        },
        lesson: {
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
            required: [true, 'Lesson reference is required'],
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required'],
        },
        watchedDuration: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalDuration: {
            type: Number,
            default: 0,
            min: 0,
        },
        progressPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
        lastWatchedPosition: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
ProgressSchema.index({ user: 1, course: 1 });
ProgressSchema.index({ user: 1 });

// Auto-calculate progress percentage before saving
ProgressSchema.pre('save', async function () {
    if (this.totalDuration > 0) {
        this.progressPercentage = Math.min(
            100,
            Math.round((this.watchedDuration / this.totalDuration) * 100)
        );

        // Mark as completed if watched >= 90%
        if (this.progressPercentage >= 90 && !this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = new Date();
        }
    }
});

// Create or retrieve the model
const Progress: Model<IProgress> =
    mongoose.models.Progress ||
    mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
