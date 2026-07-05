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
        // For API routes, return JSON error instead of redirect
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Role-based access control
    if (session?.user) {
        const userRole = session.user.role;

        // Admin routes - only admins
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            if (pathname.startsWith('/api/admin')) {
                return NextResponse.json(
                    { error: 'অ্যাক্সেস অস্বীকৃত' },
                    { status: 403 }
                );
            }
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

    // Protected API routes - require authentication
    const protectedApiRoutes = [
        '/api/admin',
        '/api/notes',
        '/api/progress',
    ];

    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
    if (isProtectedApi && !session?.user) {
        return NextResponse.json(
            { error: 'অননুমোদিত অ্যাক্সেস' },
            { status: 401 }
        );
    }

    // Admin API routes - require admin or teacher role
    if (pathname.startsWith('/api/admin') && session?.user) {
        const role = session.user.role;
        if (!['admin', 'teacher'].includes(role)) {
            return NextResponse.json(
                { error: 'অ্যাক্সেস অস্বীকৃত' },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/student/:path*',
        '/teacher/:path*',
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/courses/:path*',
        '/api/lessons/:path*',
        '/api/notes/:path*',
        '/api/progress/:path*',
    ],
};
