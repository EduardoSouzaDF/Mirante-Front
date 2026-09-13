import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { TokenStorageService } from './token-storage.service';

export interface UsuarioSessao {
  nome: string;
  email: string;
}

interface LoginResposta {
  token: string;
  user: UsuarioSessao;
}

/**
 * Serviço de autenticação: login, reset de senha, logout e estado da sessão.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);

  readonly isAuthenticated = signal<boolean>(this.temToken());
  readonly usuario = signal<UsuarioSessao | null>(this.storage.obterUsuario());

  login(email: string, senha: string) {
    return this.http.post<LoginResposta>('/api/auth/login', { email, senha });
  }

  resetSenha(email: string) {
    return this.http.post<{ message: string }>('/api/auth/reset-password', {
      email,
    });
  }

  salvarSessao(resposta: LoginResposta, manterConectado: boolean): void {
    this.storage.salvar(resposta.token, resposta.user, manterConectado);
    this.isAuthenticated.set(true);
    this.usuario.set(resposta.user);
  }

  logout(): void {
    this.storage.limpar();
    this.isAuthenticated.set(false);
    this.usuario.set(null);
  }

  obterToken(): string | null {
    return this.storage.obterToken();
  }

  private temToken(): boolean {
    return !!this.storage.obterToken();
  }
}
