import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import Order, { OrderStatus, PaymentMethod } from '@/lib/db/models/Order';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/payment/initiate - Initiate payment for course enrollment
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json(
                { error: 'কোর্স আইডি প্রয়োজন' },
                { status: 400 }
            );
        }

        await connectDB();

        // Fetch course
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if course is published
        if (course.status !== 'published') {
            return NextResponse.json(
                { error: 'এই কোর্সটি এখনো প্রকাশিত হয়নি' },
                { status: 400 }
            );
        }

        // Check if course is free (no payment needed)
        if (course.isFree) {
            return NextResponse.json(
                { error: 'এই কোর্সটি বিনামূল্যে, সরাসরি এনরোল করুন' },
                { status: 400 }
            );
        }

        // Paystation minimum payment amount is 20 BDT
        if (course.price < 20) {
            return NextResponse.json(
                { error: 'সর্বনিম্ন পেমেন্ট ২০ টাকা। কোর্সের মূল্য কমপক্ষে ২০ টাকা হতে হবে।' },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const userData = await Student.findById(user.id).select('enrolledCourses name email phone address');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const alreadyEnrolled = userData?.enrolledCourses?.some((e: any) => {
            if (e?.toString && typeof e.toString === 'function' && !e.course) {
                return e.toString() === courseId;
            }
            return e?.course?.toString() === courseId;
        });

        if (alreadyEnrolled) {
            return NextResponse.json(
                { error: 'আপনি ইতিমধ্যে এই কোর্সে নথিভুক্ত আছেন' },
                { status: 400 }
            );
        }

        // Mark any existing pending orders as failed (prevent duplicate invoice errors)
        await Order.updateMany(
            {
                user: user.id,
                course: courseId,
                status: OrderStatus.PENDING,
            },
            { status: OrderStatus.FAILED }
        );

        // Always generate a fresh unique invoice number
        const invoiceNumber = `IOA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create order
        const order = await Order.create({
            user: user.id,
            course: courseId,
            amount: course.price,
            currency: 'BDT',
            paymentMethod: PaymentMethod.PAYSTATION,
            invoiceNumber,
            status: OrderStatus.PENDING,
        });

        // Initiate Paystation payment
        const paymentUrl = await initiatePaystationPayment({
            invoiceNumber,
            amount: course.price,
            customerName: userData?.name || 'Student',
            customerEmail: userData?.email || user.email || '',
            customerPhone: userData?.phone || '01700000000',
            customerAddress: userData?.address || 'Bangladesh',
        });

        if (!paymentUrl) {
            // Mark order as failed
            await Order.findByIdAndUpdate(order._id, { status: OrderStatus.FAILED });
            return NextResponse.json(
                { error: 'পেমেন্ট সিস্টেমে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            payment_url: paymentUrl,
            invoiceNumber,
            orderId: order._id.toString(),
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json(
            { error: 'পেমেন্ট শুরু করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// Helper: Initiate Paystation payment
async function initiatePaystationPayment({
    invoiceNumber,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
}: {
    invoiceNumber: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
}): Promise<string | null> {
    try {
        const storeId = process.env.PAYSTATION_STORE_ID;
        const password = process.env.PAYSTATION_PASSWORD;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        if (!storeId || !password) {
            console.error('Paystation credentials not configured');
            return null;
        }

        const callbackUrl = `${baseUrl}/api/payment/callback`;

        const response = await fetch('https://api.paystation.com.bd/initiate-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchantId: storeId,
                password: password,
                invoice_number: invoiceNumber,
                currency: 'BDT',
                payment_amount: amount,
                cust_name: customerName,
                cust_phone: customerPhone,
                cust_email: customerEmail,
                cust_address: customerAddress,
                callback_url: callbackUrl,
            }),
        });

        const data = await response.json();

        if (data.payment_url) {
            return data.payment_url;
        }

        console.error('Paystation initiation failed:', data);
        return null;
    } catch (error) {
        console.error('Paystation API error:', error);
        return null;
    }
}
