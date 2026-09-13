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
  valor: 100,
  quantidadeLancamentos: 1,
  usuarioRegistro: { id: 'u-001', nome: 'gearqc0300_00' },
  usuarioAprovacao: null,
  situacao: 'Aberto',
  dataEntrada: '2026-04-20',
  dataHoraSituacao: '2026-04-20T10:00:00',
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

  it('confirmar() chama POST /api/lotes/:id/confirmar', () => {
    facade.confirmar(1).subscribe();
    const req = httpMock.expectOne('/api/lotes/1/confirmar');
    expect(req.request.method).toBe('POST');
    req.flush({ ...LOTE_MOCK, situacao: 'Confirmado' });
  });
});
