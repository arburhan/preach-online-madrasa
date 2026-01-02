import { auth } from '@/lib/auth/auth.config';
import { UserRole } from '@/lib/db/models/User';
import { redirect } from 'next/navigation';

/**
 * Get the current user session on the server
 */
export async function getSession() {
    return await auth();
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

/**
 * Require authentication - redirect to signin if not authenticated
 */
export async function requireAuth() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    return session.user;
}

/**
 * Require specific role - redirect if user doesn't have the role
 */
export async function requireRole(allowedRoles: UserRole[]) {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role)) {
        redirect('/unauthorized');
    }

    return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole(UserRole.ADMIN);
}

/**
 * Check if user is teacher
 */
export async function isTeacher(): Promise<boolean> {
    return hasRole(UserRole.TEACHER);
}

/**
 * Check if user is student
 */
export async function isStudent(): Promise<boolean> {
    return hasRole(UserRole.STUDENT);
}

/**
 * Require admin role
 */
export async function requireAdmin() {
    return await requireRole([UserRole.ADMIN]);
}

/**
 * Require teacher role
 */
export async function requireTeacher() {
    return await requireRole([UserRole.TEACHER]);
}

/**
 * Require student role
 */
export async function requireStudent() {
    return await requireRole([UserRole.STUDENT]);
}

/**
 * Require teacher or admin role
 */
export async function requireTeacherOrAdmin() {
    return await requireRole([UserRole.TEACHER, UserRole.ADMIN]);
}
