# Spec: `front-shell`

Módulo do mapa [`README.md`](README.md) (P6 + P7). Branch `perf/front-shell`, a partir da `dev`.

## Objetivo

O primeiro carregamento no celular baixa só o necessário, e a aba e o favorito mostram o nome do app.

**Hoje:** `App.tsx` importa as 30 páginas de forma estática, num JS de **1.077 kB (297 kB gzip)** e num CSS de 228 kB. Quem abre o login baixa os módulos Finanças e Hábitos inteiros.

## Escopo

1. **Rotas sob demanda:** cada página e layout de módulo passa da importação estática para o `lazy` de rota do React Router (data router), por exemplo:

   ```tsx
   <Route path="dashboard" lazy={() => import('./finance/pages/DashboardPage').then((m) => ({ Component: m.default }))} />
   ```

   Ficam estáticos só o `RootLayout`, `ProtectedRoute`, `PublicOnlyRoute` e os providers.
   - O `lazy` do router carrega o módulo **antes** de trocar de tela, então a tela atual fica visível durante a navegação: nenhum flash e nenhum `Suspense` novo.
   - **Carga inicial:** a rota raiz ganha `hydrateFallbackElement={<SplashScreen />}`, para um reload em uma rota lazy mostrar o splash que já existe, sem tela em branco nem aviso do router.
   - **Erro ao baixar o chunk** (deploy novo com hash antigo em cache): um `errorElement` na raiz recarrega a página uma vez (guardado em `sessionStorage`, com try/catch). Se falhar de novo, mostra uma mensagem traduzida com o botão "Recarregar".
2. **Metadados do `index.html`:**
   - `<title>LifeManager</title>`;
   - `meta name="description"`;
   - `meta name="theme-color"` com as duas cores (`media="(prefers-color-scheme: …)"`), tiradas dos tokens de fundo;
   - `apple-touch-icon` (PNG 180px em `public/`, a partir do `favicon.svg`).
   - O `lang` inicial continua `en-US`: o `i18n.ts` já o corrige em tempo de execução.
   - O manifest fica para o módulo `pwa`.

Fora do escopo: o service worker (`pwa`), dividir os locales por namespace (avaliar só se o chunk inicial continuar acima de 500 kB) e quebrar o CSS por rota (o Vite já divide o CSS junto com os chunks lazy).

## Critérios de aceite

- `npm run build` **sem** o aviso "Some chunks are larger than 500 kB".
- O chunk de entrada fica **≤ 300 kB minificado** (registrar antes e depois no PR). Finanças e Hábitos saem em chunks próprios.
- Ao navegar entre telas não aparece tela em branco. Um reload em `/finance/dashboard` mostra o splash e depois a tela.
- `useBlocker` do orçamento ("sair sem salvar?") continua funcionando.
- A aba mostra "LifeManager".
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:** a decisão do `errorElement` vira uma função pura em `shared/utils/chunkReload.ts` (`shouldReloadOnce(error, storage)`, que reconhece um erro de import dinâmico e lê/grava a marca), com testes.
- **Manual (usuário, celular ou DevTools em Slow 4G a 360px):**
  1. abrir `/auth` e conferir na aba Network que os chunks de Finanças e Hábitos **não** baixaram;
  2. entrar e navegar Home → Finanças → Hábitos;
  3. dar reload em uma tela interna;
  4. alterar o orçamento e tentar sair.

## Arquivos

`src/App.tsx`, `index.html`, `public/apple-touch-icon.png`, `src/shared/components/RouteError/` (novo: `errorElement`), `src/shared/utils/chunkReload.ts` (+ teste), `src/shared/locales/{pt-BR,en-US}.ts` e `CLAUDE.md` (seção Architecture notes: roteamento lazy).
