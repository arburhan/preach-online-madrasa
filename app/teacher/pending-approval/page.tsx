export default function TeacherPendingApproval() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="max-w-md text-center">
                <div className="mb-6">
                    <div className="mx-auto h-24 w-24 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <svg
                            className="h-12 w-12 text-amber-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">অনুমোদনের অপেক্ষায়</h1>
                <p className="text-muted-foreground mb-6">
                    আপনার প্রশিক্ষক অ্যাকাউন্ট এখনও অনুমোদিত হয়নি। অনুগ্রহ করে অ্যাডমিন অনুমোদনের জন্য
                    অপেক্ষা করুন।
                </p>
                <p className="text-sm text-muted-foreground">
                    আপনার অ্যাকাউন্ট অনুমোদিত হলে আপনি ইমেইলে বিজ্ঞপ্তি পাবেন।
                </p>
            </div>
        </div>
    );
}
