"use client";

type Props = {
  className?: string;
};

export function Skeleton({ className }: Props) {
  return <div className={`animate-pulse rounded-md bg-muted ${className || "h-4 w-full"}`} />;
}
