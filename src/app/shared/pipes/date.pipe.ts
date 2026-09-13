import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataBr',
  standalone: true,
})
export class DateBrPipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    let data: Date;
    // 'YYYY-MM-DD' é tratado como data local para evitar deslocamento de fuso.
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [ano, mes, dia] = value.split('-').map(Number);
      data = new Date(ano, mes - 1, dia);
    } else {
      data = new Date(value);
    }

    if (Number.isNaN(data.getTime())) {
      return '';
    }
    return data.toLocaleDateString('pt-BR');
  }
}