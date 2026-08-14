import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function luhnValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if(!value) return null;

        const digitsOnly = value.replace(/\s/g, ''); // bosluqlari temizlemek ucun mes: (4169 7388 2988 1122)

        if(!/^\d+$/.test(digitsOnly)) {
            return { invalidCardFormat: true};
        }

        let sum = 0;
        let shouldDouble = false;

        for(let i = digitsOnly.length - 1; i>=0; i--) {
            let digit = Number(digitsOnly[i]);

            if(shouldDouble) {
                digit *= 2;
                if(digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return sum % 10 === 0 ? null : { invalidLuhn: true }
    }
}