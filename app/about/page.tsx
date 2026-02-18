import { Metadata } from 'next';
import { seoUrl } from '@/lib/seo';
import Image from 'next/image';
import {
    BookOpen,
    Users,
    GraduationCap,
    Target,
    Heart,
    Award,
    CheckCircle,
    Star,
    Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'আমাদের সম্পর্কে',
    description: 'ইসলামিক অনলাইন একাডেমি - বাংলাদেশের বিশ্বস্ত অনলাইন ইসলামিক শিক্ষা প্ল্যাটফর্ম। আমাদের মিশন, ভিশন এবং কর্মধারা সম্পর্কে জানুন।',
    openGraph: {
        title: 'আমাদের সম্পর্কে - ইসলামিক অনলাইন একাডেমি',
        description: 'আমাদের মিশন, ভিশন এবং কর্মধারা সম্পর্কে জানুন।',
        url: seoUrl('/about'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/about'),
    },
};

const stats = [
    { value: '১০০০+', label: 'শিক্ষার্থী', icon: Users },
    { value: '৫০+', label: 'কোর্স', icon: BookOpen },
    { value: '২০+', label: 'অভিজ্ঞ শিক্ষক', icon: GraduationCap },
    { value: '৯৫%', label: 'সন্তুষ্টি', icon: Star },
];

const features = [
    {
        icon: BookOpen,
        title: 'সহীহ ইসলামিক জ্ঞান',
        description: 'কুরআন ও সহীহ হাদিসের আলোকে প্রমাণিত ইসলামিক জ্ঞান শিক্ষা দেওয়া হয়।',
    },
    {
        icon: Users,
        title: 'অভিজ্ঞ আলেম উস্তাযগণ',
        description: 'দেশের স্বনামধন্য মাদ্রাসা থেকে সনদপ্রাপ্ত অভিজ্ঞ আলেম উস্তাযগণ পাঠদান করেন।',
    },
    {
        icon: Globe,
        title: 'যেকোনো সময়, যেকোনো স্থান',
        description: 'ইন্টারনেট সংযোগ থাকলে বিশ্বের যেকোনো প্রান্ত থেকে শিখতে পারবেন।',
    },
    {
        icon: Award,
        title: 'সার্টিফিকেট প্রদান',
        description: 'কোর্স সম্পন্ন করার পর যাচাইযোগ্য সার্টিফিকেট প্রদান করা হয়।',
    },
];

const values = [
    'সততা ও বিশ্বস্ততা',
    'জ্ঞান ভিত্তিক শিক্ষা',
    'সুন্নাহ অনুসরণ',
    'সহজ ও সাবলীল পাঠদান',
    'আধুনিক প্রযুক্তির ব্যবহার',
    'শিক্ষার্থী কেন্দ্রিক সেবা',
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-linear-to-br from-[#3fdaa6] via-[#b3f2d4] to-[#3fdaa6] py-8 md:py-18">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
                            <Image src="/icon.svg" alt="Islamic Online Academy Logo" width={60} height={60} className='rounded-3xl' />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-black">
                            ইসলামিক অনলাইন একাডেমি
                        </h1>
                        <p className="text-lg md:text-xl text-blue-950 leading-relaxed">
                            বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন ইসলামিক শিক্ষা প্ল্যাটফর্ম।
                            আমরা সহীহ ইসলামিক জ্ঞান সহজ ও আধুনিক উপায়ে সকলের কাছে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
                            <br />
                            আলহামদুলিল্লাহ ! আমাদের  রয়েছে ২০ বছরের অধিক সময়ে শিক্ষকতা ও মাদ্রাসা পরিচালনার অভিজ্ঞতা। উলামায়ে কেরামের তত্ত্বাবধানে ঢাকার প্রাণকেন্দ্র মিরপুর-১০-এ মাদরাসাতুদ দাওয়াহ- এর আয়োজনে সকল বয়স-শ্রেণির মানুষের জন্য ঐশী নূর দ্বীন ইসলামের সুমহান শিক্ষার নির্যাস পাবেন।
                            সুযোগ পাবেন উস্তাদ ও উস্তাযার বরকতময় দ্বীনি সোহবতের।
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-card rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                                    <div className="text-muted-foreground">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Mission */}
                        <div className="bg-card rounded-2xl border p-8 hover:shadow-lg transition-shadow">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5">
                                <Target className="h-7 w-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">আমাদের মিশন</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                প্রযুক্তির সহায়তায় সহীহ ইসলামিক জ্ঞান সকলের কাছে সহজলভ্য করা।
                                আমরা চাই প্রতিটি মুসলিম তার দৈনন্দিন জীবনে ইসলামের সঠিক শিক্ষা অনুসরণ করতে পারেন।
                                অভিজ্ঞ আলেম উস্তাযগণের তত্ত্বাবধানে মানসম্মত শিক্ষা প্রদান করাই আমাদের লক্ষ্য।
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-card rounded-2xl border p-8 hover:shadow-lg transition-shadow">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-500/10 mb-5">
                                <Heart className="h-7 w-7 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">আমাদের ভিশন</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                একটি এমন প্ল্যাটফর্ম গড়ে তোলা যেখানে বিশ্বের যেকোনো প্রান্তের বাংলা ভাষাভাষী মুসলিম
                                সহজেই ইসলামিক জ্ঞান অর্জন করতে পারবেন। আমরা স্বপ্ন দেখি একটি জ্ঞান ভিত্তিক,
                                সচেতন মুসলিম সমাজ গঠনে অবদান রাখতে।
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">কেন ইসলামিক অনলাইন একাডেমি বেছে নেবেন?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            আমাদের প্ল্যাটফর্মের বিশেষ সুবিধাসমূহ
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow text-center">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                                        <Icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">আমাদের মূল্যবোধ</h2>
                            <p className="text-muted-foreground">
                                যে নীতিমালার উপর ভিত্তি করে আমরা কাজ করি
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {values.map((value, index) => (
                                <div key={index} className="flex items-center gap-3 bg-card rounded-lg border p-4 hover:bg-primary/5 transition-colors">
                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                    <span className="font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-linear-to-br from-primary/10 via-background to-accent/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        আজই শুরু করুন আপনার ইসলামিক শিক্ষা যাত্রা
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        বিনামূল্যে নিবন্ধন করুন এবং আমাদের কোর্সগুলো এক্সপ্লোর করুন
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/courses">
                            <Button size="lg" className="px-8">
                                <BookOpen className="mr-2 h-5 w-5" />
                                কোর্স দেখুন
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="px-8">
                                যোগাযোগ করুন
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
