import { Metadata } from 'next';
import { seoUrl } from '@/lib/seo';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageCircle,
    Send,
    Facebook,
    Youtube,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'যোগাযোগ',
    description: 'আমাদের সাথে যোগাযোগ করুন। প্রশ্ন, পরামর্শ বা সাহায্যের জন্য আমরা সর্বদা প্রস্তুত।',
    openGraph: {
        title: 'যোগাযোগ - ইসলামিক অনলাইন একাডেমি',
        description: 'আমাদের সাথে যোগাযোগ করুন। প্রশ্ন, পরামর্শ বা সাহায্যের জন্য আমরা সর্বদা প্রস্তুত।',
        url: seoUrl('/contact'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/contact'),
    },
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-linear-to-br from-[#3fdaa6] via-[#b3f2d4] to-[#3fdaa6] py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                        <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">যোগাযোগ করুন</h1>
                    <p className="text-lg text-blue-950 max-w-2xl mx-auto">
                        আমরা আপনার প্রশ্ন ও পরামর্শ শুনতে আগ্রহী। যেকোনো বিষয়ে আমাদের সাথে যোগাযোগ করুন।
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Contact Form */}
                    <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Send className="h-6 w-6 text-primary" />
                            মেসেজ পাঠান
                        </h2>
                        <form className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2">আপনার নাম *</label>
                                    <input
                                        type="text"
                                        placeholder="পূর্ণ নাম"
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ইমেইল *</label>
                                    <input
                                        type="email"
                                        placeholder="example@email.com"
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">ফোন নম্বর</label>
                                <input
                                    type="tel"
                                    placeholder="+880 1XXX-XXXXXX"
                                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">বিষয় *</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                >
                                    <option value="">বিষয় নির্বাচন করুন</option>
                                    <option value="enrollment">ভর্তি সংক্রান্ত</option>
                                    <option value="course">কোর্স সম্পর্কে</option>
                                    <option value="technical">টেকনিক্যাল সমস্যা</option>
                                    <option value="payment">পেমেন্ট সংক্রান্ত</option>
                                    <option value="suggestion">পরামর্শ</option>
                                    <option value="other">অন্যান্য</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">আপনার মেসেজ *</label>
                                <textarea
                                    rows={5}
                                    placeholder="আপনার মেসেজ এখানে লিখুন..."
                                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                                    required
                                />
                            </div>
                            <Button type="submit" size="lg" className="w-full">
                                <Send className="mr-2 h-5 w-5" />
                                মেসেজ পাঠান
                            </Button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        {/* Contact Cards */}
                        <div className="bg-card rounded-2xl border shadow-sm p-6">
                            <h2 className="text-2xl font-bold mb-6">যোগাযোগের তথ্য</h2>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">ইমেইল</h3>
                                        <a href="mailto:info@ioa.bd" className="text-muted-foreground hover:text-primary transition-colors">
                                            info@ioa.bd
                                        </a>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            সাধারণত ২৪ ঘন্টার মধ্যে উত্তর দেওয়া হয়
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-500/10 shrink-0">
                                        <Phone className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">ফোন</h3>
                                        <a href="tel:+8801XXXXXXXXX" className="text-muted-foreground hover:text-primary transition-colors">
                                            +880 1XXX-XXXXXX
                                        </a>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            শনি - বৃহস্পতি, সকাল ১০টা - রাত ৮টা
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-500/10 shrink-0">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">ঠিকানা</h3>
                                        <p className="text-muted-foreground">
                                            ঢাকা, বাংলাদেশ
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-orange-500/10 shrink-0">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">অফিস সময়</h3>
                                        <p className="text-muted-foreground">
                                            শনিবার - বৃহস্পতিবার
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            সকাল ১০:০০ - রাত ৮:০০
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-card rounded-2xl border shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">সোশ্যাল মিডিয়া</h2>
                            <p className="text-muted-foreground mb-4">
                                আমাদের সোশ্যাল মিডিয়াতে ফলো করুন এবং সর্বশেষ আপডেট পান
                            </p>
                            <div className="flex gap-3">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Facebook className="h-5 w-5" />
                                    Facebook
                                </a>
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                    <Youtube className="h-5 w-5" />
                                    YouTube
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-bold">সাহায্য দরকার?</h2>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                প্রায়শই জিজ্ঞাসিত প্রশ্নগুলো দেখুন অথবা আমাদের লাইভ চ্যাটে যোগাযোগ করুন।
                            </p>
                            <a href="/faq" className="inline-flex items-center text-primary hover:underline font-medium">
                                FAQ পেজ দেখুন →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
