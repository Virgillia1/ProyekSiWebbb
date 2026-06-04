const ERROR_SELECTOR = '[data-field-error="true"], [aria-invalid="true"]';
const FOCUSABLE_SELECTOR =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), button:not([disabled]), [role="combobox"]:not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])';

const isVisible = (element: HTMLElement) =>
  Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);

export const scrollToFirstFieldError = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      const errorElement = Array.from(
        document.querySelectorAll<HTMLElement>(ERROR_SELECTOR)
      ).find(isVisible);

      if (!errorElement) {
        return;
      }

      const fieldGroup = errorElement.closest('[data-field-group="true"], .space-y-2') as
        | HTMLElement
        | null;
      const scrollTarget = fieldGroup ?? errorElement;
      const focusTarget =
        scrollTarget.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
        (errorElement.matches(FOCUSABLE_SELECTOR) ? errorElement : null);

      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      focusTarget?.focus({ preventScroll: true });
    });
  }, 0);
};
