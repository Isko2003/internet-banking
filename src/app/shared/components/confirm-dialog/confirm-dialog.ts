import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  @Input({ required: true }) isOpen = false;
  @Input() title = 'Əminsiniz?';
  @Input() message = 'Bu əməliyyatı təsdiqləyirsiniz?';
  @Input() confirmText = 'Təsdiqlə';
  @Input() cancelText = 'İmtina';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelDialog = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancelDialog.emit();
  }
}