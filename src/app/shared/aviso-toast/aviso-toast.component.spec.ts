import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AvisoToastComponent } from './aviso-toast.component';

describe('AvisoToastComponent', () => {
  let fixture: ComponentFixture<AvisoToastComponent>;
  let component: AvisoToastComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(AvisoToastComponent);
    component = fixture.componentInstance;
  });

  it('não renderiza nada quando visible é false', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.aviso-toast')).toBeFalsy();
  });

  it('mostra título, mensagem e ícone do tipo quando visível', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('titulo', 'Sucesso');
    fixture.componentRef.setInput('mensagem', 'Lançamento incluído.');
    fixture.componentRef.setInput('tipo', 'success');
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Sucesso');
    expect(texto).toContain('Lançamento incluído.');
    expect(fixture.nativeElement.querySelector('.aviso-toast--success')).toBeTruthy();
  });

  it('fecha sozinho depois de `tempo` segundos', fakeAsync(() => {
    let fechou = false;
    component.fechado.subscribe(() => (fechou = true));

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('tempo', 3);
    fixture.detectChanges();

    tick(2999);
    expect(fechou).toBeFalse();

    tick(1);
    expect(fechou).toBeTrue();
  }));

  it('fechar() manual dispara o output imediatamente', () => {
    let fechou = false;
    component.fechado.subscribe(() => (fechou = true));

    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    component.fechar();
    expect(fechou).toBeTrue();
  });
});
