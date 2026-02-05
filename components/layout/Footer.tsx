'use client';

import Link from 'next/link';
import {
    Facebook,
    Youtube,
    Mail,
    Phone,
    MapPin,
    BookOpen,
    Heart,
    ArrowUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const quickLinks = [
    { name: 'হোম', href: '/' },
    { name: 'কোর্সসমূহ', href: '/courses' },
    { name: 'প্রোগ্রামসমূহ', href: '/programs' },
    { name: 'ব্লগ', href: '/blogs' },
    { name: 'প্রশ্নোত্তর', href: '/faq' },
];

const legalLinks = [
    { name: 'গোপনীয়তা নীতি', href: '/privacy' },
    { name: 'শর্তাবলী', href: '/terms' },
    { name: 'রিফান্ড পলিসি', href: '/refund' },
];

const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-500' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-500' },
];

export default function Footer() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative bg-linear-to-br from-primary/10 via-background to-accent/10 border-t">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-accent to-primary" />

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4 group">
                            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">IOA</h3>
                                <p className="text-xs text-muted-foreground">অনলাইন মাদ্রাসা</p>
                            </div>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            সহীহ ইসলামিক জ্ঞান অর্জনের জন্য আধুনিক ও বিশ্বস্ত প্ল্যাটফর্ম।
                            অভিজ্ঞ আলেমগণের তত্ত্বাবধানে উন্নতমানের কোর্স।
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-2.5 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground ${social.color} hover:border-primary/30 transition-all hover:scale-110`}
                                        aria-label={social.name}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-primary rounded-full" />
                            দ্রুত লিংক
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-primary rounded-full" />
                            আইনি তথ্য
                        </h4>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/donation"
                                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                    দান করুন
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-primary rounded-full" />
                            যোগাযোগ
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="mailto:info@preach.com"
                                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mt-0.5">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground/70">ইমেইল</span>
                                        <p className="text-sm">info@preach.com</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+8801XXXXXXXXX"
                                    className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mt-0.5">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground/70">ফোন</span>
                                        <p className="text-sm">+880 1XXX-XXXXXX</p>
                                    </div>
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-muted-foreground">
                                <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground/70">ঠিকানা</span>
                                    <p className="text-sm">ঢাকা, বাংলাদেশ</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/50 bg-muted/30">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            © {currentYear} ইসলামিক অনলাইন একাডেমি। সর্বস্বত্ব সংরক্ষিত।
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            <span>ভালোবাসায় তৈরি</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-label="উপরে যান"
            >
                <ArrowUp className="h-5 w-5" />
            </button>
        </footer>
    );
}
