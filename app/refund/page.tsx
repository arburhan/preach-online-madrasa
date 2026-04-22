import { Metadata } from 'next';
import { seoUrl } from '@/lib/seo';
import {
    RotateCcw,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    CreditCard,
    MessageCircle,
    HelpCircle,
    FileCheck,
    ArrowRight,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    FileText,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'রিফান্ড পলিসি',
    description: 'ইসলামিক অনলাইন একাডেমি (IOA) এর রিফান্ড ও ফেরত নীতিমালা। কোর্স ফি রিফান্ড সংক্রান্ত বিস্তারিত নিয়মাবলী জানুন।',
    openGraph: {
        title: 'রিফান্ড পলিসি - ইসলামিক অনলাইন একাডেমি',
        description: 'কোর্স ফি রিফান্ড সংক্রান্ত বিস্তারিত নিয়মাবলী।',
        url: seoUrl('/refund'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/refund'),
    },
};

const eligibleReasons = [
    'কোর্স শুরু হওয়ার পূর্বে রিফান্ডের আবেদন করলে সম্পূর্ণ ফি ফেরত দেওয়া হবে।',
    'কোর্স শুরু হওয়ার ৩ দিনের মধ্যে আবেদন করলে ফি থেকে প্রসেসিং চার্জ কেটে বাকি অর্থ ফেরত দেওয়া হবে।',
    'প্রযুক্তিগত সমস্যার কারণে কোর্সের ভিডিও বা কন্টেন্ট অ্যাক্সেস করতে না পারলে এবং সমস্যা সমাধান সম্ভব না হলে।',
    'IOA কর্তৃক কোনো কোর্স বাতিল করা হলে সম্পূর্ণ ফি ফেরত দেওয়া হবে।',
    'ভুলবশত একই কোর্সে দুইবার পেমেন্ট করলে অতিরিক্ত অর্থ ফেরত দেওয়া হবে।',
];

const ineligibleReasons = [
    'কোর্স শুরু হওয়ার ৩ দিন পর রিফান্ডের আবেদন করলে।',
    'কোর্সের ৩০% বা তার বেশি কন্টেন্ট দেখে থাকলে।',
    'শিক্ষার্থীর ব্যক্তিগত কারণে (যেমন: সময়ের অভাব, আগ্রহ হারানো) কোর্স ছেড়ে দিলে।',
    'ডিসকাউন্ট বা প্রমোশনাল মূল্যে কোর্স কেনার ক্ষেত্রে (যদি অফারে রিফান্ড না থাকে)।',
    'বিনামূল্যের কোর্সের ক্ষেত্রে।',
    'আচরণবিধি লঙ্ঘনের কারণে অ্যাকাউন্ট বাতিল হলে।',
];

const steps = [
    {
        step: '১',
        title: 'আবেদন জমা',
        description: 'ইমেইল বা ফোনের মাধ্যমে রিফান্ডের আবেদন জমা দিন। আবেদনে আপনার নাম, ফোন নম্বর, কোর্সের নাম ও পেমেন্ট তথ্য উল্লেখ করুন।',
        icon: FileCheck,
    },
    {
        step: '২',
        title: 'যাচাই প্রক্রিয়া',
        description: 'আমাদের টিম আপনার আবেদন পর্যালোচনা করবে এবং রিফান্ডের যোগ্যতা যাচাই করবে। এই প্রক্রিয়ায় ৩-৫ কর্মদিবস সময় লাগতে পারে।',
        icon: HelpCircle,
    },
    {
        step: '৩',
        title: 'সিদ্ধান্ত জানানো',
        description: 'আবেদন অনুমোদিত বা প্রত্যাখ্যান হলে আপনাকে ইমেইল/ফোনে জানানো হবে।',
        icon: MessageCircle,
    },
    {
        step: '৪',
        title: 'রিফান্ড প্রদান',
        description: 'অনুমোদিত রিফান্ড মূল পেমেন্ট মাধ্যমে (বিকাশ/নগদ) ৭-১০ কর্মদিবসের মধ্যে ফেরত দেওয়া হবে।',
        icon: CreditCard,
    },
];

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-linear-to-br from-[#3fdaa6] via-[#b3f2d4] to-[#3fdaa6] py-8 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                            <RotateCcw className="h-10 w-10 text-black" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-black">
                            রিফান্ড পলিসি
                        </h1>
                        <p className="text-lg md:text-xl text-blue-950 leading-relaxed max-w-2xl mx-auto">
                            শিক্ষার্থীদের সুবিধার্থে আমাদের রিফান্ড নীতিমালা স্বচ্ছ ও সুষ্পষ্ট। নিচে বিস্তারিত জানুন।
                        </p>
                        <p className="text-sm text-blue-900/70 mt-4">
                            সর্বশেষ আপডেট: ২২ এপ্রিল, ২০২৬
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Highlight */}
            <div className="py-8 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-card rounded-xl border p-5 text-center hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl font-bold text-primary mb-1">৩ দিন</div>
                                <div className="text-sm text-muted-foreground">রিফান্ড আবেদনের সময়সীমা</div>
                            </div>
                            <div className="bg-card rounded-xl border p-5 text-center hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl font-bold text-primary mb-1">৭-১০ দিন</div>
                                <div className="text-sm text-muted-foreground">রিফান্ড প্রদানের সময়</div>
                            </div>
                            <div className="bg-card rounded-xl border p-5 text-center hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl font-bold text-primary mb-1">১০০%</div>
                                <div className="text-sm text-muted-foreground">কোর্স শুরুর আগে ফেরত</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Eligible & Ineligible Sections */}
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Eligible */}
                        <div className="bg-card rounded-2xl border p-6 md:p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 shrink-0">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                        যেসব ক্ষেত্রে রিফান্ড পাওয়া যাবে
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        নিচের যেকোনো শর্ত পূরণ হলে রিফান্ডের জন্য আবেদন করতে পারবেন
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {eligibleReasons.map((reason, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 border border-green-100/50">
                                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                        <p className="text-muted-foreground text-[15px] leading-relaxed">
                                            {reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ineligible */}
                        <div className="bg-card rounded-2xl border p-6 md:p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 shrink-0">
                                    <XCircle className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                        যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        নিচের ক্ষেত্রগুলোতে রিফান্ড আবেদন গ্রহণযোগ্য হবে না
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {ineligibleReasons.map((reason, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100/50">
                                        <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-muted-foreground text-[15px] leading-relaxed">
                                            {reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund Process */}
            <div className="py-12 md:py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">রিফান্ড প্রক্রিয়া</h2>
                            <p className="text-muted-foreground">কিভাবে রিফান্ডের আবেদন করবেন — ধাপে ধাপে</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {steps.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.step}
                                        className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow relative"
                                    >
                                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-bold text-primary">{item.step}</span>
                                        </div>
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Notes */}
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-6 md:p-8">
                            <div className="flex items-start gap-4 mb-5">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 shrink-0">
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                        গুরুত্বপূর্ণ তথ্য
                                    </h2>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        রিফান্ড প্রসেসিং এ ৫% সার্ভিস চার্জ কাটা হতে পারে (কোর্স শুরুর পর আবেদনের ক্ষেত্রে)।
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        রিফান্ড সংক্রান্ত চূড়ান্ত সিদ্ধান্ত IOA কর্তৃপক্ষের উপর নির্ভরশীল।
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        বিশেষ পরিস্থিতিতে (গুরুতর অসুস্থতা ইত্যাদি) যুক্তিসঙ্গত প্রমাণসাপেক্ষে রিফান্ড বিবেচনা করা হতে পারে।
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        IOA এই রিফান্ড পলিসি যেকোনো সময় পরিবর্তন করার অধিকার সংরক্ষণ করে।
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact & Related Links */}
            <div className="py-12 bg-linear-to-br from-primary/10 via-background to-accent/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-2xl border p-6 md:p-8">
                            <h2 className="text-2xl font-bold mb-4 text-center">
                                রিফান্ডের আবেদন করতে চান?
                            </h2>
                            <p className="text-center text-muted-foreground mb-6">
                                নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span>info@ioa.bd</span>
                                </div>
                                <span className="hidden sm:block text-muted-foreground">•</span>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span>+8809613-000020</span>
                                </div>
                            </div>

                            {/* Related Pages */}
                            <div className="border-t pt-6">
                                <p className="text-sm text-center text-muted-foreground mb-4">সম্পর্কিত পেজসমূহ</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Link href="/terms">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <FileText className="h-4 w-4" />
                                            শর্তাবলী
                                        </Button>
                                    </Link>
                                    <Link href="/policy">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            গোপনীয়তা নীতি
                                        </Button>
                                    </Link>
                                    <Link href="/contact">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <MapPin className="h-4 w-4" />
                                            যোগাযোগ
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
