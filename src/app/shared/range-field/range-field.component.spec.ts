import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeFieldComponent, RangeFieldValue } from './range-field.component';

describe('RangeFieldComponent', () => {
  let fixture: ComponentFixture<RangeFieldComponent>;
  let component: RangeFieldComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function inputs(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input'));
  }

  it('emite { de, ate } ao preencher os dois campos (tipo number)', () => {
    let ultimo: RangeFieldValue | undefined;
    component.rangeChange.subscribe((v: RangeFieldValue) => (ultimo = v));

    const [de, ate] = inputs();
    de.value = '10';
    de.dispatchEvent(new Event('input'));
    ate.value = '20';
    ate.dispatchEvent(new Event('input'));

    expect(ultimo).toEqual({ de: 10, ate: 20 });
  });

  it('emite null quando o campo é limpo', () => {
    let ultimo: RangeFieldValue | undefined;
    component.rangeChange.subscribe((v: RangeFieldValue) => (ultimo = v));

    const [de] = inputs();
    de.value = '';
    de.dispatchEvent(new Event('input'));

    expect(ultimo).toEqual({ de: null, ate: null });
  });

  it('não deixa caractere inválido grudado no campo de moeda (regressão)', () => {
    fixture.componentRef.setInput('type', 'currency');
    fixture.detectChanges();
    const [de] = inputs();

    de.value = '150000';
    de.dispatchEvent(new Event('input'));
    expect(de.value.endsWith('1.500,00')).toBeTrue();

    // Simula o navegador inserindo uma letra ao final do valor já mascarado
    // — o texto sanitizado resultante é igual ao anterior, então o binding
    // [value] sozinho não reescreveria o DOM (ver fix aplicado no componente).
    de.value = de.value + 'x';
    de.dispatchEvent(new Event('input'));
    expect(de.value).not.toContain('x');
    expect(de.value.endsWith('1.500,00')).toBeTrue();
  });
});
