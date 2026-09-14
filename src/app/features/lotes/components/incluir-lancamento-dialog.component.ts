import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ContaCorrenteBusca } from '../../../core/models/conta-corrente.model';
import { HISTORICOS_DISPONIVEIS, Lancamento } from '../../../core/models/lancamento.model';
import { LoteFacade } from '../../../core/services/lote.facade';
import { CurrencyBRLPipe } from '../../../shared/pipes/currency.pipe';
import { processarMascaraMoeda } from '../../../shared/utils/mascara-moeda.util';

/** Validador: precisa de ao menos 1 arquivo anexado. */
function aoMenosUmArquivo(control: { value: unknown[] }): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { obrigatorio: true };
}

/** Texto mostrado (e pesquisável) no select de Conta Corrente. */
export function rotuloContaCorrente(item: ContaCorrenteBusca): string {
  const nomeInstituicao = item.instituicao?.nome ?? '-';
  return `${nomeInstituicao} - agencia: ${item.conta.agencia} conta: ${item.conta.conta}`;
}

/**
 * Modal "Incluir Lançamento" — aberta pelo botão Incluir da tela de
 * consulta de lotes. Escolhe a conta corrente (select pesquisável),
 * preenche o formulário e, ao confirmar, cria um lançamento (Pendente) +
 * um lote novo (Aberto) para a instituição da conta (spec 0005).
 */
@Component({
  selector: 'app-incluir-lancamento-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyBRLPipe],
  templateUrl: './incluir-lancamento-dialog.component.html',
  styleUrl: './incluir-lancamento-dialog.component.scss',
})
export class IncluirLancamentoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(LoteFacade);

  readonly visible = input(false);
  readonly closed = output<void>();

  readonly historicos = HISTORICOS_DISPONIVEIS;
  readonly rotuloContaCorrente = rotuloContaCorrente;

  // Select pesquisável de Conta Corrente: carrega todas as contas uma vez
  // e usa <datalist> pra filtragem nativa por texto digitado.
  readonly opcoesContas = signal<ContaCorrenteBusca[]>([]);
  readonly contaTexto = this.fb.nonNullable.control('');
  readonly contaEncontrada = signal<ContaCorrenteBusca | null>(null);

  readonly documentos = signal<{ nome: string }[]>([]);
  readonly arrastandoArquivo = signal(false);

  // Valor com a mesma máscara BRL do filtro "Valor Lote" (RangeFieldComponent).
  readonly valorExibicao = signal('');

  readonly form = this.fb.group({
    contaCorrenteId: this.fb.control<number | null>(null, Validators.required),
    valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    historico: this.fb.control<string>('', Validators.required),
    estorno: this.fb.nonNullable.control(false),
    documentos: this.fb.nonNullable.control<{ nome: string }[]>([], aoMenosUmArquivo),
    descricao: this.fb.nonNullable.control(''),
    pa: this.fb.nonNullable.control(''),
  });

  readonly enviando = signal(false);
  readonly lancamentosIncluidos = signal<Lancamento[]>([]);

  constructor() {
    this.facade.listarContasCorrentes().subscribe((contas) => this.opcoesContas.set(contas));
  }

  onContaTextoChange(): void {
    const texto = this.contaTexto.value.trim();
    const encontrada = this.opcoesContas().find((item) => this.rotuloContaCorrente(item) === texto);
    this.contaEncontrada.set(encontrada ?? null);
    this.form.patchValue({ contaCorrenteId: encontrada ? encontrada.conta.id : null });
    this.form.controls.contaCorrenteId.markAsTouched();
  }

  onValorInput(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const { exibicao, valor } = processarMascaraMoeda(input.value);
    // Escreve direto no elemento (mesmo motivo do RangeFieldComponent): se
    // o texto sanitizado não mudar, o binding [value] sozinho não
    // reescreveria o DOM e uma letra digitada ficaria "colada" no campo.
    input.value = exibicao;
    this.valorExibicao.set(exibicao);
    this.form.controls.valor.setValue(valor);
    this.form.controls.valor.markAsTouched();
  }

  onArquivosSelecionados(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.adicionarArquivos(input.files);
    input.value = '';
  }

  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastandoArquivo.set(true);
  }

  onDragLeave(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastandoArquivo.set(false);
  }

  onDrop(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastandoArquivo.set(false);
    this.adicionarArquivos(evento.dataTransfer?.files ?? null);
  }

  removerDocumento(indice: number): void {
    const atualizados = this.documentos().filter((_, i) => i !== indice);
    this.documentos.set(atualizados);
    this.form.controls.documentos.setValue(atualizados);
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.facade
      .incluirLancamento({
        contaCorrenteId: valores.contaCorrenteId!,
        valor: valores.valor!,
        historico: valores.historico as (typeof HISTORICOS_DISPONIVEIS)[number],
        estorno: valores.estorno,
        documentos: valores.documentos,
        descricao: valores.descricao,
      })
      .subscribe({
        next: (lote) => {
          const ultimo = lote.lancamentos[lote.lancamentos.length - 1];
          this.lancamentosIncluidos.update((atuais) => [...atuais, ultimo]);
          this.enviando.set(false);
          this.resetarFormularioNovoLancamento();
        },
        error: () => this.enviando.set(false),
      });
  }

  fechar(): void {
    this.contaTexto.setValue('');
    this.contaEncontrada.set(null);
    this.valorExibicao.set('');
    this.documentos.set([]);
    this.lancamentosIncluidos.set([]);
    this.form.reset({
      contaCorrenteId: null,
      valor: null,
      historico: '',
      estorno: false,
      documentos: [],
      descricao: '',
      pa: '',
    });
    this.closed.emit();
  }

  /** Ação sem lógica real nesta spec — só a inclusão está implementada. */
  acaoPlaceholder(_lancamento: Lancamento, _acao: 'visualizar' | 'alterar' | 'excluir' | 'duplicar'): void {
    // Intencionalmente vazio: Visualizar/Alterar/Excluir/Duplicar de um
    // lançamento já incluído são spec futura.
  }

  private adicionarArquivos(arquivos: FileList | null): void {
    if (!arquivos || arquivos.length === 0) return;
    const novos = Array.from(arquivos).map((arquivo) => ({ nome: arquivo.name }));
    const atualizados = [...this.documentos(), ...novos];
    this.documentos.set(atualizados);
    this.form.controls.documentos.setValue(atualizados);
    this.form.controls.documentos.markAsTouched();
  }

  private resetarFormularioNovoLancamento(): void {
    this.documentos.set([]);
    this.valorExibicao.set('');
    this.form.patchValue({
      valor: null,
      historico: '',
      estorno: false,
      documentos: [],
      descricao: '',
    });
    this.form.controls.valor.markAsPristine();
    this.form.controls.valor.markAsUntouched();
    this.form.controls.historico.markAsPristine();
    this.form.controls.historico.markAsUntouched();
    this.form.controls.documentos.markAsPristine();
    this.form.controls.documentos.markAsUntouched();
  }
}
