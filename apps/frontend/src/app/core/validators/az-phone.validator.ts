import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function azPhoneValidator(prefixes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;

    if (!value) return null;

    if (value.length !== 10) return { invalidPhone: true };

    if (!prefixes.some((p) => value.startsWith(p))) return { invalidPhone: true };

    return null;
  };
}
