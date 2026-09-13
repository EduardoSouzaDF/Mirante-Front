import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataHoraBr',
  standalone: true,
})
export class DateHoraBrPipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const data = new Date(value);
    if (Number.isNaN(data.getTime())) {
      return '';
    }

    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dataFormatada} ${horaFormatada}`;
  }
}
