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
    component.change.subscribe((v: RangeFieldValue) => (ultimo = v));

    const [de, ate] = inputs();
    de.value = '10';
    de.dispatchEvent(new Event('input'));
    ate.value = '20';
    ate.dispatchEvent(new Event('input'));

    expect(ultimo).toEqual({ de: 10, ate: 20 });
  });

  it('emite null quando o campo é limpo', () => {
    let ultimo: RangeFieldValue | undefined;
    component.change.subscribe((v: RangeFieldValue) => (ultimo = v));

    const [de] = inputs();
    de.value = '';
    de.dispatchEvent(new Event('input'));

    expect(ultimo).toEqual({ de: null, ate: null });
  });
});
