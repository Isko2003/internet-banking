import { Directive, HostBinding, input } from '@angular/core';

@Directive({
  selector: '[appHighlightAmount]',
  standalone: true,
})
export class HighlightAmount {
  appHighlightAmount = input.required<number>();

  threshold = input<number>(400);

  @HostBinding('class.bg-red-50')
  get isHighlighted(): boolean {
    return this.appHighlightAmount() > this.threshold();
  }
  @HostBinding('class.font-semibold')
  get isBold(): boolean {
    return this.appHighlightAmount() > this.threshold();
  }
}