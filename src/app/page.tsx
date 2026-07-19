import { SiteShell } from "@/components/layout/SiteShell";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SpreadsSection } from "@/components/home/SpreadsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ClosingSection } from "@/components/home/ClosingSection";

export default function HomePage() {
  return (
    <SiteShell>
      <main>
        <HeroSection />
        <ServicesSection />
        <SpreadsSection />
        <HowItWorksSection />
        <ClosingSection />
      </main>
    </SiteShell>
  );
}
