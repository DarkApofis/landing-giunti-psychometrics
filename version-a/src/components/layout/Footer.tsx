import { ArrowUp } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { footerColumns, footerCopy, legalLinks, socialLinks, type FooterLink } from '@/data/footer';
import { SECTION_IDS } from '@/data/navigation';
import { site } from '@/data/site';
import { CatalogLink } from './CatalogLink';
import { CopyrightYear } from './CopyrightYear';

const linkClass =
  'inline-flex min-h-11 items-center rounded-sm text-primary-subtle underline-offset-4 transition-colors duration-(--duration-fast) hover:text-white hover:underline';

function FooterAnchor({ link }: { link: FooterLink }) {
  return link.category ? (
    <CatalogLink href={link.href} category={link.category} className={linkClass}>
      {link.label}
    </CatalogLink>
  ) : (
    <a href={link.href} className={linkClass}>
      {link.label}
    </a>
  );
}

/**
 * Footer (DESIGN-SPEC §6.10): ink background, white/primary-subtle text (≥ 11:1),
 * 1 → 2 → 4 columns. `#risorse` is the anchor of the "Risorse" nav item.
 */
export function Footer() {
  return (
    <footer id={SECTION_IDS.resources} className="on-dark bg-ink text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo tone="on-dark" />
          <p className="mt-4 max-w-sm text-sm text-primary-subtle">{footerCopy.tagline}</p>
          <ul className="mt-6 flex gap-2" aria-label="Social network">
            {socialLinks.map((social) => (
              <li key={social.network}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} su ${social.label} (si apre in una nuova scheda)`}
                  className="grid size-11 place-items-center rounded-full border border-white/25 text-white transition-colors duration-(--duration-fast) hover:border-white hover:bg-white/10"
                >
                  <SocialIcon network={social.network} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.title} aria-labelledby={`footer-${column.title}`}>
            <h2
              id={`footer-${column.title}`}
              className="font-display text-sm font-semibold tracking-(--text-eyebrow--letter-spacing) text-white uppercase"
            >
              {column.title}
            </h2>
            <ul className="mt-2 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <FooterAnchor link={link} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-primary-subtle md:flex-row md:items-center md:justify-between">
          <div>
            <p>
              © <CopyrightYear /> {site.legalName} — progetto dimostrativo.
            </p>
            <p className="mt-1">{footerCopy.disclaimer}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5">
            <ul className="flex flex-wrap gap-x-5" aria-label="Note legali">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <FooterAnchor link={link} />
                </li>
              ))}
            </ul>
            <a
              href={`#${SECTION_IDS.main}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium text-white hover:underline"
            >
              {footerCopy.backToTop}
              <ArrowUp aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
