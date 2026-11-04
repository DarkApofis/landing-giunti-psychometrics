import { SECTION_IDS } from '@/data/navigation';
import { site } from '@/data/site';

/**
 * Temporary footer: provides the <footer> landmark and the #risorse anchor.
 * The full footer (columns, social links) is PLAN task 5.13.
 */
export function Footer() {
  return (
    <footer id={SECTION_IDS.resources} className="on-dark bg-ink text-white">
      <div className="container-page py-10">
        <p className="font-display text-lg font-bold">{site.name}</p>
        <p className="mt-2 text-sm text-primary-subtle">
          © {site.copyrightYear} {site.legalName} — sito dimostrativo, dati fittizi.
        </p>
      </div>
    </footer>
  );
}
