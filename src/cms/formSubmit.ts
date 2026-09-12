import type {CmsForm, CmsFormField} from './form';

export type FormFieldValue = string | boolean;

/**
 * Same body as POST /api/form-submissions.
 * @see https://payload-cms-poc-seven.vercel.app/api/docs
 */
export type MobileFormSubmissionRequest = {
  form: string;
  submissionData: Array<{
    field: string;
    value: string | boolean;
  }>;
};

export type MobileFormSubmissionResponse = {
  message: string;
  doc: {id: string};
};

export const MOCK_FORM_CONFIRMATION = 'Recibimos tu mensaje.';

export function missingRequiredFields(
  form: CmsForm,
  values: Record<string, FormFieldValue | undefined>,
): string[] {
  return form.fields
    .filter(field => field.required && !hasSubmittedValue(field, values[field.name]))
    .map(field => field.name);
}

export function buildFormSubmission(
  form: CmsForm,
  values: Record<string, FormFieldValue | undefined>,
): MobileFormSubmissionRequest {
  return {
    form: form.id,
    submissionData: form.fields.map(field => ({
      field: field.name,
      value: submittedValue(field, values[field.name]),
    })),
  };
}

export async function submitFormMock(
  request: MobileFormSubmissionRequest,
  options?: {confirmationMessage?: string},
): Promise<MobileFormSubmissionResponse> {
  return {
    message: options?.confirmationMessage ?? MOCK_FORM_CONFIRMATION,
    doc: {id: `mock-${request.form}`},
  };
}

function hasSubmittedValue(
  field: CmsFormField,
  value: FormFieldValue | undefined,
): boolean {
  if (field.kind === 'checkbox') {
    return value === true;
  }

  return typeof value === 'string' && value.trim().length > 0;
}

function submittedValue(
  field: CmsFormField,
  value: FormFieldValue | undefined,
): string | boolean {
  if (field.kind === 'checkbox') {
    return value === true;
  }

  return typeof value === 'string' ? value : '';
}
