import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storage: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorageService);
    storage.limpar();
  });

  afterEach(() => {
    httpMock.verify();
    storage.limpar();
  });

  it('faz login em POST /api/auth/login com o corpo correto', () => {
    service.login('admin@mirante.com.br', '123456').subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'admin@mirante.com.br',
      senha: '123456',
    });
    req.flush({ token: 'abc.def.ghi', user: { nome: 'Administrador', email: 'admin@mirante.com.br' } });
  });

  it('salvaSessao marca o usuário como autenticado e guarda o token', () => {
    service.salvarSessao(
      {
        token: 'abc.def.ghi',
        user: { nome: 'Administrador', email: 'admin@mirante.com.br' },
      },
      true,
    );
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.usuario()?.email).toBe('admin@mirante.com.br');
    expect(service.obterToken()).toBe('abc.def.ghi');
  });

  it('logout limpa a sessão', () => {
    service.salvarSessao(
      { token: 'abc', user: { nome: 'x', email: 'x@x.com' } },
      true,
    );
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.usuario()).toBeNull();
    expect(service.obterToken()).toBeNull();
  });

  it('envia reset de senha para /api/auth/reset-password', () => {
    service.resetSenha('admin@mirante.com.br').subscribe();
    const req = httpMock.expectOne('/api/auth/reset-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@mirante.com.br' });
    req.flush({ message: 'OK' });
  });
});
