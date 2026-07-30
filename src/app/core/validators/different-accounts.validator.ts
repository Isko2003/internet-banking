import { AbstractControl, ValidatorFn, ValidationErrors } from "@angular/forms";

export function differentAccountsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const debitAccountId = control.get('debitAccountId')?.value;
        const creditAccountId = control.get('creditAccountId')?.value;

        if (debitAccountId && creditAccountId && debitAccountId === creditAccountId) {
            return { sameAccount: true };
        }
        return null;
    }
}