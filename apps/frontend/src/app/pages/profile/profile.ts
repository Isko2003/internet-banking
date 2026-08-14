import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);

  currentUser = this.authService.currentUser;

  isEditing = signal(false);
  isSaving = signal(false);
  submitError = signal<string | null>(null);

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    birthDate: [''],
    address: [''],
  });

  private resetFormFromUser() {
    this.profileForm.patchValue({
      firstName: this.currentUser()?.firstName,
      lastName: this.currentUser()?.lastName,
      email: this.currentUser()?.email,
      phone: this.currentUser()?.phone,
      birthDate: this.currentUser()?.birthDate,
      address: this.currentUser()?.address,
    });
    this.previewUrl.set(this.currentUser()?.photoUrl ?? null);
  }

  ngOnInit() {
    this.resetFormFromUser();
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get email() {
    return this.profileForm.get('email');
  }

  get phone() {
    return this.profileForm.get('phone');
  }

  get birthDate() {
    return this.profileForm.get('birthDate');
  }

  get address() {
    return this.profileForm.get('address');
  }

  hasUnsavedChanges(): boolean {
    return this.profileForm.dirty || this.selectedFile() !== null;
  }

  onEditClick() {
    this.isEditing.set(true);
  }

  onCancelEdit() {
    this.resetFormFromUser();

    this.selectedFile.set(null);

    this.isEditing.set(false);
    this.profileForm.markAsPristine();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.submitError.set('Şəkil ölçüsü 2MB-dan böyük ola bilməz.');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.submitError.set('Yalnız JPG və ya PNG formatı qəbul olunur.');
      return;
    }

    this.submitError.set(null);
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.submitError.set(null);

    const formValue = this.profileForm.value;

    const updates: Partial<CurrentUser> = {
      firstName: formValue.firstName ?? '',
      lastName: formValue.lastName ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? undefined,
      birthDate: formValue.birthDate ?? undefined,
      address: formValue.address ?? undefined,
      photoUrl: this.previewUrl() ?? user.photoUrl,
    };

    this.profileService
      .updateProfile(user.id, updates)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.isEditing.set(false);
          this.profileForm.markAsPristine();
          this.selectedFile.set(null);
          this.toastService.show('Profil uğurla yeniləndi', 'success');
        },
        error: () => {
          this.submitError.set('Profil yenilənmədi. Yenidən cəhd edin.');
        },
      });
  }
}
