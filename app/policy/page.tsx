import { Metadata } from 'next';
import { seoUrl } from '@/lib/seo';
import {
    ShieldCheck,
    Eye,
    Lock,
    Database,
    UserCheck,
    Cookie,
    Globe,
    Bell,
    Trash2,
    ArrowRight,
    Mail,
    Phone,
    MapPin,
    FileText,
    RotateCcw,
    BookOpen,
    Shield,
    Server,
    Key,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'গোপনীয়তা নীতি',
    description: 'ইসলামিক অনলাইন একাডেমি (IOA) এর গোপনীয়তা নীতি। আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখি তা জানুন।',
    openGraph: {
        title: 'গোপনীয়তা নীতি - ইসলামিক অনলাইন একাডেমি',
        description: 'আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও সুরক্ষা সম্পর্কে বিস্তারিত।',
        url: seoUrl('/policy'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/policy'),
    },
};

const sections = [
    {
        id: 'collection',
        icon: Database,
        title: 'তথ্য সংগ্রহ',
        description: 'আমরা যেসব তথ্য সংগ্রহ করি',
        items: [
            {
                subtitle: 'ব্যক্তিগত তথ্য',
                points: [
                    'নাম, ইমেইল, ফোন নম্বর - অ্যাকাউন্ট তৈরি ও যোগাযোগের জন্য।',
                    'লিঙ্গ (পুরুষ/মহিলা) - নির্দিষ্ট গ্রুপে যুক্ত করার জন্য।',
                    'পেমেন্ট তথ্য (বিকাশ/নগদ নম্বর) - কোর্স ফি প্রদানের জন্য।',
                    'প্রোফাইল ছবি (ঐচ্ছিক) - অ্যাকাউন্ট শনাক্তকরণের জন্য।',
                ],
            },
            {
                subtitle: 'স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য',
                points: [
                    'ডিভাইস তথ্য (ব্রাউজার, অপারেটিং সিস্টেম)।',
                    'আইপি অ্যাড্রেস ও লোকেশন তথ্য।',
                    'ওয়েবসাইটে কার্যকলাপ (কোন পেজ দেখেছেন, কতক্ষণ)।',
                    'কুকিজ ও অনুরূপ প্রযুক্তি থেকে প্রাপ্ত তথ্য।',
                ],
            },
        ],
    },
    {
        id: 'usage',
        icon: Eye,
        title: 'তথ্যের ব্যবহার',
        description: 'আমরা আপনার তথ্য যেভাবে ব্যবহার করি',
        items: [
            {
                subtitle: 'সেবা প্রদান',
                points: [
                    'আপনার অ্যাকাউন্ট তৈরি ও পরিচালনা করতে।',
                    'কোর্সে ভর্তি ও শিক্ষামূলক কন্টেন্ট প্রদান করতে।',
                    'পেমেন্ট প্রক্রিয়াকরণ ও রসিদ পাঠাতে।',
                    'আপনার সাথে কোর্স সংক্রান্ত যোগাযোগ করতে।',
                ],
            },
            {
                subtitle: 'উন্নতি ও বিশ্লেষণ',
                points: [
                    'প্ল্যাটফর্মের সেবার মান উন্নয়ন করতে।',
                    'ব্যবহারকারীর অভিজ্ঞতা বিশ্লেষণ ও উন্নত করতে।',
                    'নতুন ফিচার ও কোর্স পরিকল্পনা করতে।',
                    'প্রয়োজনে গুরুত্বপূর্ণ আপডেট ও নোটিফিকেশন পাঠাতে।',
                ],
            },
        ],
    },
    {
        id: 'protection',
        icon: Lock,
        title: 'তথ্য সুরক্ষা',
        description: 'আপনার তথ্য সুরক্ষিত রাখতে আমাদের ব্যবস্থা',
        items: [
            {
                subtitle: 'নিরাপত্তা ব্যবস্থা',
                points: [
                    'SSL/TLS এনক্রিপশনের মাধ্যমে ডাটা ট্রান্সমিশন সুরক্ষিত রাখা হয়।',
                    'পাসওয়ার্ড হ্যাশিং ও এনক্রিপ্টেড স্টোরেজ ব্যবহার করা হয়।',
                    'নিয়মিত সিকিউরিটি অডিট ও আপডেট পরিচালনা করা হয়।',
                    'শুধুমাত্র অনুমোদিত কর্মীরা ব্যক্তিগত তথ্যে প্রবেশ করতে পারেন।',
                ],
            },
        ],
    },
    {
        id: 'sharing',
        icon: Globe,
        title: 'তথ্য শেয়ারিং',
        description: 'তৃতীয় পক্ষের সাথে তথ্য শেয়ারিং নীতি',
        items: [
            {
                subtitle: 'আমরা আপনার তথ্য শেয়ার করি না, তবে ব্যতিক্রম:',
                points: [
                    'আইনগত বাধ্যবাধকতা থাকলে সরকারি সংস্থার কাছে।',
                    'পেমেন্ট প্রসেসিং এর জন্য অনুমোদিত পেমেন্ট গেটওয়ের সাথে।',
                    'আপনার স্পষ্ট সম্মতি সাপেক্ষে।',
                    'আমরা কখনোই বিজ্ঞাপনদাতা বা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।',
                ],
            },
        ],
    },
    {
        id: 'cookies',
        icon: Cookie,
        title: 'কুকিজ নীতি',
        description: 'কুকিজ ব্যবহার সম্পর্কে',
        items: [
            {
                subtitle: 'কুকিজ ব্যবহারের উদ্দেশ্য',
                points: [
                    'আপনার লগইন সেশন বজায় রাখতে।',
                    'আপনার পছন্দ ও সেটিংস মনে রাখতে।',
                    'ওয়েবসাইটের কার্যকারিতা উন্নত করতে।',
                    'আপনি আপনার ব্রাউজার থেকে কুকিজ নিষ্ক্রিয় করতে পারেন, তবে এতে কিছু সেবা সীমিত হতে পারে।',
                ],
            },
        ],
    },
    {
        id: 'rights',
        icon: UserCheck,
        title: 'আপনার অধিকার',
        description: 'আপনার ব্যক্তিগত তথ্যের উপর আপনার অধিকার',
        items: [
            {
                subtitle: 'আপনি যা করতে পারেন',
                points: [
                    'আপনার ব্যক্তিগত তথ্য দেখতে ও আপডেট করতে পারেন।',
                    'অপ্রয়োজনীয় ইমেইল/নোটিফিকেশন বন্ধ করতে পারেন।',
                    'আপনার অ্যাকাউন্ট ও তথ্য মুছে ফেলার অনুরোধ করতে পারেন।',
                    'আপনার তথ্য কিভাবে ব্যবহৃত হচ্ছে তা জানার অধিকার আছে।',
                ],
            },
        ],
    },
    {
        id: 'children',
        icon: Shield,
        title: 'শিশুদের গোপনীয়তা',
        description: 'শিশুদের তথ্য সুরক্ষা',
        items: [
            {
                subtitle: 'নীতিমালা',
                points: [
                    '১৩ বছরের কম বয়সী শিশুদের অভিভাবকের সম্মতি ছাড়া তথ্য সংগ্রহ করা হয় না।',
                    'অভিভাবকগণ যেকোনো সময় তাদের সন্তানের তথ্য মুছে ফেলার অনুরোধ করতে পারেন।',
                    'শিশুদের জন্য বিশেষ নিরাপত্তা ব্যবস্থা বজায় রাখা হয়।',
                ],
            },
        ],
    },
    {
        id: 'updates',
        icon: Bell,
        title: 'নীতি পরিবর্তন',
        description: 'এই গোপনীয়তা নীতি আপডেট সম্পর্কে',
        items: [
            {
                subtitle: 'পরিবর্তন সম্পর্কে',
                points: [
                    'IOA এই গোপনীয়তা নীতি যেকোনো সময় আপডেট করতে পারে।',
                    'গুরুত্বপূর্ণ পরিবর্তন হলে ইমেইল বা ওয়েবসাইটের মাধ্যমে জানানো হবে।',
                    'পরিবর্তিত নীতি ওয়েবসাইটে প্রকাশের সাথে সাথে কার্যকর হবে।',
                    'নিয়মিত এই পেজটি পরিদর্শন করার জন্য অনুরোধ করা হচ্ছে।',
                ],
            },
        ],
    },
];

const securityFeatures = [
    { icon: Lock, title: 'SSL এনক্রিপশন', description: 'সকল ডাটা ট্রান্সমিশন এনক্রিপ্টেড' },
    { icon: Key, title: 'সুরক্ষিত পাসওয়ার্ড', description: 'হ্যাশড ও এনক্রিপ্টেড স্টোরেজ' },
    { icon: Server, title: 'নিরাপদ সার্ভার', description: 'বিশ্বস্ত ক্লাউড সার্ভিসে হোস্টেড' },
    { icon: Shield, title: 'ডাটা প্রটেকশন', description: 'নিয়মিত সিকিউরিটি অডিট' },
];

export default function PolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-linear-to-br from-[#3fdaa6] via-[#b3f2d4] to-[#3fdaa6] py-8 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                            <ShieldCheck className="h-10 w-10 text-black" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-black">
                            গোপনীয়তা নীতি
                        </h1>
                        <p className="text-lg md:text-xl text-blue-950 leading-relaxed max-w-2xl mx-auto">
                            আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও সুরক্ষা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।
                            আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখি তা জানুন।
                        </p>
                        <p className="text-sm text-blue-900/70 mt-4">
                            সর্বশেষ আপডেট: ২২ এপ্রিল, ২০২৬
                        </p>
                    </div>
                </div>
            </div>

            {/* Security Features */}
            <div className="py-8 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {securityFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="bg-card rounded-xl border p-5 text-center hover:shadow-md transition-shadow">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="py-8">
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
            <div className="py-8 md:py-12">
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
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {section.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {section.items.map((item, iIndex) => (
                                            <div key={iIndex}>
                                                <h3 className="text-base font-semibold mb-3 text-foreground/90 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    {item.subtitle}
                                                </h3>
                                                <div className="space-y-2.5 mr-0 md:mr-4">
                                                    {item.points.map((point, pIndex) => (
                                                        <div key={pIndex} className="flex items-start gap-3">
                                                            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-1.5" />
                                                            <p className="text-muted-foreground leading-relaxed text-[15px]">
                                                                {point}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Data Deletion Request */}
            <div className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-2xl border p-6 md:p-8">
                            <div className="flex items-start gap-4 mb-5">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 shrink-0">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                                        তথ্য মুছে ফেলার অনুরোধ
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        আপনার সকল ব্যক্তিগত তথ্য মুছে ফেলতে চাইলে
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-red-500 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        আপনার অ্যাকাউন্ট ও সকল ব্যক্তিগত তথ্য স্থায়ীভাবে মুছে ফেলতে ইমেইলে অনুরোধ পাঠান। অনুরোধ পাওয়ার ৩০ দিনের মধ্যে প্রক্রিয়া সম্পন্ন করা হবে।
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-red-500 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        তথ্য মুছে ফেলার পর কোর্সে প্রবেশাধিকার সহ সকল সেবা বন্ধ হয়ে যাবে এবং পুনরুদ্ধার সম্ভব হবে না।
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-red-500 shrink-0 mt-1.5" />
                                    <p className="text-muted-foreground text-[15px] leading-relaxed">
                                        আইনগত বাধ্যবাধকতা থাকলে কিছু তথ্য নির্দিষ্ট সময় পর্যন্ত সংরক্ষণ করা হতে পারে।
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
                                গোপনীয়তা সংক্রান্ত প্রশ্ন?
                            </h2>
                            <p className="text-center text-muted-foreground mb-6">
                                আপনার তথ্যের গোপনীয়তা নিয়ে কোনো প্রশ্ন থাকলে যোগাযোগ করুন
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
                                    <Link href="/refund">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <RotateCcw className="h-4 w-4" />
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
