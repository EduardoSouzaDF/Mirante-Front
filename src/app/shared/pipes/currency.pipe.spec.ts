import { CurrencyBRLPipe } from './currency.pipe';

describe('CurrencyBRLPipe', () => {
  const pipe = new CurrencyBRLPipe();

  function semEspacosInvisiveis(valor: string): string {
    return valor.replace(/\u00a0/g, ' ');
  }

  it('formata número como moeda BRL pt-BR', () => {
    expect(semEspacosInvisiveis(pipe.transform(1234.5))).toBe('R$ 1.234,50');
  });

  it('formata string numérica', () => {
    expect(semEspacosInvisiveis(pipe.transform('99.9'))).toBe('R$ 99,90');
  });

  it('retorna string vazia para valores nulos ou inválidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('nao-e-numero')).toBe('');
  });
});