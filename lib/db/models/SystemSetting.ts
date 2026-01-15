import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISystemSetting extends Document {
    isAdminRegistrationOpen: boolean;
    updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
    {
        isAdminRegistrationOpen: {
            type: Boolean,
            default: true, // Default to true so user can register initially
        },
    },
    {
        timestamps: true,
    }
);

const SystemSetting: Model<ISystemSetting> =
    mongoose.models.SystemSetting || mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);

export default SystemSetting;
