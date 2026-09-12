import {parseFormBlock} from '../cms/form';

const lexical = (text: string) => ({
  root: {
    children: [{type: 'paragraph', children: [{text}]}],
  },
});

describe('CMS formBlock parser', () => {
  it('reads a populated form document and keeps CMS labels', () => {
    const form = parseFormBlock({
      blockType: 'formBlock',
      enableIntro: true,
      introContent: lexical('Escribinos para una mesa.'),
      form: {
        id: 'contact-form-id',
        title: 'Contacto',
        submitButtonLabel: 'Enviar',
        confirmationMessage: lexical('Gracias por escribirnos.'),
        fields: [
          {
            blockType: 'text',
            name: 'name',
            label: 'Nombre',
            required: true,
            placeholder: 'Ana',
          },
          {
            blockType: 'email',
            name: 'email',
            label: 'Correo',
            required: true,
          },
          {
            blockType: 'checkbox',
            name: 'newsletter',
            label: 'Novedades',
            defaultValue: true,
          },
          {
            blockType: 'select',
            name: 'party',
            label: 'Personas',
            options: [
              {label: 'Dos', value: '2'},
              {value: '4'},
              {label: 'sin valor'},
            ],
          },
        ],
        extraField: true,
      },
    });

    expect(form).toEqual({
      id: 'contact-form-id',
      title: 'Contacto',
      intro: 'Escribinos para una mesa.',
      submitLabel: 'Enviar',
      confirmationMessage: 'Gracias por escribirnos.',
      fields: [
        {
          name: 'name',
          kind: 'text',
          label: 'Nombre',
          required: true,
          placeholder: 'Ana',
          options: [],
        },
        {
          name: 'email',
          kind: 'email',
          label: 'Correo',
          required: true,
          options: [],
        },
        {
          name: 'newsletter',
          kind: 'checkbox',
          label: 'Novedades',
          required: false,
          defaultValue: true,
          options: [],
        },
        {
          name: 'party',
          kind: 'select',
          label: 'Personas',
          required: false,
          options: [
            {label: 'Dos', value: '2'},
            {label: '4', value: '4'},
          ],
        },
      ],
    });
  });

  it('returns undefined when the form is only an id or has no usable fields', () => {
    expect(parseFormBlock({blockType: 'formBlock', form: 'contact-form-id'})).toBeUndefined();
    expect(parseFormBlock({blockType: 'formBlock', form: {id: 'contact-form-id'}})).toBeUndefined();
    expect(
      parseFormBlock({
        blockType: 'formBlock',
        form: {id: 'contact-form-id', fields: [{blockType: 'message'}]},
      }),
    ).toBeUndefined();
    expect(parseFormBlock({blockType: 'formBlock'})).toBeUndefined();
    expect(parseFormBlock(null)).toBeUndefined();
  });

  it('skips incomplete fields and does not treat message blocks as inputs', () => {
    const form = parseFormBlock({
      blockType: 'formBlock',
      enableIntro: false,
      introContent: lexical('No debería verse'),
      form: {
        id: 42,
        fields: [
          'not-an-object',
          {blockType: 'text', label: 'Sin name'},
          {blockType: 'message', name: 'note', label: 'Aviso'},
          {blockType: 'textarea', name: 'message', label: 'Mensaje'},
          {blockName: 'country', name: 'country', label: 'País'},
        ],
      },
    });

    expect(form?.id).toBe('42');
    expect(form?.intro).toBeUndefined();
    expect(form?.fields).toEqual([
      {
        name: 'message',
        kind: 'textarea',
        label: 'Mensaje',
        required: false,
        options: [],
      },
      {
        name: 'country',
        kind: 'text',
        label: 'País',
        required: false,
        options: [],
      },
    ]);
  });
});
