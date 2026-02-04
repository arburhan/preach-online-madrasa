import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-accent/10">
            <div className="container mx-auto px-4 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-primary to-accent py-5">
                        অনলাইনে ধর্মীয় শিক্ষা অর্জন করে আলেম/আলেমা হবার পথে অগ্রসর হওয়া কি সম্ভব?
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                        আলহামদুলিল্লাহ  ! আমাদের পরিচালিত বাংলাদেশ নৈশ মাদ্রাসা শিক্ষাবোর্ডে আমাদের অধীনে প্রতিবছর শতাধিক শিক্ষার্থী আলেম হয়ে দেশ-বিদেশে দ্বীনি ও দুনিয়াবি উৎকর্ষতা অর্জন করে প্রতিষ্ঠানের জন্য সুনাম বয়ে এনেছে ।
                    </p>
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
