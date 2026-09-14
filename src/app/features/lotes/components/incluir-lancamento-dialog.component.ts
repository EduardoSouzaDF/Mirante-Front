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

/** Validador: precisa de ao menos 1 arquivo anexado. */
function aoMenosUmArquivo(control: { value: unknown[] }): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { obrigatorio: true };
}

/**
 * Modal "Incluir Lançamento" — aberta pelo botão Incluir da tela de
 * consulta de lotes. Busca a conta corrente, preenche o formulário e, ao
 * confirmar, cria um lançamento (Pendente) + um lote novo (Aberto) para a
 * instituição da conta (spec 0005).
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

  readonly numeroConta = this.fb.nonNullable.control('');
  readonly buscandoConta = signal(false);
  readonly contaEncontrada = signal<ContaCorrenteBusca | null>(null);
  readonly erroConta = signal<string | null>(null);

  readonly documentos = signal<{ nome: string }[]>([]);

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

  buscarConta(): void {
    const numero = this.numeroConta.value.trim();
    if (!numero) return;

    this.buscandoConta.set(true);
    this.erroConta.set(null);
    this.facade.buscarContaCorrente(numero).subscribe({
      next: (resultado) => {
        this.contaEncontrada.set(resultado);
        this.form.patchValue({ contaCorrenteId: resultado.conta.id });
        this.buscandoConta.set(false);
      },
      error: () => {
        this.contaEncontrada.set(null);
        this.form.patchValue({ contaCorrenteId: null });
        this.erroConta.set('Conta corrente não encontrada.');
        this.buscandoConta.set(false);
      },
    });
  }

  onArquivosSelecionados(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const novos = Array.from(input.files ?? []).map((arquivo) => ({ nome: arquivo.name }));
    const atualizados = [...this.documentos(), ...novos];
    this.documentos.set(atualizados);
    this.form.controls.documentos.setValue(atualizados);
    this.form.controls.documentos.markAsTouched();
    input.value = '';
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
    this.numeroConta.setValue('');
    this.contaEncontrada.set(null);
    this.erroConta.set(null);
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

  private resetarFormularioNovoLancamento(): void {
    this.documentos.set([]);
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
