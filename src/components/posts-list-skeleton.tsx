import { Skeleton } from "@/components/ui/skeleton"

export function PostsListSkeleton() {
  return (
    <div className="space-y-12 md:space-y-16">
      {Array.from({ length: 10 }).map((_, index) => (
        <article key={index} className="space-y-4">
          <Skeleton className="h-4 w-24" /> {/* Date skeleton */}
          <Skeleton className="h-8 w-3/4" /> {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div> {/* Excerpt skeleton */}
        </article>
      ))}
    </div>
  )
}