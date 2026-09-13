import { defineConfig } from '@playwright/test';

/**
 * Playwright — validação visual das telas do MVP Mirante.
 *
 * Rodar os testes:      npm run e2e        (com mock + ng serve no ar)
 * Abrir para validação: npm run e2e:open   (abre o navegador p/ conferir)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    // Usa o Chrome já instalado na máquina (evita baixar o Chromium).
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
});
