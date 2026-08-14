import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ibanValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const cleaned = value.replace(/\s/g, '').toUpperCase();

    if (!/^[A-Z0-9]+$/.test(cleaned) || cleaned.length < 15) {
      return { invalidIbanFormat: true };
    }

    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

    let numericString = '';
    for (const char of rearranged) {
      if (/[A-Z]/.test(char)) {
        const charCode = char.charCodeAt(0) - 55;
        numericString += charCode.toString();
      } else {
        numericString += char;
      }
    }

    let remainder = 0;
    for (const digit of numericString) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }

    return remainder === 1 ? null : { invalidIban: true };
  };
}