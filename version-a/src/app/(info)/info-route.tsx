import type { Metadata } from 'next';
import { InfoPageView } from '@/components/sections/InfoPageView';
import { findInfoPage, type InfoPage } from '@/data/pages';
import { site } from '@/data/site';

/**
 * Builds the route of one institutional page (footer "Azienda" / "Assistenza" / legal links).
 *
 * One static folder per page, not a dynamic `[slug]` segment: with Cache Components an unknown
 * param is rendered on request and `notFound()` arrives after streaming has started, so an unknown
 * path would answer 200. Static routes keep a real 404 for every other path (app/not-found.tsx).
 * src/data/pages.test.ts checks that every page in src/data/pages.ts has its folder.
 */
export function infoRoute(slug: string) {
  const found = findInfoPage(slug);
  if (!found) throw new Error(`Unknown info page "${slug}" (see src/data/pages.ts)`);
  const page: InfoPage = found;

  const url = `/${page.slug}`;
  // The <title> gets the layout template ("… | Giunti Psychometrics"); social titles do not, so
  // they are built here. openGraph/twitter replace the layout's objects: repeat the shared fields.
  const socialTitle = `${page.title} | ${site.name}`;
  const metadata: Metadata = {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: site.locale,
      siteName: site.name,
      url,
      title: socialTitle,
      description: page.description,
    },
    twitter: { card: 'summary', title: socialTitle, description: page.description },
  };

  function InfoRoute() {
    return <InfoPageView page={page} />;
  }

  return { metadata, Page: InfoRoute };
}
