import type {CmsForm, CmsFormField} from './form';
import type {
  OpenApiFormSubmissionRequest,
  OpenApiFormSubmissionResponse,
} from './openapi';

export type FormFieldValue = string | boolean;

export type MobileFormSubmissionRequest = OpenApiFormSubmissionRequest;
export type MobileFormSubmissionResponse = OpenApiFormSubmissionResponse;

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
