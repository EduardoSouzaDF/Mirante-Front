import { DateHoraBrPipe } from './datetime.pipe';

describe('DateHoraBrPipe', () => {
  const pipe = new DateHoraBrPipe();

  it('formata data e hora no padrão pt-BR (dd/mm/aaaa HH:MM)', () => {
    const resultado = pipe.transform('2026-04-21T09:12:00');
    expect(resultado).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it('retorna string vazia para valores nulos ou inválidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('data-invalida')).toBe('');
  });
});
