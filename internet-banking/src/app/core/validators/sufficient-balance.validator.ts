import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { AccountService } from "../services/account.service";
import { catchError, map, Observable, of } from "rxjs";

export function sufficientBalanceValidator(accountService: AccountService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const debitAccountId = control.get('debitAccountId')?.value;
        const amount = control.get('amount')?.value;

        if(!debitAccountId || !amount) {
            return of(null);
        }

        return accountService.getAccountById(String(debitAccountId)).pipe(
            map((account) => {
                return amount > account.balance ? { insufficientBalanceAsync: true} : null;
            }),
            catchError(() => of(null))
        )
    }
}