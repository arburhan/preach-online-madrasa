import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import Program from '@/lib/db/models/LongCourse';
import Order, { OrderStatus } from '@/lib/db/models/Order';
import { sendPaymentConfirmationEmail, sendEnrollmentWelcomeEmail } from '@/lib/email/mailer';

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

        // Determine if order is for course or program
        const isProgram = !!order.program;
        const itemId = isProgram ? order.program!.toString() : order.course!.toString();

        // SECURITY: Idempotency — if order already completed, don't re-process
        if (order.status === OrderStatus.COMPLETED) {
            return NextResponse.redirect(
                `${baseUrl}/student/payment/result?status=success&courseId=${itemId}`
            );
        }

        // SECURITY: Reject if order is already failed (prevent replay)
        if (order.status === OrderStatus.FAILED) {
            return NextResponse.redirect(
                `${baseUrl}/student/payment/result?status=failed&courseId=${itemId}&error=order_expired`
            );
        }

        const userId = order.user.toString();

        // Check if payment was successful based on callback status
        if (status === 'Successful' || status === 'successful') {
            // SECURITY: Server-side verification with Paystation API
            const verificationResult = await verifyPaystationTransaction(invoiceNumber, order.amount);

            if (verificationResult.verified) {
                // Fetch student data
                const student = await Student.findById(userId).select('enrolledCourses enrolledPrograms name email');

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
                        verified_amount: verificationResult.amount,
                    },
                });

                let itemName = '';

                if (isProgram) {
                    // Program enrollment
                    const alreadyEnrolled = student?.enrolledPrograms?.some(
                        (e: { program: { toString: () => string } }) => e.program?.toString() === itemId
                    );

                    if (!alreadyEnrolled) {
                        await Student.findByIdAndUpdate(userId, {
                            $push: {
                                enrolledPrograms: {
                                    program: itemId,
                                    enrolledAt: new Date(),
                                },
                            },
                        });
                    }

                    const program = await Program.findById(itemId).select('titleBn').lean();
                    itemName = program?.titleBn || 'প্রোগ্রাম';
                } else {
                    // Course enrollment
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const alreadyEnrolled = student?.enrolledCourses?.some((e: any) => {
                        if (e?.toString && typeof e.toString === 'function' && !e.course) {
                            return e.toString() === itemId;
                        }
                        return e?.course?.toString() === itemId;
                    });

                    if (!alreadyEnrolled) {
                        await Student.findByIdAndUpdate(userId, {
                            $push: {
                                enrolledCourses: {
                                    course: itemId,
                                    enrolledAt: new Date(),
                                },
                            },
                        });

                        await Course.findByIdAndUpdate(itemId, {
                            $inc: { enrolledCount: 1 },
                        });
                    }

                    const course = await Course.findById(itemId).select('titleBn').lean();
                    itemName = course?.titleBn || 'কোর্স';
                }

                const studentName = student?.name || 'শিক্ষার্থী';
                const studentEmail = student?.email || '';

                // Send emails asynchronously (don't block redirect)
                if (studentEmail) {
                    const watchUrl = isProgram
                        ? `${baseUrl}/student/programs/${itemId}`
                        : `${baseUrl}/student/watch/${itemId}`;

                    // Email 1: Payment receipt
                    sendPaymentConfirmationEmail({
                        studentName,
                        studentEmail,
                        courseName: itemName,
                        amount: order.amount,
                        transactionId: trxId || 'N/A',
                        invoiceNumber,
                        paymentDate: new Date(),
                    }).catch(err => console.error('Payment email error:', err));

                    // Email 2: Enrollment welcome (send after slight delay)
                    setTimeout(() => {
                        sendEnrollmentWelcomeEmail({
                            studentName,
                            studentEmail,
                            courseName: itemName,
                            amount: order.amount,
                            courseUrl: watchUrl,
                        }).catch(err => console.error('Enrollment email error:', err));
                    }, 3000);
                }

                return NextResponse.redirect(
                    `${baseUrl}/student/payment/result?status=success&courseId=${itemId}`
                );
            } else {
                // SECURITY: Verification failed — possible fraud attempt
                await Order.findByIdAndUpdate(order._id, {
                    status: OrderStatus.FAILED,
                    paymentGatewayData: {
                        status,
                        invoice_number: invoiceNumber,
                        trx_id: trxId,
                        verification_failed: true,
                        verification_reason: verificationResult.reason,
                        failed_at: new Date().toISOString(),
                    },
                });

                console.error(`SECURITY: Payment verification failed for invoice ${invoiceNumber}. Reason: ${verificationResult.reason}`);

                return NextResponse.redirect(
                    `${baseUrl}/student/payment/result?status=failed&courseId=${itemId}&error=verification_failed`
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
                `${baseUrl}/student/payment/result?status=failed&courseId=${itemId}`
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

// ==================== Security: Paystation Verification ====================

interface VerificationResult {
    verified: boolean;
    amount?: number;
    reason?: string;
}

/**
 * Server-side verify transaction with Paystation API
 * SECURITY: Checks both status AND amount to prevent tampering
 */
async function verifyPaystationTransaction(
    invoiceNumber: string,
    expectedAmount: number
): Promise<VerificationResult> {
    try {
        const storeId = process.env.PAYSTATION_STORE_ID;

        if (!storeId) {
            console.error('Paystation credentials not configured for verification');
            return { verified: false, reason: 'credentials_missing' };
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

        // Check transaction status
        const txStatus = data?.status || data?.transaction_status || '';
        const isSuccess =
            txStatus.toLowerCase() === 'successful' ||
            txStatus.toLowerCase() === 'success' ||
            txStatus.toLowerCase() === 'completed';

        if (!isSuccess) {
            console.error('Paystation verification status:', txStatus, data);
            return { verified: false, reason: `status_${txStatus}` };
        }

        // SECURITY: Verify the paid amount matches expected amount
        const paidAmount = parseFloat(data?.amount || data?.payment_amount || '0');
        if (paidAmount > 0 && paidAmount < expectedAmount) {
            console.error(
                `SECURITY: Amount mismatch! Expected: ${expectedAmount}, Paid: ${paidAmount}, Invoice: ${invoiceNumber}`
            );
            return { verified: false, amount: paidAmount, reason: 'amount_mismatch' };
        }

        return { verified: true, amount: paidAmount };
    } catch (error) {
        console.error('Paystation verification error:', error);
        return { verified: false, reason: 'api_error' };
    }
}
