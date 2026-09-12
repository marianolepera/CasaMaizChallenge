import {readArray, readObject, readString} from './fields';
import {parseLexicalPlainText} from './legal';

const INPUT_KINDS = [
  'text',
  'email',
  'textarea',
  'number',
  'checkbox',
  'select',
] as const;

export type CmsFormFieldKind = (typeof INPUT_KINDS)[number];

export type CmsFormSelectOption = {
  label: string;
  value: string;
};

export type CmsFormField = {
  name: string;
  kind: CmsFormFieldKind;
  label?: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: string | boolean;
  options: CmsFormSelectOption[];
};

export type CmsForm = {
  id: string;
  title?: string;
  intro?: string;
  submitLabel?: string;
  confirmationMessage?: string;
  fields: CmsFormField[];
};

export function parseFormBlock(block: unknown): CmsForm | undefined {
  const source = readObject(block);
  if (!source) {
    return undefined;
  }

  const form = resolveFormDocument(source.form);
  if (!form) {
    return undefined;
  }

  const fields = readArray(form.fields)
    .map(parseFormField)
    .filter((field): field is CmsFormField => field !== undefined);

  if (fields.length === 0) {
    return undefined;
  }

  return {
    id: form.id,
    title: readString(form.title),
    intro: readIntro(source),
    submitLabel: readString(form.submitButtonLabel),
    confirmationMessage: readRichText(form.confirmationMessage),
    fields,
  };
}

function resolveFormDocument(
  value: unknown,
): (Record<string, unknown> & {id: string}) | undefined {
  const id = readId(value);
  if (id) {
    return undefined;
  }

  const document = readObject(value);
  if (!document) {
    return undefined;
  }

  const documentId = readId(document.id);
  if (!documentId) {
    return undefined;
  }

  return {...document, id: documentId};
}

function parseFormField(value: unknown): CmsFormField | undefined {
  const field = readObject(value);
  if (!field) {
    return undefined;
  }

  const name = readString(field.name);
  const kind = readFieldKind(field.blockType ?? field.blockName ?? field.type);
  if (!name || !kind) {
    return undefined;
  }

  return {
    name,
    kind,
    label: readString(field.label),
    required: field.required === true,
    placeholder: readString(field.placeholder),
    defaultValue: readDefaultValue(field.defaultValue),
    options: parseSelectOptions(field.options),
  };
}

function readFieldKind(value: unknown): CmsFormFieldKind | undefined {
  const kind = readString(value);
  if (!kind) {
    return undefined;
  }

  if ((INPUT_KINDS as readonly string[]).includes(kind)) {
    return kind as CmsFormFieldKind;
  }

  if (kind === 'country' || kind === 'state') {
    return 'text';
  }

  return undefined;
}

function parseSelectOptions(value: unknown): CmsFormSelectOption[] {
  const options: CmsFormSelectOption[] = [];

  for (const item of readArray(value)) {
    const option = readObject(item);
    if (!option) {
      continue;
    }

    const optionValue = readString(option.value);
    if (!optionValue) {
      continue;
    }

    options.push({
      label: readString(option.label) ?? optionValue,
      value: optionValue,
    });
  }

  return options;
}

function readIntro(block: Record<string, unknown>): string | undefined {
  if (block.enableIntro === false) {
    return undefined;
  }

  return readRichText(block.introContent) ?? readString(block.intro);
}

function readRichText(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const text = value
      .map(item => parseLexicalPlainText(item))
      .filter(Boolean)
      .join('\n\n');
    return text.length > 0 ? text : undefined;
  }

  const text = parseLexicalPlainText(value);
  return text.length > 0 ? text : undefined;
}

function readId(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return readString(value);
}

function readDefaultValue(value: unknown): string | boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return readString(value);
}
