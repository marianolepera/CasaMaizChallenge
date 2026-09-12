import {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import {Button} from '../components/atoms/Button';
import {Input} from '../components/atoms/Input';
import {Text} from '../components/atoms/Text';
import {parseFormBlock} from '../cms/form';
import type {CmsForm, CmsFormField} from '../cms/form';
import {
  buildFormSubmission,
  missingRequiredFields,
  submitFormMock,
  type FormFieldValue,
  type MobileFormSubmissionResponse,
} from '../cms/formSubmit';
import {
  androidRippleColor,
  platformSurfaceStyle,
  politeStatusRole,
  pressOpacity,
  useTheme,
} from '../theme';
import type {BlockProps} from './types';

export const FORM_BLOCK_TEST_ID = 'cms-form-block';
export const FORM_BLOCK_SUBMIT_TEST_ID = 'cms-form-submit';
export const FORM_BLOCK_CONFIRMATION_TEST_ID = 'cms-form-confirmation';
export const REQUIRED_FIELD_MESSAGE = 'Completá este campo.';
export const SUBMIT_FALLBACK_LABEL = 'Enviar';

export function formFieldTestId(name: string): string {
  return `cms-form-field-${name}`;
}

export function formFieldErrorTestId(name: string): string {
  return `cms-form-field-error-${name}`;
}

export type FormBlockProps = BlockProps & {
  submit?: typeof submitFormMock;
};

export function FormBlock({block, submit = submitFormMock}: FormBlockProps) {
  const form = parseFormBlock(block);
  if (!form) {
    return null;
  }

  return <FormBlockFields form={form} submit={submit} />;
}

function FormBlockFields({
  form,
  submit,
}: {
  form: CmsForm;
  submit: typeof submitFormMock;
}) {
  const {colors, minTouchTarget, radius, spacing} = useTheme();
  const [values, setValues] = useState(() => initialValues(form));
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | undefined>();
  const submitLabel = form.submitLabel ?? SUBMIT_FALLBACK_LABEL;

  const setFieldValue = (name: string, value: FormFieldValue) => {
    setValues(current => ({...current, [name]: value}));
    setErrors(current => current.filter(field => field !== name));
  };

  const onSubmit = () => {
    const missing = missingRequiredFields(form, values);
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }

    setSubmitting(true);
    submit(buildFormSubmission(form, values), {
      confirmationMessage: form.confirmationMessage,
    })
      .then((response: MobileFormSubmissionResponse) => {
        setConfirmation(response.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (confirmation) {
    return (
      <View
        testID={FORM_BLOCK_TEST_ID}
        style={[
          styles.container,
          {
            marginHorizontal: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            ...platformSurfaceStyle(Platform.OS, colors, 'card'),
          },
        ]}>
        <Text
          testID={FORM_BLOCK_CONFIRMATION_TEST_ID}
          accessibilityRole={politeStatusRole()}
          accessibilityLiveRegion="polite">
          {confirmation}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID={FORM_BLOCK_TEST_ID}
      style={[
        styles.container,
        {
          marginHorizontal: spacing.md,
          padding: spacing.lg,
          gap: spacing.md,
          borderRadius: radius.lg,
          ...platformSurfaceStyle(Platform.OS, colors, 'card'),
        },
      ]}>
      {form.title ? (
        <Text variant="heading" accessibilityRole="header">
          {form.title}
        </Text>
      ) : null}
      {form.intro ? <Text muted>{form.intro}</Text> : null}
      {form.fields.map(field => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          invalid={errors.includes(field.name)}
          minTouchTarget={minTouchTarget}
          onChange={value => setFieldValue(field.name, value)}
        />
      ))}
      <Button
        testID={FORM_BLOCK_SUBMIT_TEST_ID}
        label={submitLabel}
        disabled={submitting}
        onPress={onSubmit}
        style={{minHeight: minTouchTarget}}
      />
    </KeyboardAvoidingView>
  );
}

function FormField({
  field,
  value,
  invalid,
  minTouchTarget,
  onChange,
}: {
  field: CmsFormField;
  value: FormFieldValue | undefined;
  invalid: boolean;
  minTouchTarget: number;
  onChange: (value: FormFieldValue) => void;
}) {
  const {colors, spacing} = useTheme();
  const label = field.label ?? field.name;
  const error = invalid ? (
    <Text
      testID={formFieldErrorTestId(field.name)}
      accessibilityRole="alert"
      color={colors.danger}
      variant="caption">
      {REQUIRED_FIELD_MESSAGE}
    </Text>
  ) : null;

  if (field.kind === 'checkbox') {
    return (
      <View style={{gap: spacing.xs}}>
        <CheckboxField
          label={label}
          checked={value === true}
          minTouchTarget={minTouchTarget}
          onChange={onChange}
        />
        {error}
      </View>
    );
  }

  if (field.kind === 'select' && field.options.length > 0) {
    return (
      <View style={{gap: spacing.xs}}>
        <Text variant="eyebrow">{label}</Text>
        {field.options.map(option => (
          <SelectOption
            key={option.value}
            label={option.label}
            selected={value === option.value}
            minTouchTarget={minTouchTarget}
            onPress={() => onChange(option.value)}
          />
        ))}
        {error}
      </View>
    );
  }

  const textValue = typeof value === 'string' ? value : '';

  return (
    <View style={{gap: spacing.xs}}>
      <Text variant="eyebrow">{label}</Text>
      <Input
        testID={formFieldTestId(field.name)}
        value={textValue}
        onChangeText={onChange}
        placeholder={field.placeholder}
        accessibilityLabel={label}
        accessibilityHint={field.required ? 'Obligatorio' : undefined}
        autoCapitalize={field.kind === 'email' ? 'none' : 'sentences'}
        autoCorrect={field.kind !== 'email'}
        keyboardType={keyboardTypeFor(field.kind)}
        multiline={field.kind === 'textarea'}
        textAlignVertical={field.kind === 'textarea' ? 'top' : 'center'}
        style={
          field.kind === 'textarea'
            ? {minHeight: spacing.xxl + spacing.xl, paddingTop: spacing.sm}
            : undefined
        }
      />
      {error}
    </View>
  );
}

function CheckboxField({
  label,
  checked,
  minTouchTarget,
  onChange,
}: {
  label: string;
  checked: boolean;
  minTouchTarget: number;
  onChange: (value: boolean) => void;
}) {
  const {colors, radius, spacing} = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{checked}}
      android_ripple={androidRippleColor(Platform.OS, colors.overlay)}
      onPress={() => onChange(!checked)}
      style={({pressed}) => [
        styles.checkboxRow,
        {
          minHeight: minTouchTarget,
          gap: spacing.sm,
          opacity: pressOpacity(Platform.OS, pressed),
        },
      ]}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.accent,
          backgroundColor: checked ? colors.accent : 'transparent',
        }}
      />
      <Text>{label}</Text>
    </Pressable>
  );
}

function SelectOption({
  label,
  selected,
  minTouchTarget,
  onPress,
}: {
  label: string;
  selected: boolean;
  minTouchTarget: number;
  onPress: () => void;
}) {
  const {colors, radius, spacing} = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{selected}}
      android_ripple={androidRippleColor(Platform.OS, colors.overlay)}
      onPress={onPress}
      style={({pressed}) => [
        styles.option,
        {
          minHeight: minTouchTarget,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: colors.surface,
          opacity: pressOpacity(Platform.OS, pressed),
        },
      ]}>
      <Text color={selected ? colors.accent : colors.text}>{label}</Text>
    </Pressable>
  );
}

function initialValues(form: CmsForm): Record<string, FormFieldValue> {
  const values: Record<string, FormFieldValue> = {};

  for (const field of form.fields) {
    if (field.kind === 'checkbox') {
      values[field.name] = field.defaultValue === true;
      continue;
    }

    values[field.name] =
      typeof field.defaultValue === 'string' ? field.defaultValue : '';
  }

  return values;
}

function keyboardTypeFor(kind: CmsFormField['kind']): KeyboardTypeOptions {
  if (kind === 'email') {
    return 'email-address';
  }

  if (kind === 'number') {
    return 'numeric';
  }

  return 'default';
}

const styles = StyleSheet.create({
  container: {
    width: 'auto',
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  option: {
    justifyContent: 'center',
    borderWidth: 1,
  },
});
