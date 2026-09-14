import { Component, effect, input, output, signal } from '@angular/core';

export type TipoAviso = 'success' | 'warning' | 'info';

const ICONE_POR_TIPO: Record<TipoAviso, string> = {
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  info: 'pi-info-circle',
};

/**
 * Aviso curto (não é modal) com barra de progresso mostrando o tempo se
 * esvaindo — fecha sozinho depois de `tempo` segundos. Genérico: quem usa
 * decide título/mensagem/tipo/tempo.
 */
@Component({
  selector: 'app-aviso-toast',
  standalone: true,
  templateUrl: './aviso-toast.component.html',
  styleUrl: './aviso-toast.component.scss',
})
export class AvisoToastComponent {
  readonly visible = input(false);
  readonly titulo = input('');
  readonly mensagem = input('');
  readonly tipo = input<TipoAviso>('info');
  /** Duração em segundos até fechar sozinho. */
  readonly tempo = input(3);

  readonly fechado = output<void>();

  readonly progresso = signal(100);
  readonly transicaoBarra = signal('none');

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(
      () => {
        if (this.visible()) {
          this.iniciarContagem();
        } else {
          this.pararContagem();
        }
      },
      { allowSignalWrites: true },
    );
  }

  icone(): string {
    return ICONE_POR_TIPO[this.tipo()];
  }

  fechar(): void {
    this.pararContagem();
    this.fechado.emit();
  }

  private iniciarContagem(): void {
    this.pararContagem();
    // Sem transição + 100%, depois (no próximo frame) liga a transição CSS
    // e zera — o navegador anima a barra suavemente de 100% a 0%.
    this.transicaoBarra.set('none');
    this.progresso.set(100);
    requestAnimationFrame(() => {
      this.transicaoBarra.set(`width ${this.tempo()}s linear`);
      this.progresso.set(0);
    });
    this.timeoutId = setTimeout(() => this.fechar(), this.tempo() * 1000);
  }

  private pararContagem(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
