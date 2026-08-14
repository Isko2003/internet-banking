import { Component, ElementRef, forwardRef, QueryList, ViewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-otp-input',
  imports: [],
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInput),
      multi: true,
    },
  ],
})
export class OtpInput implements ControlValueAccessor {
  digits: string[] = ['', '', '', '', '', ''];
  @ViewChildren('digitInput') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    const strVal = value || '';
    this.digits = Array.from({ length: 6 }, (_, i) => strVal[i] || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onDigitInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    const digit = value.slice(-1);

    this.digits[index] = digit;

    this.onChange(this.digits.join(''));

    if (digit && index < 5) {
      const nextInput = this.inputRefs.toArray()[index + 1];
      nextInput?.nativeElement.focus();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      const prevInput = this.inputRefs.toArray()[index - 1];
      prevInput?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const chars = pastedText.replace(/\D/g, '').split('');

    this.digits = Array.from({ length: 6 }, (_, i) => chars[i] || '');
    this.onChange(this.digits.join(''));

    const lastFilledIndex = Math.min(chars.length, 6) - 1;
    if (lastFilledIndex >= 0) {
      this.inputRefs.toArray()[lastFilledIndex]?.nativeElement.focus();
    }
  }
}
