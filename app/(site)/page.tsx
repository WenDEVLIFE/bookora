import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturedServices } from "@/components/marketing/featured-services";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { StaffHighlights } from "@/components/marketing/staff-highlights";
import { Testimonials } from "@/components/marketing/testimonials";

export const metadata: Metadata = {
  title: { absolute: "Bookora — Smart scheduling. Seamless experiences." },
  description:
    "Book hair, nails, skin, massage, and wellness appointments at Bookora Studio. Choose a service, pick a professional, and reserve a time in minutes.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <HowItWorks />
      <StaffHighlights />
      <Testimonials />
      <CtaSection />
    </>
  );
}
