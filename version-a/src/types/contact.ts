export type ContactField = 'nome' | 'email' | 'messaggio';

export type ContactValues = Record<ContactField, string>;

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactFormState =
  | {
      status: 'editing';
      values: ContactValues;
      errors: ContactErrors;
      /** After the first failed submit, fields are re-validated on change/blur. */
      submitAttempted: boolean;
    }
  | { status: 'submitting'; values: ContactValues }
  | { status: 'success'; submittedName: string };
