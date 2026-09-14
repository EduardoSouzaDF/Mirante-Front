import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { LoteFacade } from './lote.facade';
import { FiltrosLoteOpcoes, PaginatedResponse, Lote } from '../models/lote.model';

const LOTE_MOCK: Lote = {
  id: 1,
  resp: { id: '0001', nome: '0001 - SICOOB' },
  instituicao: { id: '0001', nome: '0001 - SICOOB' },
  usuarioRegistro: { id: 'u-001', nome: 'gearqc0300_00' },
  usuarioAprovacao: null,
  situacao: 'Aberto',
  dataEntrada: '2026-04-20',
  dataHoraSituacao: '2026-04-20T10:00:00',
  lancamentos: [
    {
      id: 1,
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

const PAGINA_MOCK: PaginatedResponse<Lote> = {
  data: [LOTE_MOCK],
  total: 1,
  page: 1,
  size: 10,
  hasNext: false,
  hasPrevious: false,
};

describe('LoteFacade', () => {
  let facade: LoteFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    facade = TestBed.inject(LoteFacade);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('carregarFiltros() emite as opções vindas do backend', (done) => {
    const opcoes: FiltrosLoteOpcoes = {
      instituicoes: [{ id: '0001', nome: '0001 - SICOOB' }],
      instituicoesResponsaveis: [{ id: '0001', nome: '0001 - SICOOB' }],
      situacoes: ['Aberto', 'Confirmado', 'Enviado'],
    };
    facade.filtrosOptions$.subscribe((recebido) => {
      expect(recebido).toEqual(opcoes);
      done();
    });
    facade.carregarFiltros();
    httpMock.expectOne('/api/filtros/lotes').flush(opcoes);
  });

  it('carregarFiltros() usa fallback em memória se o backend falhar', (done) => {
    facade.filtrosOptions$.subscribe((recebido) => {
      expect(recebido.situacoes).toEqual(['Aberto', 'Confirmado', 'Enviado']);
      done();
    });
    facade.carregarFiltros();
    httpMock.expectOne('/api/filtros/lotes').flush(null, { status: 500, statusText: 'Erro' });
  });

  it('pesquisar() dispara GET /api/lotes com os filtros e atualiza lotes$/total$', (done) => {
    let emissoes = 0;
    facade.lotes$.subscribe((lotes) => {
      emissoes++;
      if (emissoes === 2) {
        expect(lotes).toEqual([LOTE_MOCK]);
        done();
      }
    });

    // Emissão inicial (filtro/page/size padrão), disparada só de assinar.
    httpMock
      .expectOne((r) => r.url.startsWith('/api/lotes'))
      .flush({ ...PAGINA_MOCK, data: [], total: 0 });

    facade.pesquisar({ situacao: 'Aberto' });
    const req = httpMock.expectOne((r) => r.url.startsWith('/api/lotes'));
    expect(req.request.params.get('situacao')).toBe('Aberto');
    req.flush(PAGINA_MOCK);
  });

  it('confirmarEmMassa() faz uma única chamada POST /api/lotes/confirmar com todos os ids', () => {
    facade.confirmarEmMassa([1, 2, 3]).subscribe();
    const req = httpMock.expectOne('/api/lotes/confirmar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ids: [1, 2, 3] });
    req.flush({ lotes: [{ ...LOTE_MOCK, situacao: 'Confirmado' }] });
  });

  it('enviarEmMassa() faz uma única chamada POST /api/lotes/enviar com todos os ids', () => {
    facade.enviarEmMassa([4, 5]).subscribe();
    const req = httpMock.expectOne('/api/lotes/enviar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ids: [4, 5] });
    req.flush({ lotes: [] });
  });

  it('justificativaEmMassa() faz uma única chamada POST /api/lotes/justificativa com todos os ids', () => {
    facade.justificativaEmMassa([7]).subscribe();
    const req = httpMock.expectOne('/api/lotes/justificativa');
    expect(req.request.body).toEqual({ ids: [7] });
    req.flush({ message: 'OK (placeholder)' });
  });

  it('buscarContaCorrente() chama GET /api/contas-correntes com o número', () => {
    facade.buscarContaCorrente('300031').subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === '/api/contas-correntes' && r.params.get('numero') === '300031',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ conta: { id: 4, agencia: 3, conta: 300031, instituicaoId: '0003' }, instituicao: { id: '0003', nome: '0003 - SICOOB NORTE' } });
  });

  it('listarContasCorrentes() chama GET /api/contas-correntes sem número e devolve o array', (done) => {
    facade.listarContasCorrentes().subscribe((contas) => {
      expect(contas.length).toBe(1);
      expect(contas[0].conta.id).toBe(4);
      done();
    });
    const req = httpMock.expectOne('/api/contas-correntes');
    expect(req.request.params.has('numero')).toBeFalse();
    req.flush({
      contas: [
        { conta: { id: 4, agencia: 3, conta: 300031, instituicaoId: '0003' }, instituicao: { id: '0003', nome: '0003 - SICOOB NORTE' } },
      ],
    });
  });

  it('incluirLancamento() chama POST /api/lancamentos com o payload', () => {
    const payload = {
      contaCorrenteId: 4,
      valor: 100,
      historico: 'Lançamento Manual' as const,
      estorno: false,
      documentos: [{ nome: 'doc.pdf' }],
      descricao: '',
    };
    facade.incluirLancamento(payload).subscribe();
    const req = httpMock.expectOne('/api/lancamentos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(LOTE_MOCK);
  });
});
