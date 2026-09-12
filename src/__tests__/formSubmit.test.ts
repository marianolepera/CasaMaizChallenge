import {createCmsClient} from '../cms/contentClient';
import type {CmsForm} from '../cms/form';
import {
  MOCK_FORM_CONFIRMATION,
  buildFormSubmission,
  missingRequiredFields,
  submitFormMock,
} from '../cms/formSubmit';

const form: CmsForm = {
  id: 'contact-form-id',
  confirmationMessage: 'Gracias por escribirnos.',
  fields: [
    {name: 'name', kind: 'text', required: true, options: []},
    {name: 'newsletter', kind: 'checkbox', required: false, options: []},
  ],
};

describe('mocked form submission', () => {
  it('builds the OpenAPI request without calling fetch', async () => {
    const fetchFn = jest.fn();
    const request = buildFormSubmission(form, {
      name: 'Ana',
      newsletter: true,
    });

    const response = await submitFormMock(request, {
      confirmationMessage: form.confirmationMessage,
    });

    expect(request).toEqual({
      form: 'contact-form-id',
      submissionData: [
        {field: 'name', value: 'Ana'},
        {field: 'newsletter', value: true},
      ],
    });
    expect(response).toEqual({
      message: 'Gracias por escribirnos.',
      doc: {id: 'mock-contact-form-id'},
    });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('uses a local fallback message and never posts through the CMS client', async () => {
    const fetchFn = jest.fn();
    const client = createCmsClient({fetchFn});

    const request = buildFormSubmission(form, {name: 'Ana'});
    const response = await submitFormMock(request);

    expect(client).not.toHaveProperty('submitForm');

    expect(request.submissionData).toEqual([
      {field: 'name', value: 'Ana'},
      {field: 'newsletter', value: false},
    ]);
    expect(response.message).toBe(MOCK_FORM_CONFIRMATION);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(JSON.stringify(request)).not.toContain('/api/form-submissions');
  });

  it('lists required fields that still have no value', () => {
    expect(missingRequiredFields(form, {newsletter: true})).toEqual(['name']);
    expect(missingRequiredFields(form, {name: '   '})).toEqual(['name']);
    expect(missingRequiredFields(form, {name: 'Ana'})).toEqual([]);
  });
});
