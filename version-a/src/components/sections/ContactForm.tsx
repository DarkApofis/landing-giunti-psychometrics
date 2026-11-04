'use client';

import { CircleAlert, CircleCheck, LoaderCircle, Send } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/FormField';
import { contactCopy } from '@/data/contact';
import { cn } from '@/lib/cn';
import {
  CONTACT_LIMITS,
  firstInvalidField,
  hasErrors,
  validateContact,
  validateField,
} from '@/lib/validators';
import type { ContactField, ContactFormState, ContactValues } from '@/types/contact';

const EMPTY: ContactValues = { nome: '', email: '', messaggio: '' };
const INITIAL: ContactFormState = {
  status: 'editing',
  values: EMPTY,
  errors: {},
  submitAttempted: false,
};

/**
 * Contact form (no backend). Strategy:
 * - validate everything on submit; on failure show an error summary (role="alert") and move
 *   focus to the first invalid field (its error is read through aria-describedby);
 * - after the first failed submit, re-validate a field while typing and on blur;
 * - "submitting" is simulated with a timeout; the button stays focusable (aria-disabled) and
 *   further submits are ignored;
 * - success replaces the form with a role="status" panel and moves focus to its heading.
 */
export function ContactForm() {
  const [state, setState] = useState<ContactFormState>(INITIAL);
  const [summary, setSummary] = useState('');
  const uid = useId();
  const ids = { title: `${uid}-title`, note: `${uid}-note` };

  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messaggioRef = useRef<HTMLTextAreaElement>(null);
  /** Only called from event handlers/effects (never during render). */
  const focusField = (field: ContactField) =>
    ({ nome: nomeRef, email: emailRef, messaggio: messaggioRef })[field].current?.focus();
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusFirstFieldNext = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  // Focus management after the view switches (success panel ↔ form).
  useEffect(() => {
    if (state.status === 'success') {
      successHeadingRef.current?.focus();
    } else if (state.status === 'editing' && focusFirstFieldNext.current) {
      focusFirstFieldNext.current = false;
      nomeRef.current?.focus();
    }
  }, [state.status]);

  function handleChange(field: ContactField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setSummary('');
      setState((prev) => {
        if (prev.status !== 'editing') return prev;
        const values = { ...prev.values, [field]: value };
        const errors = prev.submitAttempted
          ? { ...prev.errors, [field]: validateField(field, value) }
          : prev.errors;
        return { ...prev, values, errors };
      });
    };
  }

  function handleBlur(field: ContactField) {
    return () => {
      setState((prev) =>
        prev.status === 'editing' && prev.submitAttempted
          ? {
              ...prev,
              errors: { ...prev.errors, [field]: validateField(field, prev.values[field]) },
            }
          : prev,
      );
    };
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== 'editing') return; // ignore double submits while sending

    const errors = validateContact(state.values);
    if (hasErrors(errors)) {
      const count = Object.values(errors).filter(Boolean).length;
      setState({ ...state, errors, submitAttempted: true });
      setSummary(contactCopy.errorSummary(count));
      const first = firstInvalidField(errors);
      if (first) focusField(first);
      return;
    }

    const name = state.values.nome.trim();
    setSummary('');
    setState({ status: 'submitting', values: state.values });
    timer.current = window.setTimeout(() => {
      setState({ status: 'success', submittedName: name });
    }, contactCopy.submitDelayMs);
  }

  function handleSendAnother() {
    focusFirstFieldNext.current = true;
    setState(INITIAL);
  }

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-lg border border-success/30 bg-success-subtle p-6 text-center sm:p-8"
      >
        <CircleCheck
          aria-hidden="true"
          className="mx-auto size-12 text-success"
          strokeWidth={1.75}
        />
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-4 text-xl font-bold text-ink focus:outline-none"
        >
          {contactCopy.success.title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-ink">
          {contactCopy.success.body(state.submittedName)}
        </p>
        <Button variant="secondary" onClick={handleSendAnother} className="mt-6">
          {contactCopy.success.again}
        </Button>
      </div>
    );
  }

  const submitting = state.status === 'submitting';
  const errors = state.status === 'editing' ? state.errors : {};
  const values = state.values;
  const common = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    required: true,
    value: values[field],
    error: errors[field],
    readOnly: submitting,
    onChange: handleChange(field),
    onBlur: handleBlur(field),
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={ids.title}
      aria-describedby={ids.note}
      aria-busy={submitting}
    >
      <h3 id={ids.title} className="text-xl font-bold text-ink">
        {contactCopy.formTitle}
      </h3>
      <p id={ids.note} className="mt-1 text-sm text-ink-muted">
        {contactCopy.requiredNote}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField
          ref={nomeRef}
          label={contactCopy.fields.nome.label}
          autoComplete={contactCopy.fields.nome.autoComplete}
          maxLength={CONTACT_LIMITS.nomeMax}
          {...common('nome')}
        />
        <TextField
          ref={emailRef}
          type="email"
          inputMode="email"
          spellCheck={false}
          label={contactCopy.fields.email.label}
          hint={contactCopy.fields.email.hint}
          autoComplete={contactCopy.fields.email.autoComplete}
          maxLength={CONTACT_LIMITS.emailMax}
          {...common('email')}
        />
        <div className="sm:col-span-2">
          <TextArea
            ref={messaggioRef}
            rows={5}
            label={contactCopy.fields.messaggio.label}
            hint={contactCopy.fields.messaggio.hint}
            maxLength={CONTACT_LIMITS.messaggioMax}
            {...common('messaggio')}
          />
        </div>
      </div>

      {summary && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-subtle p-3 text-sm font-medium text-danger"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {summary}
        </p>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          aria-disabled={submitting || undefined}
          className={cn('w-full sm:w-auto', submitting && 'cursor-progress')}
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="size-5" />
          )}
          {submitting ? contactCopy.submitting : contactCopy.submit}
        </Button>
        <p role="status" className="sr-only">
          {submitting ? contactCopy.submitting : ''}
        </p>
      </div>
    </form>
  );
}
