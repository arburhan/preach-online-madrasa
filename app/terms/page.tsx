import { Metadata } from 'next';
import { seoUrl } from '@/lib/seo';
import {
    FileText,
    Users,
    ShieldCheck,
    BookOpen,
    AlertTriangle,
    CreditCard,
    Ban,
    Scale,
    RefreshCw,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'শর্তাবলী',
    description: 'ইসলামিক অনলাইন একাডেমি (IOA) এর ব্যবহারের শর্তাবলী। আমাদের প্ল্যাটফর্ম ব্যবহারের পূর্বে অনুগ্রহ করে শর্তাবলী পড়ুন।',
    openGraph: {
        title: 'শর্তাবলী - ইসলামিক অনলাইন একাডেমি',
        description: 'আমাদের প্ল্যাটফর্ম ব্যবহারের শর্তাবলী সম্পর্কে বিস্তারিত জানুন।',
        url: seoUrl('/terms'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/terms'),
    },
};

const sections = [
    {
        id: 'acceptance',
        icon: ShieldCheck,
        title: 'শর্তাবলী গ্রহণ',
        content: [
            'ইসলামিক অনলাইন একাডেমি (IOA) এর ওয়েবসাইট ও সেবা ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে।',
            'আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে একমত না হন, তাহলে অনুগ্রহ করে আমাদের সেবা ব্যবহার থেকে বিরত থাকুন।',
            'আমরা যেকোনো সময় এই শর্তাবলী আপডেট করার অধিকার রাখি। পরিবর্তিত শর্তাবলী ওয়েবসাইটে প্রকাশের পর থেকে কার্যকর হবে।',
        ],
    },
    {
        id: 'registration',
        icon: Users,
        title: 'নিবন্ধন ও অ্যাকাউন্ট',
        content: [
            'আমাদের প্ল্যাটফর্মে কোর্সে ভর্তি হতে একটি অ্যাকাউন্ট তৈরি করতে হবে। নিবন্ধনের সময় সঠিক ও হালনাগাদ তথ্য প্রদান করতে হবে।',
            'আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখা আপনার দায়িত্ব। পাসওয়ার্ড গোপন রাখুন এবং অন্য কাউকে আপনার অ্যাকাউন্ট ব্যবহার করতে দেবেন না।',
            'একটি ফোন নম্বর দিয়ে শুধুমাত্র একটি অ্যাকাউন্ট তৈরি করা যাবে। একই ব্যক্তির একাধিক অ্যাকাউন্ট তৈরি করা নিষিদ্ধ।',
            'ভুল বা মিথ্যা তথ্য প্রদান করলে অ্যাকাউন্ট স্থগিত বা বাতিল করার অধিকার কর্তৃপক্ষ সংরক্ষণ করে।',
        ],
    },
    {
        id: 'courses',
        icon: BookOpen,
        title: 'কোর্স ও শিক্ষা সংক্রান্ত',
        content: [
            'কোর্সের ভিডিও, নোট, অ্যাসাইনমেন্ট এবং অন্যান্য শিক্ষামূলক উপকরণ IOA এর মেধাস্বত্ব দ্বারা সুরক্ষিত।',
            'কোর্সের কন্টেন্ট ডাউনলোড, কপি, শেয়ার বা পুনরায় বিতরণ করা সম্পূর্ণ নিষিদ্ধ। এটি করলে আইনি ব্যবস্থা নেওয়া হতে পারে।',
            'কোর্সে ভর্তির পর নির্ধারিত সময়সীমার মধ্যে কোর্স সম্পন্ন করতে হবে। সময়সীমা কোর্স ভেদে ভিন্ন হতে পারে।',
            'কোর্সের সিলেবাস, সময়সূচি ও পাঠদান পদ্ধতিতে প্রয়োজনে পরিবর্তন আনার অধিকার IOA সংরক্ষণ করে।',
            'শিক্ষার্থীদের নিয়মিত ক্লাসে অংশগ্রহণ ও অ্যাসাইনমেন্ট জমা দিতে উৎসাহিত করা হয়।',
        ],
    },
    {
        id: 'payment',
        icon: CreditCard,
        title: 'পেমেন্ট ও ফি',
        content: [
            'কোর্সের ফি কোর্সের পেজে উল্লেখ করা হয়। পেমেন্ট সম্পূর্ণ হলেই কোর্সে প্রবেশাধিকার পাওয়া যাবে।',
            'পেমেন্ট বিকাশ, নগদ বা অন্যান্য অনুমোদিত মাধ্যমে গ্রহণ করা হয়।',
            'কোর্সের মূল্য পরিবর্তনের অধিকার IOA সংরক্ষণ করে। তবে ইতিমধ্যে ভর্তি হওয়া শিক্ষার্থীদের উপর এটি প্রযোজ্য হবে না।',
            'কোনো প্রমোশনাল অফার বা ডিসকাউন্ট নির্দিষ্ট সময়ের জন্য এবং নির্দিষ্ট শর্তসাপেক্ষে প্রযোজ্য।',
        ],
    },
    {
        id: 'conduct',
        icon: Ban,
        title: 'আচরণবিধি',
        content: [
            'শিক্ষক ও অন্যান্য শিক্ষার্থীদের সাথে সম্মানজনক আচরণ করতে হবে।',
            'কোনো প্রকার অশ্লীল, আপত্তিকর বা ইসলাম বিরোধী বক্তব্য বা আচরণ করা যাবে না।',
            'প্ল্যাটফর্মে কোনো রাজনৈতিক, বিভেদমূলক বা বিতর্কিত বিষয়ে আলোচনা বা প্রচারণা চালানো নিষিদ্ধ।',
            'WhatsApp গ্রুপে একাডেমি সম্পর্কিত বিষয় ছাড়া অন্য কোনো বিষয়ে মেসেজ পাঠানো যাবে না।',
            'আচরণবিধি লঙ্ঘন করলে সতর্কতা প্রদান, অ্যাকাউন্ট স্থগিত বা স্থায়ীভাবে বাতিল করা হতে পারে।',
        ],
    },
    {
        id: 'intellectual',
        icon: Scale,
        title: 'মেধাস্বত্ব',
        content: [
            'IOA এর সকল কন্টেন্ট, লোগো, ডিজাইন, টেক্সট, গ্রাফিক্স, ভিডিও এবং অন্যান্য উপকরণ IOA এর মেধাস্বত্ব দ্বারা সুরক্ষিত।',
            'ব্যক্তিগত শিক্ষার উদ্দেশ্য ছাড়া কোনো কন্টেন্ট ব্যবহার, পুনরুৎপাদন বা বিতরণ করা যাবে না।',
            'IOA এর লিখিত অনুমতি ছাড়া কোনো কন্টেন্ট বাণিজ্যিকভাবে ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।',
        ],
    },
    {
        id: 'liability',
        icon: AlertTriangle,
        title: 'দায়সীমাবদ্ধতা',
        content: [
            'প্রযুক্তিগত সমস্যা, সার্ভার ডাউনটাইম বা ইন্টারনেট সংযোগজনিত কারণে সেবা বিঘ্নিত হলে IOA দায়ী থাকবে না।',
            'তৃতীয় পক্ষের ওয়েবসাইটের লিংক থাকলে সেগুলোর বিষয়বস্তু বা নীতির জন্য IOA দায়ী নয়।',
            'কোর্স সম্পন্ন করার পর শিক্ষার্থীর ব্যক্তিগত বা পেশাগত ফলাফলের জন্য IOA কোনো গ্যারান্টি প্রদান করে না।',
        ],
    },
    {
        id: 'changes',
        icon: RefreshCw,
        title: 'পরিবর্তন ও সমাপ্তি',
        content: [
            'IOA যেকোনো সময় এই শর্তাবলী পরিবর্তন, সংশোধন বা আপডেট করার অধিকার সংরক্ষণ করে।',
            'গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে শিক্ষার্থীদের ইমেইল বা নোটিফিকেশনের মাধ্যমে জানানো হবে।',
            'শর্তাবলী লঙ্ঘনের ক্ষেত্রে IOA যেকোনো অ্যাকাউন্ট বা সেবা বন্ধ করার অধিকার রাখে।',
        ],
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-linear-to-br from-[#3fdaa6] via-[#b3f2d4] to-[#3fdaa6] py-8 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                            <FileText className="h-10 w-10 text-black" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-black">
                            শর্তাবলী
                        </h1>
                        <p className="text-lg md:text-xl text-blue-950 leading-relaxed max-w-2xl mx-auto">
                            ইসলামিক অনলাইন একাডেমি (IOA) এর সেবা ব্যবহারের পূর্বে অনুগ্রহ করে নিচের শর্তাবলী মনোযোগ সহকারে পড়ুন।
                        </p>
                        <p className="text-sm text-blue-900/70 mt-4">
                            সর্বশেষ আপডেট: ২২ এপ্রিল, ২০২৬
                        </p>
                    </div>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="py-8 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-2xl border p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                সূচিপত্র
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {sections.map((section, index) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-primary/5 transition-colors group"
                                    >
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {section.title}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    className="bg-card rounded-2xl border p-6 md:p-8 hover:shadow-lg transition-shadow scroll-mt-24"
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-primary/70 uppercase tracking-wide">
                                                ধারা {index + 1}
                                            </span>
                                            <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                                {section.title}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="space-y-3 mr-0 md:mr-4">
                                        {section.content.map((paragraph, pIndex) => (
                                            <div key={pIndex} className="flex items-start gap-3">
                                                <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-1.5" />
                                                <p className="text-muted-foreground leading-relaxed text-[15px]">
                                                    {paragraph}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contact & Related Links */}
            <div className="py-12 bg-linear-to-br from-primary/10 via-background to-accent/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-2xl border p-6 md:p-8">
                            <h2 className="text-2xl font-bold mb-4 text-center">
                                প্রশ্ন আছে?
                            </h2>
                            <p className="text-center text-muted-foreground mb-6">
                                শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন
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
                                    <Link href="/policy">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            গোপনীয়তা নীতি
                                        </Button>
                                    </Link>
                                    <Link href="/refund">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            রিফান্ড পলিসি
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
