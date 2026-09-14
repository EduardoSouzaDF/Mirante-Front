export interface MoedaProcessada {
  exibicao: string;
  valor: number | null;
}

/**
 * Aplica máscara de moeda BRL em tempo real a partir dos dígitos
 * digitados (ex: "150000" -> "R$ 1.500,00" / valor 1500). Compartilhado
 * entre `RangeFieldComponent` (filtro Valor Lote) e qualquer campo de
 * valor monetário único (ex: modal Incluir Lançamento).
 */
export function processarMascaraMoeda(bruto: string): MoedaProcessada {
  const digitos = bruto.replace(/\D/g, '');
  if (!digitos) {
    return { exibicao: '', valor: null };
  }
  const numero = Number(digitos) / 100;
  return {
    exibicao: numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    valor: numero,
  };
}
