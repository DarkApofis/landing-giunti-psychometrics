import { CatalogSection } from '@/components/sections/CatalogSection';
import { Hero } from '@/components/sections/Hero';
import { SECTION_IDS } from '@/data/navigation';

export default function Home() {
  return (
    <>
      <Hero />
      <CatalogSection />

      {/* Temporary anchor so navigation can be verified; replaced by PLAN tasks 5.11–5.12. */}
      <section
        id={SECTION_IDS.contact}
        aria-labelledby="contatti-title"
        className="container-page min-h-[40vh] py-16"
      >
        <h2 id="contatti-title" className="text-h2 font-bold">
          Contatti
        </h2>
        <p className="mt-2 text-ink-muted">Il modulo di contatto è in costruzione.</p>
      </section>
    </>
  );
}
