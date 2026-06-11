const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRequiredEmail = (
  value: string | null | undefined,
  emptyMessage = 'Email wajib diisi.',
  invalidMessage = 'Format email tidak valid.'
) => {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return emptyMessage;
  }

  if (!EMAIL_PATTERN.test(normalizedValue)) {
    return invalidMessage;
  }

  return '';
};
