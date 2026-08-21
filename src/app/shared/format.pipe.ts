import { Pipe, PipeTransform } from '@angular/core';
import { formatPrice, formatTime } from '../core/types';

@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatPrice(value ?? 0);
  }
}

@Pipe({ name: 'time', standalone: true })
export class TimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? formatTime(value) : '';
  }
}
