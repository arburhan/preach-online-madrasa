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
            from: `"প্রিচ অনলাইন মাদ্রাসা" <${process.env.GOOGLE_EMAIL}>`,
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
                    <h1 style="color: white; margin: 0; font-size: 24px;">প্রিচ অনলাইন মাদ্রাসা</h1>
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
                    <h1 style="color: white; margin: 0; font-size: 24px;">প্রিচ অনলাইন মাদ্রাসা</h1>
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
