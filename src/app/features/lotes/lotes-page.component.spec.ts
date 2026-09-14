import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { LotesPageComponent } from './lotes-page.component';
import { Lote } from '../../core/models/lote.model';

const RESULTADO_VAZIO = {
  data: [],
  total: 0,
  page: 1,
  size: 10,
  hasNext: false,
  hasPrevious: false,
};

function loteMock(id: number, situacao: Lote['situacao']): Lote {
  return {
    id,
    resp: { id: '0001', nome: '0001 - SICOOB' },
    instituicao: { id: '0001', nome: '0001 - SICOOB' },
    usuarioRegistro: { id: 'u-001', nome: 'gearqc0300_00' },
    usuarioAprovacao: null,
    situacao,
    dataEntrada: '2026-04-20',
    dataHoraSituacao: '2026-04-20T10:00:00',
    lancamentos: [
      {
        id,
        contaCorrenteId: 1,
        valor: 100,
        historico: 'Lançamento Manual',
        estorno: false,
        documentos: [{ id: 1, nome: 'doc.pdf', pathUrl: '/mock-files/doc.pdf' }],
        descricao: '',
        situacao: 'Confirmado',
      },
    ],
  };
}

describe('LotesPageComponent', () => {
  let fixture: ComponentFixture<LotesPageComponent>;
  let component: LotesPageComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(LotesPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Requisições disparadas ao criar o componente: carregarFiltros() no
    // construtor + a busca inicial automática ao assinar lotes$/total$.
    httpMock
      .expectOne((r) => r.url.startsWith('/api/filtros/lotes'))
      .flush({ instituicoes: [], instituicoesResponsaveis: [], situacoes: [] });
    httpMock.expectOne((r) => r.url.startsWith('/api/lotes')).flush(RESULTADO_VAZIO);
  });

  afterEach(() => httpMock.verify());

  it('onPesquisar() inclui a faixa De/Até de ID Lote no filtro enviado (regressão do bug de filtros)', () => {
    component.onIdChange({ de: 3, ate: 4 });
    component.onPesquisar();

    const req = httpMock.expectOne((r) => r.url.startsWith('/api/lotes'));
    expect(req.request.params.get('idDe')).toBe('3');
    expect(req.request.params.get('idAte')).toBe('4');
    req.flush(RESULTADO_VAZIO);
  });

  it('onPesquisar() sem nenhum campo preenchido manda situacao=Todas', () => {
    component.onPesquisar();

    const req = httpMock.expectOne((r) => r.url.startsWith('/api/lotes'));
    expect(req.request.params.get('situacao')).toBe('Todas');
    req.flush(RESULTADO_VAZIO);
  });

  it('onAction("confirmar") só envia os ids Abertos dentre os selecionados', () => {
    component.onPesquisar();
    httpMock.expectOne((r) => r.url.startsWith('/api/lotes')).flush({
      data: [loteMock(1, 'Aberto'), loteMock(2, 'Confirmado'), loteMock(3, 'Enviado')],
      total: 3,
      page: 1,
      size: 10,
      hasNext: false,
      hasPrevious: false,
    });

    (component as any).facade.setSelecionados(new Set([1, 2, 3]));
    component.onAction('confirmar');

    const req = httpMock.expectOne('/api/lotes/confirmar');
    expect(req.request.body).toEqual({ ids: [1] });
    req.flush({ lotes: [] });

    // confirmarEmMassa() recarrega a listagem após o POST.
    httpMock.expectOne((r) => r.url.startsWith('/api/lotes')).flush(RESULTADO_VAZIO);
  });

  it('onAction("enviar") só envia os ids Confirmados dentre os selecionados', () => {
    component.onPesquisar();
    httpMock.expectOne((r) => r.url.startsWith('/api/lotes')).flush({
      data: [loteMock(1, 'Aberto'), loteMock(2, 'Confirmado'), loteMock(3, 'Enviado')],
      total: 3,
      page: 1,
      size: 10,
      hasNext: false,
      hasPrevious: false,
    });

    (component as any).facade.setSelecionados(new Set([1, 2, 3]));
    component.onAction('enviar');

    const req = httpMock.expectOne('/api/lotes/enviar');
    expect(req.request.body).toEqual({ ids: [2] });
    req.flush({ lotes: [] });

    // enviarEmMassa() recarrega a listagem após o POST.
    httpMock.expectOne((r) => r.url.startsWith('/api/lotes')).flush(RESULTADO_VAZIO);
  });

  it('onAction("incluir") abre a modal de inclusão de lançamento', () => {
    expect((component as any).incluirModalVisivel()).toBeFalse();
    component.onAction('incluir');
    expect((component as any).incluirModalVisivel()).toBeTrue();
  });
});
