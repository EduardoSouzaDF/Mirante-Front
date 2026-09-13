import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoadingIndicatorComponent } from './shared/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingIndicatorComponent],
  template: `
    <app-loading-indicator />
    <router-outlet />
  `,
})
export class AppComponent {
  title = 'mirante';
}

