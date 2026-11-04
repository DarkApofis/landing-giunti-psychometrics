import type { Metadata, Viewport } from 'next';
import { Figtree, Noto_Sans } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/SkipLink';
import { CatalogFiltersProvider } from '@/components/providers/CatalogFiltersProvider';
import { SECTION_IDS } from '@/data/navigation';
import { site } from '@/data/site';
import './globals.css';

// Variable fonts, self-hosted at build time by next/font (no request to Google at runtime).
const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'test psicologici',
    'valutazione neuropsicologica',
    'età evolutiva',
    'formazione psicologi',
    'corsi ECM',
    'psicometria',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: '/',
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: 'summary',
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: 'light',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="it" className={`${figtree.variable} ${notoSans.variable}`}>
      <body>
        <SkipLink />
        <CatalogFiltersProvider>
          <Header />
          <main id={SECTION_IDS.main} tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </CatalogFiltersProvider>
      </body>
    </html>
  );
}
