import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
    return (
        <section className="border-t border-border bg-muted/50 py-16">
            <div className="container mx-auto px-4 text-center">
                <h2 className="mb-4 text-3xl font-bold">আজই শুরু করুন আপনার ইসলামিক শিক্ষা যাত্রা</h2>
                <p className="mb-8 text-lg text-muted-foreground">
                    বিনামূল্যে নিবন্ধন করুন এবং শত شত কোর্সে প্রবেশাধিকার পান
                </p>
                <Link href="/auth/signup">
                    <Button size="lg">
                        এখনই শুরু করুন
                    </Button>
                </Link>
            </div>
        </section>
    );
}
