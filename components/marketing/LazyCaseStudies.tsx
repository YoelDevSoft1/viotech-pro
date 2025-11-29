"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load del componente CaseStudies
const CaseStudies = dynamic(() => import("./CaseStudies").then((mod) => ({ default: mod.default })), {
  loading: () => (
    <section className="py-32 px-6">
      <div className="max-w-[90vw] mx-auto">
        <div className="text-center mb-24">
          <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-6" />
          <Skeleton className="h-8 w-full max-w-xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </section>
  ),
  ssr: false,
});

export default CaseStudies;

