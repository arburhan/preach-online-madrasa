import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User, { UserRole } from '@/lib/db/models/User';

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
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন');
                }

                await connectDB();

                // Find user by email with password field
                const user = await User.findOne({ email: credentials.email }).select(
                    '+password'
                );

                if (!user) {
                    throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি');
                }

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
                if (user.role === UserRole.TEACHER && !user.isTeacherApproved) {
                    throw new Error(
                        'আপনার শিক্ষক অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।'
                    );
                }

                return {
                    id: user._id.toString(),
                    email: user.email!,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    isTeacherApproved: user.isTeacherApproved,
                };
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                await connectDB();

                // Check if user exists
                let existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    // Create new user from Google OAuth
                    existingUser = await User.create({
                        name: user.name || 'User',
                        email: user.email || '',
                        image: user.image || undefined,
                        provider: 'google',
                        providerId: account.providerAccountId,
                        role: UserRole.STUDENT, // Default role
                    });
                } else if (existingUser.provider !== 'google') {
                    // User exists with credentials, link Google account
                    existingUser.provider = 'google';
                    existingUser.providerId = account.providerAccountId;
                    if (user.image) existingUser.image = user.image;
                    await existingUser.save();
                }

                // Check if teacher is approved
                if (
                    existingUser.role === UserRole.TEACHER &&
                    !existingUser.isTeacherApproved
                ) {
                    return false; // Prevent sign in for unapproved teachers
                }

                // Attach role and teacher approval to user object
                user.role = existingUser.role;
                user.id = existingUser._id.toString();
                user.isTeacherApproved = existingUser.isTeacherApproved;
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
