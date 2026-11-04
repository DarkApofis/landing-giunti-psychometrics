import { CatalogSection } from '@/components/sections/CatalogSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Hero } from '@/components/sections/Hero';
import { TrustStrip } from '@/components/sections/TrustStrip';

/** Mandatory order: Header (layout) → Hero → Catalogue → [trust strip] → Contact → Footer (layout). */
export default function Home() {
  return (
    <>
      <Hero />
      <CatalogSection />
      <TrustStrip />
      <ContactSection />
    </>
  );
}
