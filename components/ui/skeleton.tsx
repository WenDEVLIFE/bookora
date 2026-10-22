import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonRounded = "sm" | "md" | "full";

const ROUNDED_CLASSES: Record<SkeletonRounded, string> = {
  sm: "rounded-sm",
  md: "rounded-card",
  full: "rounded-full",
};

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: SkeletonRounded;
}

export function Skeleton({
  rounded = "md",
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-elevated",
        ROUNDED_CLASSES[rounded],
        className,
      )}
      {...props}
    />
  );
}
