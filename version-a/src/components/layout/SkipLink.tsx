import { SECTION_IDS } from '@/data/navigation';

/** First focusable element of the page; visible only while focused. */
export function SkipLink() {
  return (
    <a
      href={`#${SECTION_IDS.main}`}
      className="fixed top-2 left-2 z-50 -translate-y-24 rounded-md bg-primary px-4 py-3 font-display font-semibold text-white shadow-overlay focus-visible:translate-y-0 focus-visible:outline-offset-4"
    >
      Vai al contenuto principale
    </a>
  );
}
