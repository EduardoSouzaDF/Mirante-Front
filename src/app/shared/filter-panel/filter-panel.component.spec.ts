import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPanelComponent } from './filter-panel.component';

@Component({
  standalone: true,
  imports: [FilterPanelComponent],
  template: `
    <app-filter-panel titulo="Filtros" subtitulo="Sub-título de teste">
      <span class="conteudo-projetado">conteúdo</span>
    </app-filter-panel>
  `,
})
class HostTestComponent {}

describe('FilterPanelComponent', () => {
  let fixture: ComponentFixture<HostTestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostTestComponent);
    fixture.detectChanges();
  });

  it('exibe título e subtítulo recebidos por @Input', () => {
    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Filtros');
    expect(texto).toContain('Sub-título de teste');
  });

  it('projeta o conteúdo do corpo via ng-content quando expandido', () => {
    expect(
      fixture.nativeElement.querySelector('.conteudo-projetado'),
    ).toBeTruthy();
  });

  it('esconde o conteúdo projetado ao recolher o painel', () => {
    const header: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.filter-panel__header',
    );
    header.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.conteudo-projetado')).toBeFalsy();
  });
});
