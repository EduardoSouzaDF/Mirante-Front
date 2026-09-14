import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { IncluirLancamentoDialogComponent } from './incluir-lancamento-dialog.component';

const CONTA_MOCK = {
  conta: { id: 4, agencia: 3, conta: 300031, instituicaoId: '0003' },
  instituicao: { id: '0003', nome: '0003 - SICOOB NORTE' },
};

describe('IncluirLancamentoDialogComponent', () => {
  let fixture: ComponentFixture<IncluirLancamentoDialogComponent>;
  let component: IncluirLancamentoDialogComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(IncluirLancamentoDialogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    // Constructor carrega a lista de contas correntes (select pesquisável).
    httpMock.expectOne('/api/contas-correntes').flush({ contas: [CONTA_MOCK] });
  });

  afterEach(() => httpMock.verify());

  it('formulário começa inválido', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('onContaTextoChange() com o rótulo exato preenche contaCorrenteId', () => {
    component.contaTexto.setValue(component.rotuloContaCorrente(CONTA_MOCK as any));
    component.onContaTextoChange();

    expect(component.form.controls.contaCorrenteId.value).toBe(4);
    expect(component.contaEncontrada()?.instituicao?.nome).toBe('0003 - SICOOB NORTE');
  });

  it('onContaTextoChange() com texto que não bate com nenhuma opção não preenche o id', () => {
    component.contaTexto.setValue('texto qualquer que não existe na lista');
    component.onContaTextoChange();

    expect(component.form.controls.contaCorrenteId.value).toBeNull();
    expect(component.contaEncontrada()).toBeNull();
  });

  it('onValorInput() aplica máscara BRL e preenche o valor numérico do form', () => {
    const input = document.createElement('input');
    input.value = '150000';
    component.onValorInput({ target: input } as unknown as Event);

    expect(input.value.replace(/ /g, ' ')).toBe('R$ 1.500,00');
    expect(component.form.controls.valor.value).toBe(1500);
  });

  it('onValorInput() não deixa caractere inválido grudado (regressão, mesmo bug do RangeField)', () => {
    const input = document.createElement('input');
    input.value = '150000';
    component.onValorInput({ target: input } as unknown as Event);

    input.value = input.value + 'x';
    component.onValorInput({ target: input } as unknown as Event);

    expect(input.value).not.toContain('x');
  });

  it('formulário fica válido só depois de preencher todos os obrigatórios', () => {
    component.form.patchValue({ contaCorrenteId: 4, valor: 100, historico: 'Lançamento Manual' });
    expect(component.form.invalid).toBeTrue(); // falta documento

    component.documentos.set([{ nome: 'comprovante.pdf' }]);
    component.form.controls.documentos.setValue([{ nome: 'comprovante.pdf' }]);
    expect(component.form.valid).toBeTrue();
  });

  it('confirmar() com formulário válido cria o lançamento, fecha a modal e emite incluído', () => {
    component.form.patchValue({ contaCorrenteId: 4, valor: 100, historico: 'Lançamento Manual' });
    component.documentos.set([{ nome: 'comprovante.pdf' }]);
    component.form.controls.documentos.setValue([{ nome: 'comprovante.pdf' }]);

    let incluidoEmitido = false;
    let fechadoEmitido = false;
    component.incluido.subscribe(() => (incluidoEmitido = true));
    component.closed.subscribe(() => (fechadoEmitido = true));

    component.confirmar();

    const req = httpMock.expectOne('/api/lancamentos');
    expect(req.request.body.contaCorrenteId).toBe(4);
    expect(req.request.body.valor).toBe(100);
    req.flush({
      id: 30,
      resp: null,
      instituicao: null,
      usuarioRegistro: null,
      usuarioAprovacao: null,
      situacao: 'Aberto',
      dataEntrada: '2026-09-14',
      dataHoraSituacao: '2026-09-14T00:00:00',
      lancamentos: [
        {
          id: 99,
          contaCorrenteId: 4,
          valor: 100,
          historico: 'Lançamento Manual',
          estorno: false,
          documentos: [{ id: 1, nome: 'comprovante.pdf', pathUrl: '/x' }],
          descricao: '',
          situacao: 'Pendente',
        },
      ],
    });

    // confirmar() dispara recarregarSubject do facade compartilhado, que
    // pode ter (ou não) um assinante de /api/lotes ativo — drena se existir.
    httpMock
      .match(() => true)
      .forEach((r) => r.flush({ data: [], total: 0, page: 1, size: 10, hasNext: false, hasPrevious: false }));

    expect(incluidoEmitido).toBeTrue();
    expect(fechadoEmitido).toBeTrue();
    // fechar() reseta o formulário por completo (modal fecha, não fica pra outro lançamento)
    expect(component.form.controls.valor.value).toBeNull();
    expect(component.form.controls.contaCorrenteId.value).toBeNull();
    expect(component.documentos()).toEqual([]);
  });

  it('confirmar() com formulário inválido não chama a API', () => {
    component.confirmar();
    httpMock.expectNone('/api/lancamentos');
    expect(component.form.controls.valor.touched).toBeTrue();
  });
});
