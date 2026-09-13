import { DateBrPipe } from './date.pipe';

describe('DateBrPipe', () => {
  const pipe = new DateBrPipe();

  it('formata data ISO como dd/mm/aaaa', () => {
    expect(pipe.transform('2026-09-13')).toBe('13/09/2026');
  });

  it('formata objeto Date', () => {
    const data = new Date(2026, 8, 13); // 13/09/2026
    expect(pipe.transform(data)).toBe('13/09/2026');
  });

  it('retorna string vazia para valores nulos ou inválidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('data-invalida')).toBe('');
  });
});