import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-accent/10">
            <div className="container mx-auto px-4 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-primary to-accent py-5">
                        অনলাইন ইসলামিক শিক্ষা প্ল্যাটফর্ম
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                        ঘরে বসে কুরআন, হাদিস এবং ইসলামিক জ্ঞান অর্জন করুন। বিশেষজ্ঞ
                        উস্তাযদের কাছ থেকে মানসম্পন্ন শিক্ষা লাভ করুন।
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
