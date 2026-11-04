'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Announce = (message: string) => void;

const AnnouncerContext = createContext<Announce | null>(null);

/**
 * One polite live region for transient events ("… aggiunto al carrello").
 * Clearing first and re-setting on the next frame makes repeated identical
 * messages be announced again.
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const frame = useRef<number | null>(null);

  const announce = useCallback<Announce>((next) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    setMessage('');
    frame.current = requestAnimationFrame(() => setMessage(next));
  }, []);

  return (
    <AnnouncerContext value={announce}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>
    </AnnouncerContext>
  );
}

export function useAnnounce(): Announce {
  const announce = useContext(AnnouncerContext);
  if (!announce) throw new Error('useAnnounce must be used inside <AnnouncerProvider>');
  return announce;
}
