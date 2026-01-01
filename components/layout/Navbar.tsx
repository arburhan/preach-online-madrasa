"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // This will be replaced with actual session check later
    const isLoggedIn = false;
    const userRole = null; // 'student' | 'teacher' | 'admin'

    const navLinks = [
        { href: "/", label: "হোম" },
        { href: "/courses", label: "কোর্সসমূহ" },
        { href: "/teachers", label: "উস্তাযগণ" },
        { href: "/about", label: "আমাদের সম্পর্কে" },
        { href: "/contact", label: "যোগাযোগ" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold text-primary">প্রিচ অনলাইন মাদ্রাসা</span>
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

                {/* Auth Buttons - Desktop */}
                <div className="hidden items-center gap-3 md:flex">
                    {isLoggedIn ? (
                        <>
                            <Link href={`/${userRole}/dashboard`}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    ড্যাশবোর্ড
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="gap-2">
                                <LogOut className="h-4 w-4" />
                                লগআউট
                            </Button>
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
                                    <Link href={`/${userRole}/dashboard`}>
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <User className="h-4 w-4" />
                                            ড্যাশবোর্ড
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-start gap-2">
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
