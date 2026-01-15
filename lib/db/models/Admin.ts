import mongoose, { Document, Schema, Model } from 'mongoose';

// Admin interface
export interface IAdmin extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;

    // OAuth
    provider?: 'credentials' | 'google';
    providerId?: string;

    createdAt: Date;
    updatedAt: Date;
}

// Admin schema
const AdminSchema = new Schema<IAdmin>(
    {
        name: {
            type: String,
            required: [true, 'নাম আবশ্যক'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'ইমেইল আবশ্যক'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false,
        },
        image: String,

        provider: {
            type: String,
            enum: ['credentials', 'google'],
        },
        providerId: String,
    },
    {
        timestamps: true,
    }
);

// Indexes


const Admin: Model<IAdmin> =
    mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
