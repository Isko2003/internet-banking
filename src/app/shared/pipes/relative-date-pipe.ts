import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value);
    const today = new Date();

    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const diffInMs = today.getTime() - date.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Bugun"
    } else if(diffInDays === 1) {
      return "dunen"
    } else if(diffInDays >= 2 && diffInDays <= 6) {
      return `${diffInDays} gun evvel`
    } else {
      return date.toLocaleDateString('az-AZ');
    }
  }
}
