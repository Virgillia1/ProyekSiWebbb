export const MIN_PHONE_DIGITS = 12;

export const getPhoneDigitCount = (value: string | null | undefined) =>
  String(value ?? '').replace(/\D/g, '').length;

export const hasMinimumPhoneDigits = (value: string | null | undefined) =>
  getPhoneDigitCount(value) >= MIN_PHONE_DIGITS;

export const getPhoneMinimumMessage = (label = 'Nomor telepon') =>
  `${label} minimal ${MIN_PHONE_DIGITS} digit.`;

export const validateRequiredPhone = (
  value: string | null | undefined,
  emptyMessage = 'Nomor telepon wajib diisi.',
  label = 'Nomor telepon'
) => {
  if (!String(value ?? '').trim()) {
    return emptyMessage;
  }

  if (!hasMinimumPhoneDigits(value)) {
    return getPhoneMinimumMessage(label);
  }

  return '';
};
