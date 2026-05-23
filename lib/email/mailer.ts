import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORDS,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: `"ইসলামিক অনলাইন একাডেমি" <${process.env.GOOGLE_EMAIL}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ইসলামিক অনলাইন একাডেমি</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 32px;">
                    <h2 style="color: #18181b; margin: 0 0 16px;">ইমেইল ভেরিফিকেশন</h2>
                    <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                        আপনার অ্যাকাউন্ট তৈরি হয়েছে। অনুগ্রহ করে নিচের বাটনে ক্লিক করে আপনার ইমেইল ভেরিফাই করুন।
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${verificationUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); 
                                  color: white; text-decoration: none; padding: 14px 32px; 
                                  border-radius: 8px; font-weight: 600; font-size: 16px;">
                            ইমেইল ভেরিফাই করুন
                        </a>
                    </div>
                    
                    <p style="color: #71717a; font-size: 14px; margin: 24px 0 0;">
                        যদি বাটন কাজ না করে, এই লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:
                    </p>
                    <p style="color: #7c3aed; font-size: 14px; word-break: break-all; margin: 8px 0 0;">
                        ${verificationUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
                    
                    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                        এই লিংক ২৪ ঘন্টা পর্যন্ত বৈধ। যদি আপনি এই অ্যাকাউন্ট তৈরি না করে থাকেন, এই ইমেইল উপেক্ষা করুন।
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: 'ইমেইল ভেরিফিকেশন -ইসলামিক অনলাইন একাডেমি',
        html,
    });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ইসলামিক অনলাইন একাডেমি</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 32px;">
                    <h2 style="color: #18181b; margin: 0 0 16px;">পাসওয়ার্ড রিসেট</h2>
                    <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                        আপনি পাসওয়ার্ড রিসেট এর অনুরোধ করেছেন। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); 
                                  color: white; text-decoration: none; padding: 14px 32px; 
                                  border-radius: 8px; font-weight: 600; font-size: 16px;">
                            পাসওয়ার্ড রিসেট করুন
                        </a>
                    </div>
                    
                    <p style="color: #71717a; font-size: 14px; margin: 24px 0 0;">
                        যদি বাটন কাজ না করে, এই লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:
                    </p>
                    <p style="color: #7c3aed; font-size: 14px; word-break: break-all; margin: 8px 0 0;">
                        ${resetUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
                    
                    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                        এই লিংক ১ ঘন্টা পর্যন্ত বৈধ। যদি আপনি এই অনুরোধ না করে থাকেন, এই ইমেইল উপেক্ষা করুন।
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: 'পাসওয়ার্ড রিসেট - ইসলামিক অনলাইন একাডেমি',
        html,
    });
}

// ==================== Payment & Enrollment Emails ====================

interface PaymentConfirmationData {
    studentName: string;
    studentEmail: string;
    courseName: string;
    amount: number;
    transactionId: string;
    invoiceNumber: string;
    paymentDate: Date;
}

/**
 * Email 1: পেমেন্ট সফল — ট্রানজেকশন রিসিপ্ট
 */
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData): Promise<boolean> {
    const formattedDate = new Intl.DateTimeFormat('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka',
    }).format(data.paymentDate);

    const html = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
                    <h1 style="color: white; margin: 0; font-size: 22px;">পেমেন্ট সফল হয়েছে!</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 32px;">
                    <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px; font-size: 16px;">
                        প্রিয় <strong>${data.studentName}</strong>,
                    </p>
                    <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                        আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। নিচে আপনার ট্রানজেকশনের বিস্তারিত তথ্য দেওয়া হলো:
                    </p>
                    
                    <!-- Transaction Details Table -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                        <h3 style="color: #0f172a; margin: 0 0 16px; font-size: 16px; border-bottom: 2px solid #059669; padding-bottom: 8px;">
                            💳 ট্রানজেকশন বিবরণ
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">ইনভয়েস নম্বর</td>
                                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: left;">${data.invoiceNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">ট্রানজেকশন আইডি</td>
                                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: left;">${data.transactionId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">পরিমাণ</td>
                                <td style="padding: 8px 0; color: #059669; font-size: 18px; font-weight: 700; text-align: left;">৳${data.amount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">কোর্স</td>
                                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: left;">${data.courseName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">তারিখ ও সময়</td>
                                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: left;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">স্ট্যাটাস</td>
                                <td style="padding: 8px 0; text-align: left;">
                                    <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">সম্পন্ন ✓</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin: 16px 0 0;">
                        এই ইমেইলটি আপনার পেমেন্ট রিসিপ্ট হিসেবে সংরক্ষণ করুন। কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
                    
                    <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                        ইসলামিক অনলাইন একাডেমি — পেমেন্ট গেটওয়ে: Paystation
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: data.studentEmail,
        subject: `✅ পেমেন্ট সফল — ৳${data.amount} | ${data.invoiceNumber}`,
        html,
    });
}

interface EnrollmentWelcomeData {
    studentName: string;
    studentEmail: string;
    courseName: string;
    amount: number;
    courseUrl: string;
}

/**
 * Email 2: কোর্স এনরোলমেন্ট স্বাগত ও শুভকামনা
 */
export async function sendEnrollmentWelcomeEmail(data: EnrollmentWelcomeData): Promise<boolean> {
    const html = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 8px;">🎓</div>
                    <h1 style="color: white; margin: 0; font-size: 22px;">কোর্সে স্বাগতম!</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 32px;">
                    <p style="color: #52525b; line-height: 1.8; margin: 0 0 16px; font-size: 16px;">
                        আসসালামু আলাইকুম <strong>${data.studentName}</strong>,
                    </p>
                    
                    <p style="color: #52525b; line-height: 1.8; margin: 0 0 24px;">
                        আলহামদুলিল্লাহ! আপনি সফলভাবে নিচের কোর্সে নথিভুক্ত হয়েছেন:
                    </p>
                    
                    <!-- Enrollment Info -->
                    <div style="background: linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%); border: 1px solid #e9d5ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">📚 কোর্স</td>
                                <td style="padding: 10px 0; color: #7c3aed; font-size: 16px; font-weight: 700; text-align: left;">${data.courseName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">💰 মূল্য</td>
                                <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: left;">৳${data.amount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">👤 শিক্ষার্থী</td>
                                <td style="padding: 10px 0; color: #0f172a; font-size: 14px; text-align: left;">${data.studentName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">✉️ ইমেইল</td>
                                <td style="padding: 10px 0; color: #0f172a; font-size: 14px; text-align: left;">${data.studentEmail}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${data.courseUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); 
                                  color: white; text-decoration: none; padding: 14px 40px; 
                                  border-radius: 8px; font-weight: 600; font-size: 16px;">
                            📖 কোর্স শুরু করুন
                        </a>
                    </div>
                    
                    <!-- Wishes -->
                    <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                        <p style="color: #854d0e; font-size: 15px; margin: 0; line-height: 1.8;">
                            🌟 আল্লাহ সুবহানাহু ওয়া তা'আলা আপনার ইলমের পথকে সহজ করুন।<br>
                            দ্বীনের এই পথে আপনার যাত্রা বরকতময় হোক।<br>
                            <strong>জাযাকাল্লাহু খাইরান! 🤲</strong>
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
                    
                    <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                        ইসলামিক অনলাইন একাডেমি — ইলম অর্জনের সহজ পথ
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: data.studentEmail,
        subject: `🎓 "${data.courseName}" কোর্সে স্বাগতম — ইসলামিক অনলাইন একাডেমি`,
        html,
    });
}
