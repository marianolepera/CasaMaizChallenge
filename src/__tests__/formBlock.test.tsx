import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {PageLayout} from '../blocks/PageLayout';
import {
  FormBlock,
  FORM_BLOCK_CONFIRMATION_TEST_ID,
  FORM_BLOCK_SUBMIT_TEST_ID,
  FORM_BLOCK_TEST_ID,
  REQUIRED_FIELD_MESSAGE,
  formFieldErrorTestId,
  formFieldTestId,
} from '../blocks/formBlock';
import {TEXT_BLOCK_HEADING_TEST_ID} from '../blocks/textBlock';

const populatedForm = {
  blockType: 'formBlock',
  form: {
    id: 'contact-form-id',
    title: 'Contacto',
    submitButtonLabel: 'Enviar',
    confirmationMessage: {
      root: {
        children: [{type: 'paragraph', children: [{text: 'Gracias por escribirnos.'}]}],
      },
    },
    fields: [
      {
        blockType: 'text',
        name: 'name',
        label: 'Nombre',
        required: true,
      },
      {
        blockType: 'email',
        name: 'email',
        label: 'Correo',
        required: true,
      },
    ],
  },
};

function renderLayout(
  layout: Parameters<typeof PageLayout>[0]['layout'],
) {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<PageLayout layout={layout} />);
  });
  return tree!;
}

describe('formBlock', () => {
  it('does not crash when the form is incomplete and keeps rendering siblings', () => {
    const tree = renderLayout([
      {blockType: 'formBlock', form: 'contact-form-id'},
      {blockType: 'textBlock', heading: 'Sigue el menú'},
    ]);

    expect(() =>
      tree.root.findByProps({testID: FORM_BLOCK_TEST_ID}),
    ).toThrow();
    expect(
      tree.root.findByProps({testID: TEXT_BLOCK_HEADING_TEST_ID}).props.children,
    ).toBe('Sigue el menú');
  });

  it('renders CMS labels and blocks submit until required fields are filled', () => {
    const submit = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FormBlock block={populatedForm} submit={submit} />,
      );
    });

    expect(tree!.root.findByProps({testID: FORM_BLOCK_TEST_ID})).toBeTruthy();
    expect(tree!.root.findAllByProps({children: 'Contacto'}).length).toBeGreaterThan(
      0,
    );
    expect(tree!.root.findAllByProps({children: 'Nombre'}).length).toBeGreaterThan(
      0,
    );

    ReactTestRenderer.act(() => {
      tree!.root.findByProps({testID: FORM_BLOCK_SUBMIT_TEST_ID}).props.onPress();
    });

    expect(
      tree!.root.findByProps({testID: formFieldErrorTestId('name')}).props
        .children,
    ).toBe(REQUIRED_FIELD_MESSAGE);
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits through the local mock and shows the CMS confirmation', async () => {
    const submit = jest.fn().mockResolvedValue({
      message: 'Gracias por escribirnos.',
      doc: {id: 'mock-contact-form-id'},
    });
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FormBlock block={populatedForm} submit={submit} />,
      );
    });

    ReactTestRenderer.act(() => {
      tree!.root.findByProps({testID: formFieldTestId('name')}).props.onChangeText(
        'Ana',
      );
      tree!.root
        .findByProps({testID: formFieldTestId('email')})
        .props.onChangeText('ana@casa.test');
    });

    await ReactTestRenderer.act(async () => {
      tree!.root.findByProps({testID: FORM_BLOCK_SUBMIT_TEST_ID}).props.onPress();
    });

    expect(submit).toHaveBeenCalledWith(
      {
        form: 'contact-form-id',
        submissionData: [
          {field: 'name', value: 'Ana'},
          {field: 'email', value: 'ana@casa.test'},
        ],
      },
      {confirmationMessage: 'Gracias por escribirnos.'},
    );
    expect(
      tree!.root.findByProps({testID: FORM_BLOCK_CONFIRMATION_TEST_ID}).props
        .children,
    ).toBe('Gracias por escribirnos.');
  });
});
