import mongoose, { Document, Schema, Model } from 'mongoose';

// Note interface
export interface INote extends Document {
    // References
    user: mongoose.Types.ObjectId;
    lesson: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;

    // Note content
    content: string;

    // Video timestamp (optional - for time-specific notes)
    timestamp?: number; // Seconds in the video

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Note schema
const NoteSchema = new Schema<INote>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
        content: {
            type: String,
            required: [true, 'Note content is required'],
            trim: true,
        },
        timestamp: {
            type: Number,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
NoteSchema.index({ user: 1, lesson: 1 });
NoteSchema.index({ user: 1, course: 1 });
NoteSchema.index({ createdAt: -1 });

// Create or retrieve the model
const Note: Model<INote> =
    mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
