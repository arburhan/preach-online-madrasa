export default function WatchLessonLoading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Top Nav Skeleton */}
            <div className="border-b bg-card px-4 py-3">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player Skeleton */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video bg-muted rounded-xl animate-pulse flex items-center justify-center">
                            <svg className="h-16 w-16 text-muted-foreground/20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>

                        {/* Title Skeleton */}
                        <div className="space-y-2 pt-2">
                            <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
                            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                        </div>

                        {/* Navigation Buttons Skeleton */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
                            <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
                        </div>
                    </div>

                    {/* Sidebar Playlist Skeleton */}
                    <div className="hidden lg:block">
                        <div className="bg-card rounded-xl border p-4 space-y-3">
                            <div className="h-5 w-32 rounded bg-muted animate-pulse mb-4" />
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-4 w-full rounded bg-muted animate-pulse" />
                                        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
