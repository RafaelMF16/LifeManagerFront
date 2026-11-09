# Spec: `pwa`

Módulo do mapa [`README.md`](README.md) (N2). Branch `feature/pwa`, a partir da `dev`, **depois** do `front-shell`. Só front, e base do `habit-reminders`.

## Objetivo

Instalar o LifeManager na tela inicial do celular, com ícone, tela cheia e abertura rápida. É mobile-first e hoje não se instala. O service worker também é a peça que o `habit-reminders` precisa para receber push.

## Escopo

1. **Manifest** (`public/manifest.webmanifest`):
   - `name` "LifeManager" e `short_name` "LifeManager";
   - `start_url` `/home` e `scope` `/`;
   - `display` `standalone`;
   - `background_color` e `theme_color` dos tokens claros;
   - `lang` `pt-BR`;
   - ícones 192 e 512 (`any`) e 512 `maskable`, gerados a partir do `favicon.svg` (PNG em `public/icons/`);
   - `shortcuts`: "Hoje" (`/habits/today`) e "Novo lançamento" (`/finance/months?new=1`, depois do `quick-transaction`).
   - O `index.html` ganha o `<link rel="manifest">`.
2. **Service worker:** com `vite-plugin-pwa` (dependência nova, **em discussão**), na estratégia **`injectManifest`**, com um `src/sw.ts` nosso, para o `habit-reminders` acrescentar o `push` depois.
   - **Precache** do shell: `index.html`, o JS e o CSS gerados e as fontes locais.
   - **`/api/**` nunca passa pelo cache** (`NetworkOnly`). Dados financeiros não ficam guardados no aparelho, e o refresh token continua só no cookie.
   - **Navegação:** `NavigationRoute` para o `index.html`, só para rotas do app, nunca para `/api`.
   - **Atualização:** `registerType: 'prompt'`. Quando há versão nova, um toast fixo, "Nova versão disponível", com o botão "Atualizar" (`updateSW(true)`). Assim nada troca no meio de um formulário.
     - Isso substitui com vantagem o reload por erro de chunk do `front-shell`, que fica como rede de segurança.
3. **Instalar:**
   - No menu do `Header`, o item "Instalar app" aparece só quando o navegador disparou `beforeinstallprompt` (Android/desktop Chrome e Edge). O hook novo é `shared/hooks/useInstallPrompt.ts`.
   - **iOS (Safari):** não tem esse evento. O mesmo item abre um `Dialog` com o passo a passo: "Compartilhar → Adicionar à Tela de Início". Ele só aparece em Safari iOS fora do modo standalone.
4. **Firebase Hosting** (`firebase.json`):
   - `Cache-Control: no-cache` para `/sw.js` e `/manifest.webmanifest`;
   - `Content-Type: application/manifest+json` para o manifest.
   - **CSP:** o `default-src 'self'` já cobre `worker-src` e `manifest-src`. Mesmo assim, ficam explícitos `worker-src 'self'` e `manifest-src 'self'`, para documentar.
   - Essa mudança na CSP está **em discussão** junto com a dependência.

Fora do escopo: funcionar offline com dados (cache da API) e sincronização em segundo plano.

## Critérios de aceite

- O Chrome DevTools → Application mostra o manifest sem erros e o service worker ativo. A auditoria de PWA do Lighthouse diz "instalável".
- No Android: "Instalar app" instala, o ícone abre em tela cheia em `/home` e o atalho "Hoje" funciona.
- No iPhone: as instruções aparecem e, instalado, o app abre em tela cheia com a barra de status na cor do tema.
- **Deploy novo:** com o app aberto, aparece "Nova versão disponível", e "Atualizar" carrega a versão nova sem tela branca.
- **Aba Network:** nenhuma resposta de `/api` sai do service worker.
- `npm test`, `npm run lint` e `npm run build` passam (o build gera o `sw.js` e lista o precache).

## Testes

- **Vitest:**
  - `useInstallPrompt`: a decisão de mostrar ou não o item (evento recebido, iOS fora de standalone, já instalado) vira uma função pura, `shared/utils/installPrompt.ts`;
  - a lista de rotas que o `NavigationRoute` aceita.
- **Manual (usuário, celular real):** os passos dos critérios de aceite. O dev server não registra o service worker, então tudo é conferido com `npm run build && npm run preview`, que o usuário roda.

## Docs

- `CLAUDE.md`: seção "PWA" (estratégia, o que não se guarda em cache, atualização) e as notas de segurança da CSP.
- `docs/fluxo-de-telas.md`: o item "Instalar app" do menu e o aviso de versão nova.
- `README.md`: como testar o PWA (`preview`).

## Arquivos

`public/manifest.webmanifest`, `public/icons/*`, `index.html`, `vite.config.ts`, `src/sw.ts` (novo), `src/main.tsx` (registro), `shared/hooks/useInstallPrompt.ts`, `shared/utils/installPrompt.ts` (+ teste), `shared/components/Header/*`, `shared/locales/*`, `firebase.json`, `package.json`, `CLAUDE.md`, `README.md` e `docs/fluxo-de-telas.md`.
