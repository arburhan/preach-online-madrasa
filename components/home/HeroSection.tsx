import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    const ioaSpecial = [
        'নারী ও পুরুষদের পৃথক ক্লাসকক্ষ',
        'ঘরে বসে লাইভ / সুবিধাজনক ফ্রি সময়ে  রেকর্ড থেকে শেখা',
        'মেয়ে-দের উস্তাযা হিসেবে থাকবেন আলেমাগণ',
        'অনলাইনের পর্যায়ক্রমে দাওরায়ে হাদীস সম্পন্ন করার সুযোগ'
    ];
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-accent/10">
            <div className="container mx-auto px-4 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-primary to-accent py-5">
                        অনলাইনে ধর্মীয় শিক্ষা অর্জন করে আলেম/আলেমা হবার পথে অগ্রসর হওয়া কি সম্ভব?
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                        জেনারেল, শিক্ষিত, কর্মব্যস্ত ও পর্দানশীনদের জন্য Basic, Advance ও Expert- সকল লেভেলে ধাপে ধাপে সর্বোচ্চ দ্বীনি শিক্ষার আয়োজন করেছে IOA
                    </p>
                    {/* special */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {ioaSpecial.map((value, index) => (
                            <div key={index} className="flex items-center gap-3 bg-card rounded-lg border p-4 hover:bg-primary/5 transition-colors">
                                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/courses">
                            <Button size="lg" className="text-lg px-8">
                                কোর্স দেখুন
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button size="lg" variant="outline" className="text-lg px-8">
                                আরও জানুন
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -z-10 opacity-20">
                <div className="w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 -z-10 opacity-20">
                <div className="w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
            </div>
        </section>
    );
}
