import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, Users, Clock, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: Video,
      title: "লাইভ অনলাইন ক্লাস",
      description: "অভিজ্ঞ উস্তাযদের সাথে সরাসরি লাইভ ক্লাসে অংশগ্রহণ করুন",
    },
    {
      icon: BookOpen,
      title: "মানসম্মত কোর্স",
      description: "কুরআন, হাদিস এবং ইসলামিক জ্ঞানের সঠিক শিক্ষা",
    },
    {
      icon: Clock,
      title: "সুবিধাজনক সময়",
      description: "আপনার সুবিধামত যেকোনো সময় ক্লাস দেখুন এবং শিখুন",
    },
    {
      icon: Award,
      title: "সার্টিফিকেট",
      description: "কোর্স সম্পন্ন করে স্বীকৃত সার্টিফিকেট অর্জন করুন",
    },
    {
      icon: Users,
      title: "অভিজ্ঞ শিক্ষক",
      description: "যোগ্য এবং অভিজ্ঞ উস্তাযদের তত্ত্বাবধানে শিক্ষা গ্রহণ",
    },
    {
      icon: Shield,
      title: "শরীয়ত সম্মত",
      description: "সম্পূর্ণ শরীয়ত অনুমোদিত পদ্ধতিতে শিক্ষা প্রদান",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-primary">ইসলামিক শিক্ষায়</span>
              <br />
              আলোকিত হোন
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              বাংলাদেশের প্রথম সম্পূর্ণ অনলাইন মাদ্রাসা প্ল্যাটফর্ম। ঘরে বসে কুরআন, হাদিস এবং
              ইসলামিক শিক্ষা লাভ করুন অভিজ্ঞ উস্তাযদের সাথে।
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/courses">
                <Button size="lg" className="w-full sm:w-auto">
                  এনরোল করুন
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  আরও জানুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              আমাদের বিশেষত্ব
            </h2>
            <p className="text-lg text-muted-foreground">
              কেন আপনি আমাদের প্ল্যাটফর্ম বেছে নেবেন
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

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">আজই শুরু করুন আপনার ইসলামিক শিক্ষা যাত্রা</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            বিনামূল্যে নিবন্ধন করুন এবং শত শত কোর্সে প্রবেশাধিকার পান
          </p>
          <Link href="/auth/signup">
            <Button size="lg">
              এখনই শুরু করুন
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
