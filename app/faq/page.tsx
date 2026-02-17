import { Metadata } from 'next';
import FAQSection from '@/components/faq/FAQSection';
import { seoUrl } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'সাধারণ জিজ্ঞাসা',
    description: 'IOA সম্পর্কে সাধারণ প্রশ্ন ও উত্তর। ভর্তি প্রক্রিয়া, পেমেন্ট, ক্লাস সময়সূচী এবং আরও অনেক কিছু জানুন।',
    keywords: ['FAQ', 'IOA', 'ইসলামিক শিক্ষা', 'অনলাইন একাডেমি', 'ভর্তি', 'প্রশ্ন-উত্তর'],
    openGraph: {
        title: 'সাধারণ জিজ্ঞাসা - ইসলামিক অনলাইন একাডেমি',
        description: 'IOA সম্পর্কে সাধারণ প্রশ্ন ও উত্তর।',
        url: seoUrl('/faq'),
        type: 'website',
    },
    alternates: {
        canonical: seoUrl('/faq'),
    },
};

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-linear-to-b from-background to-secondary/20">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 md:py-20">
                {/* Islamic Pattern Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30z M30 6L54 30L30 54L6 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }} />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Decorative Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                            <svg
                                className="w-8 h-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                />
                            </svg>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            সাধারণ <span className="text-primary">জিজ্ঞাসা</span>
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            আইওএ সম্পর্কে আপনার সকল প্রশ্নের উত্তর এখানে পাবেন।
                            <br />
                            <span className="text-primary font-medium">ইলম অন্বেষণের এ চলমান ভুবনে আপনার জন্য শুভকামনা!</span>
                        </p>
                    </div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
            </section>

            {/* FAQ Section - All Questions */}
            <FAQSection />

            {/* Contact CTA Section */}
            <section className="py-12 bg-primary/5 border-t border-primary/10">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-foreground mb-3">
                            আপনার প্রশ্ন এখানে নেই?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            আমাদের সাথে সরাসরি যোগাযোগ করুন
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="https://wa.me/8801700000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp করুন
                            </a>
                            <a
                                href="mailto:info@ioa.edu.bd"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                ইমেইল করুন
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
