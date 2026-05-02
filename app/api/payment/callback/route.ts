import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import Order, { OrderStatus } from '@/lib/db/models/Order';

// GET /api/payment/callback - Paystation redirects here after payment
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const invoiceNumber = searchParams.get('invoice_number');
        const trxId = searchParams.get('trx_id');

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        if (!invoiceNumber) {
            return NextResponse.redirect(`${baseUrl}/student/payment/result?status=failed&error=missing_invoice`);
        }

        await connectDB();

        // Find the order by invoice number
        const order = await Order.findOne({ invoiceNumber });

        if (!order) {
            return NextResponse.redirect(`${baseUrl}/student/payment/result?status=failed&error=order_not_found`);
        }

        // If order already completed, redirect to success
        if (order.status === OrderStatus.COMPLETED) {
            return NextResponse.redirect(
                `${baseUrl}/student/payment/result?status=success&courseId=${order.course.toString()}`
            );
        }

        const courseId = order.course.toString();
        const userId = order.user.toString();

        // Check if payment was successful based on callback status
        if (status === 'Successful' || status === 'successful') {
            // Server-side verification with Paystation
            const isVerified = await verifyPaystationTransaction(invoiceNumber);

            if (isVerified) {
                // Update order as completed
                await Order.findByIdAndUpdate(order._id, {
                    status: OrderStatus.COMPLETED,
                    transactionId: trxId || undefined,
                    paidAt: new Date(),
                    paymentGatewayData: {
                        status,
                        invoice_number: invoiceNumber,
                        trx_id: trxId,
                        verified_at: new Date().toISOString(),
                    },
                });

                // Enroll student in the course
                await Student.findByIdAndUpdate(userId, {
                    $push: {
                        enrolledCourses: {
                            course: courseId,
                            enrolledAt: new Date(),
                        },
                    },
                });

                // Update course enrolled count
                await Course.findByIdAndUpdate(courseId, {
                    $inc: { enrolledCount: 1 },
                });

                return NextResponse.redirect(
                    `${baseUrl}/student/payment/result?status=success&courseId=${courseId}`
                );
            } else {
                // Verification failed — possible fraud
                await Order.findByIdAndUpdate(order._id, {
                    status: OrderStatus.FAILED,
                    paymentGatewayData: {
                        status,
                        invoice_number: invoiceNumber,
                        trx_id: trxId,
                        verification_failed: true,
                        failed_at: new Date().toISOString(),
                    },
                });

                return NextResponse.redirect(
                    `${baseUrl}/student/payment/result?status=failed&courseId=${courseId}&error=verification_failed`
                );
            }
        } else {
            // Payment failed or cancelled
            await Order.findByIdAndUpdate(order._id, {
                status: OrderStatus.FAILED,
                paymentGatewayData: {
                    status: status || 'unknown',
                    invoice_number: invoiceNumber,
                    trx_id: trxId,
                    failed_at: new Date().toISOString(),
                },
            });

            return NextResponse.redirect(
                `${baseUrl}/student/payment/result?status=failed&courseId=${courseId}`
            );
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return NextResponse.redirect(
            `${baseUrl}/student/payment/result?status=failed&error=server_error`
        );
    }
}

// Also handle POST — some gateways send POST callbacks
export async function POST(request: NextRequest) {
    return GET(request);
}

// Helper: Verify transaction with Paystation
async function verifyPaystationTransaction(invoiceNumber: string): Promise<boolean> {
    try {
        const storeId = process.env.PAYSTATION_STORE_ID;

        if (!storeId) {
            console.error('Paystation credentials not configured for verification');
            return false;
        }

        const response = await fetch('https://api.paystation.com.bd/transaction-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                merchantId: storeId,
            },
            body: JSON.stringify({
                invoice_number: invoiceNumber,
            }),
        });

        const data = await response.json();

        // Paystation returns status like "Successful" or "success"
        const txStatus = data?.status || data?.transaction_status || '';
        const isSuccess =
            txStatus.toLowerCase() === 'successful' ||
            txStatus.toLowerCase() === 'success' ||
            txStatus.toLowerCase() === 'completed';

        if (!isSuccess) {
            console.error('Paystation verification status:', txStatus, data);
        }

        return isSuccess;
    } catch (error) {
        console.error('Paystation verification error:', error);
        return false;
    }
}
