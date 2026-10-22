import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function LogoMark({ size = 32, className, priority = false }: LogoMarkProps) {
  return (
    <Image
      src="/bookora-mark.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      aria-hidden="true"
      className={cn("shrink-0 select-none", className)}
    />
  );
}

export interface WordmarkProps {
  className?: string;
  compact?: boolean;
  priority?: boolean;
}

export function Wordmark({
  className,
  compact = false,
  priority = false,
}: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={32} priority={priority} />
      <span className="flex flex-col leading-none">
        <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">
          Bookora
        </span>
        {compact ? null : (
          <span className="mt-1 text-[0.5625rem] font-medium uppercase tracking-[0.24em] text-ink-muted">
            Studio
          </span>
        )}
      </span>
    </span>
  );
}
