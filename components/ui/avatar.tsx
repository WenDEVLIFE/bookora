import { cn, initials } from "@/lib/utils";

const GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-brand",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-rose-500",
  "from-rose-500 to-violet-500",
];

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASSES;

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash + name.charCodeAt(index)) % GRADIENTS.length;
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-1 ring-white/10",
        GRADIENTS[hash],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
