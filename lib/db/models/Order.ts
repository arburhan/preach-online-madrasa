import mongoose, { Document, Schema, Model } from 'mongoose';

// Order status enum
export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

// Payment method enum
export enum PaymentMethod {
    SSL_COMMERZ = 'ssl_commerz',
    MANUAL = 'manual', // For admin manual enrollment
}

// Order interface
export interface IOrder extends Document {
    // References
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;

    // Payment details
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;

    // SSL Commerz specific fields
    transactionId?: string; // SSL Commerz transaction ID
    paymentGatewayData?: Record<string, unknown>; // Store gateway response

    // Order status
    status: OrderStatus;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
}

// Order schema
const OrderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: 0,
        },
        currency: {
            type: String,
            default: 'BDT',
            uppercase: true,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            default: PaymentMethod.SSL_COMMERZ,
        },
        transactionId: {
            type: String,
            sparse: true, // Allow null but must be unique if present
        },
        paymentGatewayData: {
            type: Schema.Types.Mixed,
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
OrderSchema.index({ user: 1 });
OrderSchema.index({ course: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
OrderSchema.index({ createdAt: -1 });

// Prevent duplicate orders for same user and course if status is completed
OrderSchema.index(
    { user: 1, course: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: OrderStatus.COMPLETED },
    }
);

// Create or retrieve the model
const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
