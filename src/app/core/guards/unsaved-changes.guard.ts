import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm(
      'Saxlanmamış dəyişiklikləriniz var. Səhifəni tərk etmək istədiyinizə əminsiniz?',
    );
  }
  return true;
};
