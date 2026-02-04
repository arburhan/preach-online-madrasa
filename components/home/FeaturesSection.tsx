import { BookOpen, Video, Award, Users, Clock, Shield } from "lucide-react";

const features = [
    {
        icon: Video,
        title: "ভিডিও ক্লাস",
        description: "প্রফেশনাল ভিডিও দ্বারা ইসলামিক শিক্ষা সহজভাবে বুঝুন",
    },
    {
        icon: BookOpen,
        title: "মানসম্পন্ন কোর্স",
        description: "বিশেষজ্ঞ উস্তাযদের তত্ত্বাবধানে তৈরি কোর্স",
    },
    {
        icon: Award,
        title: "সার্টিফিকেট",
        description: "কোর্স সম্পন্ন করে সার্টিফিকেট অর্জন করুন",
    },
    {
        icon: Users,
        title: "লাইভ সাপোর্ট",
        description: "যেকোনো সমস্যায় সরাসরি শিক্ষকদের সাথে যোগাযোগ",
    },
    {
        icon: Clock,
        title: "নমনীয় সময়",
        description: "আপনার সুবিধামত যেকোনো সময় শিখুন",
    },
    {
        icon: Shield,
        title: "নিরাপদ পরিবেশ",
        description: "সম্পূর্ণ নিরাপদ এবং ইসলাম-সম্মত শিক্ষা পরিবেশ",
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        আমাদের বিশেষত্ব
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        কেন আপনি IOA বেছে নেবেন
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
