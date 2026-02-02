'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Calendar,
    FileText,
    Library
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const navigation = [
    { name: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard },
    { name: 'ইউজার', href: '/admin/users', icon: Users },
    { name: 'শিক্ষক', href: '/admin/teachers', icon: GraduationCap },
    { name: 'লং কোর্স', href: '/admin/programs', icon: Library },
    { name: 'সেমিস্টার', href: '/admin/semesters', icon: Calendar },
    { name: 'পরীক্ষা', href: '/admin/exams', icon: FileText },
    { name: 'কোর্স', href: '/admin/courses', icon: BookOpen },
    { name: 'পরিসংখ্যান', href: '/admin/statistics', icon: BarChart3 },
    { name: 'সেটিংস', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r">
                    <div className="flex flex-col grow pt-5 overflow-y-auto">
                        {/* Logo/Title */}
                        <div className="flex items-center shrink-0 px-4 mb-6">
                            <div className="w-full">
                                <h1 className="text-xl font-bold text-purple-600">অ্যাডমিন প্যানেল</h1>
                                <p className="text-sm text-muted-foreground">অনলাইন ইসলামিক একাডেমি</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      transition-colors duration-150
                      ${isActive
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            }
                    `}
                                    >
                                        <Icon
                                            className={`
                        mr-3 h-5 w-5 shrink-0
                        ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}
                      `}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout Button */}
                        <div className="shrink-0 p-4 border-t">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                লগআউট
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="md:pl-64 flex flex-col flex-1">
                    <main className="flex-1">
                        <div className="py-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
