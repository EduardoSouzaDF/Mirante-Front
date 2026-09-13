import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableComponent } from './generic-table.component';

interface ItemTeste {
  id: number;
  nome: string;
}

@Component({
  standalone: true,
  imports: [GenericTableComponent],
  template: `
    <app-generic-table
      [items]="items"
      [total]="items.length"
      [selectedIds]="selectedIds"
      (selectionChange)="selectedIds = $event"
    >
      <ng-template #header>
        <th>Nome</th>
      </ng-template>
      <ng-template #row let-item>
        <td>{{ item.nome }}</td>
      </ng-template>
    </app-generic-table>
  `,
})
class HostTestComponent {
  items: ItemTeste[] = [
    { id: 1, nome: 'Um' },
    { id: 2, nome: 'Dois' },
  ];
  selectedIds = new Set<number>();
}

describe('GenericTableComponent', () => {
  let fixture: ComponentFixture<HostTestComponent>;
  let host: HostTestComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostTestComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('projeta o cabeçalho e as linhas fornecidos por quem usa o componente', () => {
    expect(fixture.nativeElement.textContent).toContain('Nome');
    expect(fixture.nativeElement.textContent).toContain('Um');
    expect(fixture.nativeElement.textContent).toContain('Dois');
  });

  it('"selecionar todos" seleciona todos os itens', () => {
    const headerCheckbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'thead input[type="checkbox"]',
    );
    headerCheckbox.click();
    fixture.detectChanges();

    expect(host.selectedIds).toEqual(new Set([1, 2]));
  });

  it('fica indeterminate quando só parte das linhas está selecionada', () => {
    host.selectedIds = new Set([1]);
    fixture.detectChanges();

    const table = fixture.debugElement.children[0].componentInstance as GenericTableComponent<ItemTeste>;
    expect(table.algumSelecionado()).toBeTrue();
    expect(table.todosSelecionados()).toBeFalse();
  });
});
