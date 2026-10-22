import type { Icon } from "@solar-icons/react/lib/types";
import {
  HeartPulseIcon,
  LeafIcon,
  MagicWandIcon,
  ScissorsIcon,
  SunIcon,
} from "@/components/icons";
import { CATEGORY_STYLES } from "@/lib/constants";
import type { ServiceCategory } from "@/lib/types";

export interface CategoryMeta {
  icon: Icon;
  tileClassName: string;
  accentClassName: string;
}

export const CATEGORY_META: Record<ServiceCategory, CategoryMeta> = {
  Hair: {
    icon: ScissorsIcon,
    tileClassName: CATEGORY_STYLES.Hair.gradient,
    accentClassName: CATEGORY_STYLES.Hair.accent,
  },
  Nails: {
    icon: MagicWandIcon,
    tileClassName: CATEGORY_STYLES.Nails.gradient,
    accentClassName: CATEGORY_STYLES.Nails.accent,
  },
  Skin: {
    icon: SunIcon,
    tileClassName: CATEGORY_STYLES.Skin.gradient,
    accentClassName: CATEGORY_STYLES.Skin.accent,
  },
  Massage: {
    icon: HeartPulseIcon,
    tileClassName: CATEGORY_STYLES.Massage.gradient,
    accentClassName: CATEGORY_STYLES.Massage.accent,
  },
  Wellness: {
    icon: LeafIcon,
    tileClassName: CATEGORY_STYLES.Wellness.gradient,
    accentClassName: CATEGORY_STYLES.Wellness.accent,
  },
};

export const CATEGORY_INCLUDES: Record<ServiceCategory, string[]> = {
  Hair: [
    "Consultation before the service begins",
    "Wash and finishing styling",
    "Product guidance for aftercare",
  ],
  Nails: [
    "Shaping and cuticle care",
    "Long-wear base and top coat",
    "Shade selection with your therapist",
  ],
  Skin: [
    "Skin check and treatment plan",
    "Cleanse, exfoliation, and hydration",
    "Aftercare recommendations",
  ],
  Massage: [
    "Pressure and focus-area consultation",
    "Treatment in a private room",
    "Time to settle before you leave",
  ],
  Wellness: [
    "Personalized oil or scent blend",
    "Unhurried full-body session",
    "Aftercare and hydration notes",
  ],
};
