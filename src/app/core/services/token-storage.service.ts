import { Injectable } from '@angular/core';

const TOKEN_KEY = 'mirante_token';
const USER_KEY = 'mirante_user';

// "Manter conectado": cookie persistente de 30 dias.
// Sem a opção, o cookie é de sessão (some ao fechar o navegador).
const DIAS_MANTEM_CONECTADO = 30 * 24 * 60 * 60;

interface UsuarioSessao {
  nome: string;
  email: string;
}

/**
 * Guarda o token (e o usuário) em cookies do navegador.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  salvar(token: string, usuario: UsuarioSessao, manterConectado: boolean): void {
    const maxAge = manterConectado ? DIAS_MANTEM_CONECTADO : undefined;
    document.cookie = this.montarCookie(TOKEN_KEY, token, maxAge);
    document.cookie = this.montarCookie(
      USER_KEY,
      encodeURIComponent(JSON.stringify(usuario)),
      maxAge,
    );
  }

  obterToken(): string | null {
    return this.lerCookie(TOKEN_KEY);
  }

  obterUsuario(): UsuarioSessao | null {
    const cru = this.lerCookie(USER_KEY);
    if (!cru) {
      return null;
    }
    try {
      return JSON.parse(decodeURIComponent(cru)) as UsuarioSessao;
    } catch {
      return null;
    }
  }

  limpar(): void {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
    document.cookie = `${USER_KEY}=; path=/; max-age=0`;
  }

  private montarCookie(nome: string, valor: string, maxAge?: number): string {
    let cookie = `${nome}=${valor}; path=/; SameSite=Lax`;
    if (maxAge !== undefined) {
      cookie += `; max-age=${maxAge}`;
    }
    return cookie;
  }

  private lerCookie(nome: string): string | null {
    const prefixo = `${nome}=`;
    const encontrado = document.cookie
      .split('; ')
      .find((parte) => parte.startsWith(prefixo));
    return encontrado ? encontrado.slice(prefixo.length) : null;
  }
}
