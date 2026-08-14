import { Directive, HostListener, input, signal } from '@angular/core';

@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true,
  exportAs: 'copyToClipboard',
})
export class CopyToClipboard {
  appCopyToClipboard = input.required<string>();

  copied = signal(false);

  @HostListener("click")
  onClick() {
    navigator.clipboard.writeText(this.appCopyToClipboard()).then(() => {
      this.copied.set(true);

      setTimeout(() => {
        this.copied.set(false);
      }, 2000)
    });
  }
}