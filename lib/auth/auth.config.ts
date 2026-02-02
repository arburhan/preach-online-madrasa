import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';
import Admin from '@/lib/db/models/Admin';

// User roles for session
export type UserRole = 'student' | 'teacher' | 'admin';

// Helper to find user across all models
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findUserByEmail(email: string, includePassword = false): Promise<{ user: any; role: UserRole } | null> {
    // Check Student
    let user = await Student.findOne({ email }).select(includePassword ? '+password' : '').lean();
    if (user) return { user, role: 'student' as UserRole };

    // Check Teacher
    user = await Teacher.findOne({ email }).select(includePassword ? '+password' : '').lean();
    if (user) return { user, role: 'teacher' as UserRole };

    // Check Admin
    user = await Admin.findOne({ email }).select(includePassword ? '+password' : '').lean();
    if (user) return { user, role: 'admin' as UserRole };

    return null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // Credentials Provider (Email & Password)
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async authorize(credentials: any) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন');
                }

                await connectDB();

                // Find user in any of the 3 models
                const result = await findUserByEmail(credentials.email as string, true);

                if (!result) {
                    throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি');
                }

                const { user, role } = result;

                // Check if user has a password (OAuth users don't have password)
                if (!user.password) {
                    throw new Error('এই ইমেইল দিয়ে Google লগইন ব্যবহার করুন');
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) {
                    throw new Error('ভুল পাসওয়ার্ড');
                }

                // Check if teacher is approved
                if (role === 'teacher' && !user.isApproved) {
                    throw new Error(
                        'আপনার শিক্ষক অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।'
                    );
                }

                return {
                    id: user._id.toString(),
                    email: user.email!,
                    name: user.name,
                    image: user.image,
                    role: role,
                    isTeacherApproved: role === 'teacher' ? user.isApproved : undefined,
                };
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                await connectDB();

                // Check if user exists in any model
                const result = await findUserByEmail(user.email!);

                if (!result) {
                    // Create new student by default for Google OAuth
                    const newStudent = await Student.create({
                        name: user.name || 'User',
                        email: user.email || '',
                        image: user.image || undefined,
                        provider: 'google',
                        providerId: account.providerAccountId,
                    });

                    user.role = 'student';
                    user.id = newStudent._id.toString();
                } else {
                    const { user: existingUser, role } = result;

                    // Update Google info if needed
                    if (existingUser.provider !== 'google') {
                        existingUser.provider = 'google';
                        existingUser.providerId = account.providerAccountId;
                        if (user.image) existingUser.image = user.image;
                        await existingUser.save();
                    }

                    // Check if teacher is approved
                    if (role === 'teacher' && !existingUser.isApproved) {
                        return false; // Prevent sign in for unapproved teachers
                    }

                    user.role = role;
                    user.id = existingUser._id.toString();
                    user.isTeacherApproved = role === 'teacher' ? existingUser.isApproved : undefined;
                }
            }

            return true;
        },

        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isTeacherApproved = user.isTeacherApproved;
            }

            // Update token on session update
            if (trigger === 'update' && session) {
                token.name = session.name;
                token.image = session.image;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.isTeacherApproved = token.isTeacherApproved as boolean | undefined;
            }
            return session;
        },
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
});
