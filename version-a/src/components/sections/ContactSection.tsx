import { Clock, Mail, Phone, type LucideIcon } from 'lucide-react';
import { contactChannels, contactCopy } from '@/data/contact';
import { SECTION_IDS } from '@/data/navigation';
import { ContactForm } from './ContactForm';

const CHANNEL_ICONS: Record<(typeof contactChannels)[number]['kind'], LucideIcon> = {
  email: Mail,
  phone: Phone,
  hours: Clock,
};

/** Server shell: intro + fictional contact channels; the form is the only client island. */
export function ContactSection() {
  return (
    <section
      id={SECTION_IDS.contact}
      aria-labelledby="contatti-title"
      className="container-page py-16 lg:py-24"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div>
          <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-accent-strong uppercase">
            {contactCopy.eyebrow}
          </p>
          <h2 id="contatti-title" className="mt-2 text-h2 font-bold text-ink">
            {contactCopy.title}
          </h2>
          <p className="mt-3 text-lg text-ink-muted">{contactCopy.intro}</p>

          <ul className="mt-8 space-y-4">
            {contactChannels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.kind];
              return (
                <li key={channel.kind} className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-ink-muted">{channel.label}</span>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="inline-flex min-h-11 items-center font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <span className="font-medium text-ink">{channel.value}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
