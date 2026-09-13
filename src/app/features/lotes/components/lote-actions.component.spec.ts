import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteActionsComponent } from './lote-actions.component';

describe('LoteActionsComponent', () => {
  let fixture: ComponentFixture<LoteActionsComponent>;
  let component: LoteActionsComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoteActionsComponent);
    component = fixture.componentInstance;
  });

  it('com 1 lote selecionado, todos os botões ficam habilitados', () => {
    fixture.componentRef.setInput('selectionMode', 'one');
    fixture.detectChanges();
    expect(component.habilitado('alterar')).toBeTrue();
    expect(component.habilitado('visualizar')).toBeTrue();
    expect(component.habilitado('confirmar')).toBeTrue();
  });

  it('com vários lotes selecionados, Alterar/Visualizar ficam desabilitados', () => {
    fixture.componentRef.setInput('selectionMode', 'many');
    fixture.detectChanges();
    expect(component.habilitado('alterar')).toBeFalse();
    expect(component.habilitado('visualizar')).toBeFalse();
    expect(component.habilitado('confirmar')).toBeTrue();
  });

  it('sem seleção, só Incluir fica habilitado', () => {
    fixture.componentRef.setInput('selectionMode', 'none');
    fixture.detectChanges();
    expect(component.habilitado('incluir')).toBeTrue();
    expect(component.habilitado('confirmar')).toBeFalse();
    expect(component.habilitado('alterar')).toBeFalse();
  });
});
