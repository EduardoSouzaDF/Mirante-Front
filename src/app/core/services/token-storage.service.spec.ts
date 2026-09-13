import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    service.limpar();
  });

  afterEach(() => service.limpar());

  it('salva e recupera token e usuário em cookie', () => {
    service.salvar(
      'abc.def.ghi',
      { nome: 'Administrador', email: 'admin@mirante.com.br' },
      true,
    );
    expect(service.obterToken()).toBe('abc.def.ghi');
    expect(service.obterUsuario()?.nome).toBe('Administrador');
    expect(service.obterUsuario()?.email).toBe('admin@mirante.com.br');
  });

  it('limpa a sessão', () => {
    service.salvar('abc', { nome: 'x', email: 'x@x.com' }, true);
    service.limpar();
    expect(service.obterToken()).toBeNull();
    expect(service.obterUsuario()).toBeNull();
  });

  it('retorna null quando não há sessão', () => {
    expect(service.obterToken()).toBeNull();
    expect(service.obterUsuario()).toBeNull();
  });
});
