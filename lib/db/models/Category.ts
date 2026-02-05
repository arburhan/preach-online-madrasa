import mongoose, { Document, Schema, Model } from 'mongoose';

// Category interface
export interface ICategory extends Document {
    nameBn: string;     // Bengali name (যেমন: তাফসীর)
    nameEn: string;     // English name (used as slug)
    description?: string; // Optional description
    order: number;      // Display order
    isActive: boolean;  // Active status
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        nameBn: {
            type: String,
            required: [true, 'বাংলা নাম আবশ্যক'],
            trim: true,
        },
        nameEn: {
            type: String,
            required: [true, 'ইংরেজি নাম আবশ্যক (slug হিসেবে ব্যবহৃত হবে)'],
            trim: true,
            lowercase: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CategorySchema.index({ nameEn: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ isActive: 1 });

const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
