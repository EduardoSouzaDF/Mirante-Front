import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/**
 * Tela de login do MVP — email/senha, manter conectado, mensagens de erro
 * da API e form de reset de senha (fake, sempre OK).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly enviando = signal(false);
  readonly erroApi = signal<string | null>(null);
  readonly resetEnviado = signal(false);
  readonly modoReset = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    manterConectado: [false],
  });

  readonly resetForm = this.fb.nonNullable.group({
    emailReset: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    // Já autenticado? Vai direto para o dashboard.
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  entrar(): void {
    this.erroApi.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, senha, manterConectado } = this.form.getRawValue();
    this.enviando.set(true);
    this.auth.login(email, senha).subscribe({
      next: (resposta) => {
        this.auth.salvarSessao(resposta, manterConectado);
        this.enviando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (erro) => {
        this.enviando.set(false);
        this.erroApi.set(
          erro?.error?.message ?? 'Erro ao autenticar. Tente novamente.',
        );
      },
    });
  }

  abrirReset(): void {
    this.modoReset.set(true);
    this.erroApi.set(null);
    this.resetEnviado.set(false);
  }

  voltarLogin(): void {
    this.modoReset.set(false);
    this.resetEnviado.set(false);
  }

  enviarReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const { emailReset } = this.resetForm.getRawValue();
    this.auth.resetSenha(emailReset).subscribe({
      // Mock: sempre OK.
      next: () => this.resetEnviado.set(true),
      error: () => this.resetEnviado.set(true),
    });
  }
}
