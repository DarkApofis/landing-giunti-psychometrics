import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import { CatalogLink } from '@/components/layout/CatalogLink';
import { buttonClasses } from '@/components/ui/Button';
import { SECTION_IDS } from '@/data/navigation';
import { infoPageCopy, infoSectionLinks, type InfoBlock, type InfoPage } from '@/data/pages';
import { cn } from '@/lib/cn';

const eyebrowClass =
  'font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-accent-strong uppercase';
const cardClass = 'rounded-lg border border-border bg-surface p-5 shadow-card';

function Block({ block, id }: { block: InfoBlock; id: string }) {
  const heading = (
    <h2 id={id} className="text-2xl font-bold text-ink">
      {block.heading}
    </h2>
  );

  switch (block.kind) {
    case 'text':
      return (
        <section aria-labelledby={id}>
          {heading}
          <div className="mt-3 space-y-3 text-ink">
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      );

    case 'facts':
      return (
        <section aria-labelledby={id}>
          {heading}
          {block.intro && <p className="mt-3 text-ink-muted">{block.intro}</p>}
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {block.items.map((item) => (
              <div key={item.label} className={cardClass}>
                <dt className="text-sm text-ink-muted">{item.label}</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case 'cards':
      return (
        <section aria-labelledby={id}>
          {heading}
          {block.intro && <p className="mt-3 text-ink-muted">{block.intro}</p>}
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {block.items.map((item) => (
              <li key={item.title} className={cardClass}>
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                {item.meta && <p className="mt-1 text-sm font-medium text-primary">{item.meta}</p>}
                <p className="mt-2 text-sm text-ink-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      );

    case 'faq':
      return (
        <section aria-labelledby={id}>
          {heading}
          <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface shadow-card">
            {block.items.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-display font-semibold text-ink transition-colors duration-(--duration-fast) hover:text-primary [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 text-ink-muted transition-transform duration-(--duration-fast) group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-4 text-ink-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );
  }
}

/**
 * Institutional page (footer "Azienda" / "Assistenza" / legal links): breadcrumb, title and lead, the content
 * blocks, a navigation of the other pages of the same footer column and a contact call to action.
 * Server Component: the only client parts are the CatalogLinks (home anchors).
 */
export function InfoPageView({ page }: { page: InfoPage }) {
  const siblings = infoSectionLinks(page.section);
  const current = `/${page.slug}`;

  return (
    <div className="container-page py-10 lg:py-16">
      <nav aria-label={infoPageCopy.breadcrumbLabel}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
          <li className="flex items-center gap-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              {infoPageCopy.home}
            </Link>
            <ChevronRight aria-hidden="true" className="size-4" />
          </li>
          <li className="flex items-center gap-1">
            {page.section}
            <ChevronRight aria-hidden="true" className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-ink">
            {page.title}
          </li>
        </ol>
      </nav>

      <header className="mt-4 max-w-3xl">
        <p className={eyebrowClass}>{page.section}</p>
        <h1 className="mt-2 text-h2 font-bold text-ink">{page.title}</h1>
        <p className="mt-3 text-lg text-ink-muted">{page.lead}</p>
        <p className="mt-5 flex items-start gap-2 rounded-md border border-border bg-primary-subtle p-3 text-sm text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          {page.notice ?? infoPageCopy.demoNotice}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
        <div className="space-y-12">
          {page.blocks.map((block, index) => (
            <Block key={block.heading} block={block} id={`${page.slug}-${index}`} />
          ))}

          <section
            aria-labelledby={`${page.slug}-cta`}
            className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8"
          >
            <h2 id={`${page.slug}-cta`} className="text-xl font-bold text-ink">
              {infoPageCopy.cta.title}
            </h2>
            <p className="mt-2 text-ink-muted">{infoPageCopy.cta.text}</p>
            <CatalogLink
              href={`#${SECTION_IDS.contact}`}
              className={buttonClasses('primary', 'md', 'mt-5')}
            >
              {infoPageCopy.cta.action}
            </CatalogLink>
          </section>
        </div>

        <nav
          aria-labelledby={`${page.slug}-section-nav`}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <h2 id={`${page.slug}-section-nav`} className={eyebrowClass}>
            {infoPageCopy.sectionNavLabel}: {page.section}
          </h2>
          <ul className="mt-3 border-l border-border">
            {siblings.map((link) => {
              const active = link.href === current;
              const className = cn(
                '-ml-px flex min-h-11 items-center border-l-2 pl-4 transition-colors duration-(--duration-fast)',
                active
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-ink hover:border-border-strong hover:text-primary',
              );
              return (
                <li key={link.label}>
                  {link.href.startsWith('#') ? (
                    <CatalogLink href={link.href} className={className}>
                      {link.label}
                    </CatalogLink>
                  ) : (
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={className}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
