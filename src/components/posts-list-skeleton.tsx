import {Skeleton} from '@/components/skeleton'

export function PostsListSkeleton() {
    return (
        <div className="space-y-12">
            {Array.from({length: 2}).map((_, groupIdx) => (
                <section key={groupIdx}>
                    <div className="flex items-baseline gap-4 mb-6">
                        <Skeleton className="h-3 w-12"/>
                        <span className="flex-1 border-t border-border"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        {Array.from({length: 4}).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <Skeleton className="aspect-[16/10] w-full rounded-lg"/>
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-3 w-24"/>
                                    <Skeleton className="h-5 w-3/4"/>
                                    <Skeleton className="h-4 w-full mt-1"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
