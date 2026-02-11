import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricesLoading() {
  return (
    <div className="space-y-4 overflow-x-hidden">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-14" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-2 h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={`trend-${idx}`} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-2 h-4 w-36" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={`gainer-${idx}`} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Skeleton className="h-10 w-72" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
          <div className="hidden space-y-2 md:block">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={`row-${idx}`} className="h-14 w-full" />
            ))}
          </div>
          <div className="space-y-2 md:hidden">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={`card-${idx}`} className="h-28 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
