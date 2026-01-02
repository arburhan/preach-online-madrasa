// Extend NextAuth types to include custom properties
import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from '@/lib/db/models/User';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            isTeacherApproved?: boolean;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        role: UserRole;
        isTeacherApproved?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        isTeacherApproved?: boolean;
    }
}
