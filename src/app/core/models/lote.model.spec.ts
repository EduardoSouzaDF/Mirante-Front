import { Lancamento } from './lancamento.model';
import { calcularQuantidadeLancamentos, calcularValorLote } from './lote.model';

function lancamentoMock(valor: number): Lancamento {
  return {
    id: 1,
    contaCorrenteId: 1,
    valor,
    historico: 'Lançamento Manual',
    estorno: false,
    documentos: [],
    descricao: '',
    situacao: 'Confirmado',
  };
}

describe('calcularValorLote / calcularQuantidadeLancamentos', () => {
  it('soma o valor de todos os lançamentos', () => {
    const lote = { lancamentos: [lancamentoMock(100), lancamentoMock(250.5)] };
    expect(calcularValorLote(lote)).toBe(350.5);
  });

  it('conta a quantidade de lançamentos', () => {
    const lote = { lancamentos: [lancamentoMock(1), lancamentoMock(2), lancamentoMock(3)] };
    expect(calcularQuantidadeLancamentos(lote)).toBe(3);
  });

  it('lote sem lançamentos retorna 0 para os dois', () => {
    const lote = { lancamentos: [] };
    expect(calcularValorLote(lote)).toBe(0);
    expect(calcularQuantidadeLancamentos(lote)).toBe(0);
  });
});
