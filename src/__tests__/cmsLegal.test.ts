import {parseCmsLegal} from '../cms/legal';

const lexicalContent = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Casa Maíz utiliza tus datos únicamente para gestionar reservaciones y comunicaciones autorizadas. prueba desde la legalidad',
          },
        ],
      },
    ],
  },
};

describe('CMS legal document', () => {
  it('reads title, summary, and Lexical paragraph text', () => {
    const document = parseCmsLegal({
      title: 'Aviso de privacidad',
      key: 'privacy_policy',
      summary: 'Cómo usamos y protegemos tus datos.',
      content: lexicalContent,
      extraField: true,
    });

    expect(document.title).toBe('Aviso de privacidad');
    expect(document.summary).toBe('Cómo usamos y protegemos tus datos.');
    expect(document.key).toBe('privacy_policy');
    expect(document.body).toBe(
      'Casa Maíz utiliza tus datos únicamente para gestionar reservaciones y comunicaciones autorizadas. prueba desde la legalidad',
    );
    expect(document).toEqual(expect.objectContaining({extraField: true}));
  });

  it('joins multiple Lexical blocks and skips empty nodes', () => {
    const document = parseCmsLegal({
      title: 'Aviso',
      content: {
        root: {
          children: [
            {type: 'paragraph', children: [{text: 'Primero'}]},
            {type: 'paragraph', children: [{text: '  '}]},
            {
              type: 'paragraph',
              children: [{text: 'Segundo '}, {text: 'párrafo'}],
            },
          ],
        },
      },
    });

    expect(document.body).toBe('Primero\n\nSegundo párrafo');
  });

  it('fails safely when legal data is missing or malformed', () => {
    expect(parseCmsLegal(null)).toEqual({body: ''});
    expect(parseCmsLegal({title: 'Aviso'}).body).toBe('');
    expect(parseCmsLegal({content: 'texto plano'}).body).toBe('texto plano');
  });
});
