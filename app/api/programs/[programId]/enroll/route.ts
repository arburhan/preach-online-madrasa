import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Program from '@/lib/db/models/LongCourse';
import { requireAuth } from '@/lib/auth/rbac';
import { sendPaymentConfirmationEmail, sendEnrollmentWelcomeEmail } from '@/lib/email/mailer';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const user = await requireAuth();
        const { programId } = await params;

        await connectDB();

        // 1. Check if program exists
        const program = await Program.findById(programId);
        if (!program) {
            return NextResponse.json({ error: 'প্রোগ্রাম পাওয়া যায়নি' }, { status: 404 });
        }

        // 1b. Block direct enrollment for paid programs — must go through payment
        if (!program.isFree && (program.discountPrice || program.price) > 0) {
            return NextResponse.json(
                { error: 'এই প্রোগ্রামটি পেইড। পেমেন্ট সম্পন্ন করুন।' },
                { status: 402 }
            );
        }

        // 2. Check if already enrolled
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const student: any = await Student.findById((user as any).id || (user as any)._id);

        if (!student) {
            return NextResponse.json({ error: 'শিক্ষার্থী পাওয়া যায়নি' }, { status: 404 });
        }

        const isEnrolled = student?.enrolledPrograms?.some(
            (enrollment: { program: { toString: () => string; }; }) => enrollment.program?.toString() === programId
        );

        if (isEnrolled) {
            return NextResponse.json({ message: 'আপনি ইতিমধ্যে এনরোল করেছেন', isEnrolled: true });
        }

        // 3. Enroll student
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await Student.findByIdAndUpdate((user as any).id || (user as any)._id, {
            $push: {
                enrolledPrograms: {
                    program: programId,
                    enrolledAt: new Date(),
                },
            },
        });

        // 4. Send enrollment emails (free program)
        const studentName = student?.name || 'শিক্ষার্থী';
        const studentEmail = student?.email || '';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        if (studentEmail) {
            // Email 1: Payment confirmation (free = 0 amount)
            sendPaymentConfirmationEmail({
                studentName,
                studentEmail,
                courseName: program.titleBn,
                amount: 0,
                transactionId: 'FREE',
                invoiceNumber: `FREE-${Date.now()}`,
                paymentDate: new Date(),
            }).catch(err => console.error('Payment email error:', err));

            // Email 2: Enrollment welcome
            setTimeout(() => {
                sendEnrollmentWelcomeEmail({
                    studentName,
                    studentEmail,
                    courseName: program.titleBn,
                    amount: 0,
                    courseUrl: `${baseUrl}/student/programs/${programId}`,
                }).catch(err => console.error('Enrollment email error:', err));
            }, 3000);
        }

        return NextResponse.json({ message: 'এনরোলমেন্ট সফল হয়েছে', isEnrolled: true });

    } catch (error) {
        console.error('Program enrollment error:', error);
        return NextResponse.json(
            { error: 'এনরোল করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
