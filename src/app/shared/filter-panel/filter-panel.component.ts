import { Component, input, signal } from '@angular/core';

/**
 * Painel recolhível genérico: título/subtítulo por @Input, conteúdo do
 * corpo inteiramente projetado por quem usa o componente (`<ng-content>`).
 */
@Component({
  selector: 'app-filter-panel',
  standalone: true,
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent {
  readonly titulo = input('Filtros');
  readonly subtitulo = input('');

  readonly expandido = signal(true);

  alternar(): void {
    this.expandido.set(!this.expandido());
  }
}
