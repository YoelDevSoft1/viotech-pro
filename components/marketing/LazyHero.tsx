"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load del componente Hero que usa framer-motion
const Hero = dynamic(() => import("./Hero").then((mod) => ({ default: mod.default })), {
  loading: () => (
    <div className="relative min-h-screen flex items-center justify-center px-6 pt-6 pb-4 md:pt-10 md:pb-6">
      <div className="max-w-[90vw] mx-auto space-y-8">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-32 w-full max-w-4xl mx-auto" />
        <Skeleton className="h-24 w-full max-w-2xl mx-auto" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    </div>
  ),
  ssr: false, // framer-motion funciona mejor en cliente
});

export default Hero;

