import mongoose, { Document, Schema, Model } from 'mongoose';

// RetakeRequest status enum
export enum RetakeRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

// RetakeRequest interface
export interface IRetakeRequest extends Document {
    student: mongoose.Types.ObjectId;
    exam: mongoose.Types.ObjectId;
    course?: mongoose.Types.ObjectId;
    semester?: mongoose.Types.ObjectId;
    previousResult: mongoose.Types.ObjectId;
    reason?: string;
    status: RetakeRequestStatus;
    requestedAt: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// RetakeRequest schema
const RetakeRequestSchema = new Schema<IRetakeRequest>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'শিক্ষার্থী আবশ্যক'],
        },
        exam: {
            type: Schema.Types.ObjectId,
            ref: 'Exam',
            required: [true, 'পরীক্ষা আবশ্যক'],
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        semester: {
            type: Schema.Types.ObjectId,
            ref: 'Semester',
        },
        previousResult: {
            type: Schema.Types.ObjectId,
            ref: 'ExamResult',
            required: [true, 'পূর্ববর্তী ফলাফল আবশ্যক'],
        },
        reason: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(RetakeRequestStatus),
            default: RetakeRequestStatus.PENDING,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
RetakeRequestSchema.index({ student: 1, exam: 1, status: 1 });
RetakeRequestSchema.index({ exam: 1, status: 1 });
RetakeRequestSchema.index({ status: 1 });
RetakeRequestSchema.index({ course: 1 });
RetakeRequestSchema.index({ semester: 1 });

// Ensure only one pending request per student per exam
RetakeRequestSchema.index(
    { student: 1, exam: 1 },
    {
        unique: true,
        partialFilterExpression: { status: RetakeRequestStatus.PENDING },
    }
);

// Create or retrieve the model
const RetakeRequest: Model<IRetakeRequest> =
    mongoose.models.RetakeRequest || mongoose.model<IRetakeRequest>('RetakeRequest', RetakeRequestSchema);

export default RetakeRequest;
