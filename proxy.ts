import { auth } from '@/lib/auth/auth.config';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
    const session = await auth();

    const { pathname } = request.nextUrl;

    // Protected routes for authenticated users
    const protectedRoutes = ['/student', '/teacher', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // If accessing protected route without session, redirect to signin
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Role-based access control
    if (session?.user) {
        const userRole = session.user.role;

        // Admin routes - only admins
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Teacher routes - only teachers and admins
        if (pathname.startsWith('/teacher') && !['teacher', 'admin'].includes(userRole)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Student routes - only students (teachers and admins can also access)
        if (pathname.startsWith('/student') && !['student', 'teacher', 'admin'].includes(userRole)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/student/:path*',
        '/teacher/:path*',
        '/admin/:path*',
        '/api/courses/:path*',
        '/api/lessons/:path*',
        '/api/notes/:path*',
        '/api/progress/:path*',
    ],
};
