import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbComponent);
  });

  it('renderiza os itens recebidos por @Input, sem depender da URL', () => {
    fixture.componentRef.setInput('items', [{ label: 'Outros Créditos/Débitos' }]);
    fixture.detectChanges();

    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Início');
    expect(texto).toContain('Outros Créditos/Débitos');
  });

  it('emite home ao clicar no item inicial', () => {
    let emitido = false;
    fixture.componentInstance.home.subscribe(() => (emitido = true));
    fixture.detectChanges();

    const link: HTMLElement = fixture.nativeElement.querySelector(
      '.breadcrumb__item--link',
    );
    link.click();

    expect(emitido).toBeTrue();
  });
});
