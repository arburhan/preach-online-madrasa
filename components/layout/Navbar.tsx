"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: session, status } = useSession();

    const isLoggedIn = status === "authenticated";
    const user = session?.user;
    const userRole = user?.role || 'student';

    const navLinks = [
        { href: "/", label: "হোম" },
        { href: "/courses", label: "কোর্সসমূহ" },
        { href: "/teachers", label: "উস্তাযগণ" },
        { href: "/about", label: "আমাদের সম্পর্কে" },
        { href: "/contact", label: "যোগাযোগ" },
    ];

    const getDashboardLink = () => {
        if (userRole === 'admin') return '/admin';
        if (userRole === 'teacher') return '/teacher';
        return '/student';
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold text-primary">ইসলামিক অনলাইন একাডেমি</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-6 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons / User Menu - Desktop */}
                <div className="hidden items-center gap-3 md:flex">
                    {isLoggedIn ? (
                        <>
                            <Link href={getDashboardLink()}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    ড্যাশবোর্ড
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                                            <AvatarFallback>
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {user?.role !== 'admin' && <DropdownMenuItem asChild>
                                        <Link href="/student/profile" className="cursor-pointer">
                                            <UserCircle className="mr-2 h-4 w-4" />
                                            প্রোফাইল
                                        </Link>
                                    </DropdownMenuItem>}
                                    <DropdownMenuItem asChild>
                                        <Link href={getDashboardLink()} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            ড্যাশবোর্ড
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        লগআউট
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin">
                                <Button variant="ghost" size="sm">
                                    লগইন
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm">নিবন্ধন করুন</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="border-t border-border bg-background md:hidden">
                    <div className="container mx-auto space-y-3 px-4 py-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="flex flex-col gap-2 border-t border-border pt-4">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/student/profile">
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <UserCircle className="h-4 w-4" />
                                            প্রোফাইল
                                        </Button>
                                    </Link>
                                    <Link href={getDashboardLink()}>
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            ড্যাশবোর্ড
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        লগআউট
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/signin" className="w-full">
                                        <Button variant="ghost" className="w-full">
                                            লগইন
                                        </Button>
                                    </Link>
                                    <Link href="/auth/signup" className="w-full">
                                        <Button className="w-full">নিবন্ধন করুন</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
