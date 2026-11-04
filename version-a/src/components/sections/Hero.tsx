import { ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { hero, heroStats } from '@/data/hero';
import { SECTION_IDS } from '@/data/navigation';
import { HeroIllustration } from './HeroIllustration';

/**
 * Hero (DESIGN-SPEC §6.9). Server Component, no photo: the LCP element is the <h1> text.
 * Background = token gradient + decorative accent glow and dot pattern (CSS utility `hero-surface`).
 * The CTA is a plain anchor: smooth scrolling comes from CSS and is disabled under reduced motion.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="on-dark relative isolate overflow-hidden hero-surface text-white"
    >
      <div className="container-page grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-24">
        <div className="max-w-2xl">
          <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-accent-subtle uppercase">
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-3 text-display font-bold">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg text-primary-subtle">{hero.lead}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={`#${SECTION_IDS.catalog}`} variant="on-dark" size="lg">
              {hero.primaryCta}
              <ArrowDown aria-hidden="true" className="size-5" />
            </Button>
            <Button href={`#${SECTION_IDS.catalog}`} variant="on-dark-outline" size="lg">
              {hero.secondaryCta}
              <ArrowRight aria-hidden="true" className="size-5" />
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-6">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm leading-snug text-primary-subtle">{stat.label}</dt>
                <dd className="font-display text-3xl font-bold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroIllustration className="mx-auto hidden lg:block" />
      </div>
    </section>
  );
}
