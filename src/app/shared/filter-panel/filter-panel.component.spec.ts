import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPanelComponent } from './filter-panel.component';
import { FiltroLote } from '../../core/models/lote.model';

describe('FilterPanelComponent', () => {
  let fixture: ComponentFixture<FilterPanelComponent>;
  let component: FilterPanelComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emite pesquisar com o filtro padrão (situação = Todas) ao clicar em Pesquisar', () => {
    let emitido: FiltroLote | undefined;
    component.pesquisar.subscribe((f: FiltroLote) => (emitido = f));

    const botao: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.filter-panel__pesquisar',
    );
    botao.click();

    expect(emitido?.situacao).toBe('Todas');
  });

  it('alterna expandido/recolhido ao clicar no cabeçalho', () => {
    expect(component.expandido()).toBeTrue();
    const header: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.filter-panel__header',
    );
    header.click();
    expect(component.expandido()).toBeFalse();
  });
});
