import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { IncluirLancamentoDialogComponent } from './incluir-lancamento-dialog.component';

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
  });

  afterEach(() => httpMock.verify());

  it('formulário começa inválido', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('buscarConta() encontra a conta e preenche contaCorrenteId', () => {
    component.numeroConta.setValue('300031');
    component.buscarConta();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/contas-correntes' && r.params.get('numero') === '300031',
    );
    req.flush({
      conta: { id: 4, agencia: 3, conta: 300031, instituicaoId: '0003' },
      instituicao: { id: '0003', nome: '0003 - SICOOB NORTE' },
    });

    expect(component.form.controls.contaCorrenteId.value).toBe(4);
    expect(component.contaEncontrada()?.instituicao?.nome).toBe('0003 - SICOOB NORTE');
  });

  it('buscarConta() sem encontrar mostra erro e não preenche o id', () => {
    component.numeroConta.setValue('000000');
    component.buscarConta();

    const req = httpMock.expectOne((r) => r.url === '/api/contas-correntes');
    req.flush({ message: 'não encontrada' }, { status: 404, statusText: 'Not Found' });

    expect(component.form.controls.contaCorrenteId.value).toBeNull();
    expect(component.erroConta()).toBeTruthy();
  });

  it('formulário fica válido só depois de preencher todos os obrigatórios', () => {
    component.form.patchValue({ contaCorrenteId: 4, valor: 100, historico: 'Lançamento Manual' });
    expect(component.form.invalid).toBeTrue(); // falta documento

    component.documentos.set([{ nome: 'comprovante.pdf' }]);
    component.form.controls.documentos.setValue([{ nome: 'comprovante.pdf' }]);
    expect(component.form.valid).toBeTrue();
  });

  it('confirmar() com formulário válido cria o lançamento e limpa pro próximo', () => {
    component.form.patchValue({ contaCorrenteId: 4, valor: 100, historico: 'Lançamento Manual' });
    component.documentos.set([{ nome: 'comprovante.pdf' }]);
    component.form.controls.documentos.setValue([{ nome: 'comprovante.pdf' }]);

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

    // recarregarSubject dispara um refresh da listagem em algum lugar do
    // facade compartilhado — não relevante aqui, então drena se existir.
    httpMock.match(() => true).forEach((r) => r.flush({ data: [], total: 0, page: 1, size: 10, hasNext: false, hasPrevious: false }));

    expect(component.lancamentosIncluidos().length).toBe(1);
    expect(component.lancamentosIncluidos()[0].id).toBe(99);
    // formulário reseta os campos do lançamento (mas mantém a conta encontrada)
    expect(component.form.controls.valor.value).toBeNull();
    expect(component.documentos()).toEqual([]);
  });

  it('confirmar() com formulário inválido não chama a API', () => {
    component.confirmar();
    httpMock.expectNone('/api/lancamentos');
    expect(component.form.controls.valor.touched).toBeTrue();
  });
});
