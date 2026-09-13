import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteTableComponent } from './lote-table.component';
import { Lote } from '../../core/models/lote.model';

function loteMock(id: number): Lote {
  return {
    id,
    resp: { id: '0001', nome: '0001 - SICOOB' },
    instituicao: { id: '0001', nome: '0001 - SICOOB' },
    valor: 100,
    quantidadeLancamentos: 1,
    usuarioRegistro: { id: 'u-001', nome: 'gearqc0300_00' },
    usuarioAprovacao: null,
    situacao: 'Aberto',
    dataEntrada: '2026-04-20',
    dataHoraSituacao: '2026-04-20T10:00:00',
  };
}

describe('LoteTableComponent', () => {
  let fixture: ComponentFixture<LoteTableComponent>;
  let component: LoteTableComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoteTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lotes', [loteMock(1), loteMock(2)]);
    fixture.componentRef.setInput('total', 2);
    fixture.componentRef.setInput('selectedIds', new Set<number>());
    fixture.detectChanges();
  });

  it('"selecionar todos" seleciona todos os lotes da página', () => {
    let emitido: Set<number> | undefined;
    component.selectionChange.subscribe((s: Set<number>) => (emitido = s));

    const headerCheckbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'thead input[type="checkbox"]',
    );
    headerCheckbox.click();

    expect(emitido).toEqual(new Set([1, 2]));
  });

  it('fica indeterminate quando só parte das linhas está selecionada', () => {
    fixture.componentRef.setInput('selectedIds', new Set([1]));
    fixture.detectChanges();

    expect(component.algumSelecionado()).toBeTrue();
    expect(component.todosSelecionados()).toBeFalse();
  });
});
