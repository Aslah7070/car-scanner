import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICar extends Document {
    vehicleNumber: string;
    phoneNumber: string;
    carId: string;
    alerts: {
        type: 'block' | 'light' | 'emergency' | 'other';
        timestamp: Date;
        ip?: string;
        message?: string;
    }[];
    isActive: boolean;
    createdAt: Date;
}

const CarSchema: Schema = new Schema({
    vehicleNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true }, // Encrypted? User said "Never expose". Storing plain text in DB is a risk but standard for this level. I won't encrypt for now unless asked, but I will strictly not return it.
    carId: { type: String, required: true, unique: true },
    alerts: [
        {
            type: { type: String, enum: ['block', 'light', 'emergency', 'other'] },
            timestamp: { type: Date, default: Date.now },
            ip: { type: String },
            message: { type: String },
        },
    ],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;
