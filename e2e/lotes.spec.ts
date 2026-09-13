import { expect, test } from '@playwright/test';

/**
 * Smoke test da tela "Outros Créditos/Débitos" (Spec 0004).
 * Requer mock server (3100) e ng serve (4200) no ar.
 */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@mirante.com.br');
  await page.getByLabel('Senha').fill('123456');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
    timeout: 10_000,
  });
}

test.describe('Consultar Lotes — Spec 0004', () => {
  test('lista os lotes e permite selecionar um deles', async ({ page }) => {
    await login(page);
    await page.goto('/lotes');

    await expect(page.getByText('Outros Créditos/Débitos').first()).toBeVisible();
    await expect(page.getByText('Filtros')).toBeVisible();

    const linha = page.locator('tbody tr').first();
    await expect(linha).toBeVisible({ timeout: 10_000 });

    const checkbox = linha.locator('input[type="checkbox"]');
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await expect(page.getByRole('button', { name: /Confirmar/ })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Alterar/ })).toBeEnabled();
  });

  test('barra de ações desabilita Alterar/Visualizar com mais de um selecionado', async ({
    page,
  }) => {
    await login(page);
    await page.goto('/lotes');

    const checkboxes = page.locator('tbody input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible({ timeout: 10_000 });
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    await expect(page.getByRole('button', { name: /Alterar/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Confirmar/ })).toBeEnabled();
  });
});
