import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

import { CurrencyBRLPipe } from './shared/pipes/currency.pipe';
import { DateBrPipe } from './shared/pipes/date.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    CardModule,
    InputTextModule,
    CurrencyBRLPipe,
    DateBrPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'mirante';

  // Exemplos usados na tela inicial para demonstrar os pipes pt-BR.
  exemploValor = 1234.5;
  exemploData = new Date();
}
