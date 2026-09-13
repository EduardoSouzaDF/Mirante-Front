import { expect, test } from '@playwright/test';

/**
 * Smoke test do fluxo de login (Spec 0003).
 * Requer mock server (3100) e ng serve (4200) no ar.
 */
test.describe('Login — Spec 0003', () => {
  test('exibe a tela de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Mirante')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByText('Manter conectado')).toBeVisible();
    await expect(page.getByText('Esqueci minha senha')).toBeVisible();
  });

  test('exibe mensagem de erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('inexistente@mirante.com.br');
    await page.getByLabel('Senha').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Email não encontrado')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('entra com credenciais válidas e chega ao dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@mirante.com.br');
    await page.getByLabel('Senha').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Bem-vindo, Administrador!')).toBeVisible();
    await expect(page.getByText('R$ 1.234,50')).toBeVisible();
  });

  test('reset de senha exibe feedback OK (mock)', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Esqueci minha senha').click();
    await page.getByLabel('Email').fill('admin@mirante.com.br');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByText('OK — instruções enviadas')).toBeVisible({
      timeout: 10_000,
    });
  });
});
