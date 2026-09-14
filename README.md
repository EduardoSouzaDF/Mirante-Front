# Mirante — Frontend (MVP)

Interface do usuário (SPA) do projeto Mirante, construída com **Angular 17**.

## Stack

- **Angular 17** (última 17.x) — standalone components, routing, SCSS
- **PrimeNG 17** — biblioteca de componentes de UI
- **Design tokens** — paleta verde-petróleo em `src/styles/tokens.scss`
- **Pipes pt-BR** — moeda (`brl`) e data (`dataBr`) em `src/app/shared/pipes/`
- **Testes**: Jasmine + Karma (padrão do Angular CLI)
- **Proxy dev**: `/api` → `http://localhost:3100` (backend mock)

## Requisitos

- Node.js 18.13+ ou 20.x
- npm

## Instalação

```bash
npm install
```

## Execução (desenvolvimento)

```bash
ng serve
```

## Usuário de teste

| nome | email | senha |
|---|---|---|
| Administrador | admin@mirante.com.br | 123456 |


A aplicação sobe em `http://localhost:4200`. Chamadas a `/api/**` são
redirecionadas para o mock server em `http://localhost:3100` (configuração em
`proxy.conf.json`). Para o proxy funcionar, o backend mock precisa estar
rodando na porta 3100.

## Testes

```bash
ng test
```

## Build de produção

```bash
ng build
```

O resultado fica em `dist/mirante/`.

## Design tokens

A paleta verde-petróleo está centralizada em `src/styles/tokens.scss`:

| Token | Hex | Uso |
|---|---|---|
| `--petroleo-700` | `#002830` | cor principal (headers, botões) |
| `--petroleo-600` | `#0c343c` | hover / bordas |
| `--petroleo-500` | `#183c44` | superfícies secundárias |
| `--agua-500` | `#048074` | acento (links, focus) |
| `--surface-50` | `#f0f0f0` | fundo de conteúdo |
| `--texto-primario` | `#002830` | texto principal |
| `--texto-secundario` | `#707070` | texto secundário |

### Como usar

```scss
// Em qualquer componente SCSS
.card-exemplo {
  background: var(--surface-0);
  color: var(--texto-primario);
  border: 1px solid var(--surface-100);
}

.btn-destaque {
  background: var(--petroleo-700);
  color: var(--surface-0);
}
```

O tema do PrimeNG é sobrescrito em `src/styles.scss` usando as mesmas
variáveis — altere apenas `tokens.scss` para reposicionar a paleta.

## Estrutura de pastas

```
src/app/
├── core/        # singletons (services, interceptors, guards)
├── shared/      # componentes reutilizáveis e pipes (pt-BR)
│   └── pipes/   # brl (moeda) e dataBr (data)
└── features/    # telas por funcionalidade (a definir em specs futuras)
```

## Responsividade (desktop e mobile)

As telas são construídas para **desktop e mobile**:

- Utilitários de layout do ecossistema Prime (**PrimeFlex** — classes tipo
  `flex`, `flex-wrap`, `gap-3`) registrados no `angular.json`.
- Breakpoint mobile: **768px**.
- No mobile, o **menu lateral vira drawer** (abre pelo botão ☰ na topbar, com
  overlay; fecha com ✕, clicando fora ou ao navegar).
- Login e breadcrumb ficam mais compactos; os cards do dashboard empilham
  ocupando a largura total.

## Validação visual (Playwright)

O projeto usa **@playwright/test** (usando o Chrome instalado via
`channel: 'chrome'`, sem baixar o Chromium).

```bash
# 1. Suba o fluxo (em terminais separados):
cd ../backend && npm run mocks     # mock na 3100 (delay 2s)
ng serve                           # app na 4200

# 2. Abra o navegador para validar as telas (desktop e mobile):
npm run e2e:open

# Ou rode o smoke test automatizado:
npm run e2e
```

**O PR só é aberto após a validação visual com o Playwright** (ver fluxo SDD).

## Decisões técnicas

- Angular 17 fixo (stack oficial do projeto — ver `config/project.yaml` no
  toolkit SDD).
- PrimeNG 17 escolhido como biblioteca de componentes (tabela, filtros e
  modal das próximas features).
- Standalone components (padrão do Angular 17) — sem NgModules.
- Jasmine + Karma (padrão do CLI) para testes unitários.
- Locale pt-BR registrado globalmente (`LOCALE_ID`) para pipes de moeda/data.
- Proxy de desenvolvimento `/api` → mock server configurado em
  `proxy.conf.json`.
