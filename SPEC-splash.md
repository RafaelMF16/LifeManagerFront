# Spec: `splash` (carteira em pixel art)

Módulo do mapa `SPEC-loadings.md`.

## Objetivo

Usar a animação da carteira (referência: `Downloads/animação`) em dois momentos:

1. **Splash de sessão.** Num reload ou numa aba nova, o `ProtectedRoute` fica em `checking` enquanto o `restoreSession()` roda. Hoje a tela fica **em branco**. Ela passa a mostrar o `splash_loop` (notas voando para a carteira, em loop) com o texto "Carregando…".
2. **Transição pós-login.** Depois do login bem-sucedido (e de aplicar as preferências), uma camada cobre a tela e toca o `feedback_receita` uma vez: a nota entra na carteira e brilha. Em seguida a navegação acontece e a camada se dissolve sobre a Home.

**Usuário:** quem abre o app no celular (o uso principal), com sessão salva ou fazendo login.

## Análise do material de referência

| Arquivo | Conteúdo | Uso |
|---|---|---|
| `splash_loop/colorido/spritesheet_64px_24frames.png` | 24 frames de 64×64 na horizontal, 70ms cada (1.680ms), em loop | Splash de sessão |
| `feedback_receita/colorido/spritesheet_64px_24frames.png` | 24 frames, timing variável (400ms, 70ms×13, 80ms×3, 90…120ms, 700ms; total 2.900ms) | Transição pós-login |
| `*.gif`, `384px/frame_*.png` | As mesmas animações em GIF ou em PNGs avulsos | **Não usados** |

### Por que spritesheet com Web Animations, e não GIF

- O GIF não pausa, não respeita o movimento reduzido, **não avisa quando terminou** (a transição precisa disso) e reinicia de forma imprevisível ao remontar.
- A spritesheet tem cerca de 10 KB cada, contra 42–72 KB do GIF. Ampliada em múltiplo inteiro de 64 com `image-rendering: pixelated`, fica nítida em qualquer densidade de tela.
- A animação é um `transform: translateX` em degraus sobre uma `<img>` da faixa inteira, recortada por um contêiner com `overflow: hidden`. Só anima `transform` (roda no compositor), e a `<img>` pode ser pré-carregada.
- A Web Animations API (`element.animate`) aceita o timing por frame como keyframes com `offset` e `easing: 'step-end'`, e entrega `animation.finished` (uma Promise) para saber quando a animação acabou. É nativa: nenhuma dependência nova.

### Timing encurtado do `feedback_receita` (cerca de 1,6s)

- O frame 1 cai de 400ms para **120ms**.
- O frame 24 (o brilho final) cai de 700ms para **250ms**.
- Os 22 frames do meio ficam com **70%** da duração original (1.800ms → 1.260ms).
- Total: **1.630ms**. Os valores finais podem ser ajustados no olho durante a implementação, mantendo o total entre 1,4 e 1,8s.

## Comportamento

### Splash de sessão (`ProtectedRoute`, status `checking`)

- O `SplashScreen` ocupa a tela inteira, com fundo `var(--background)`. No centro ficam o `WalletSprite variant="loop"` em **192px** (3× o original) e, abaixo, o texto `common:splash.loading` ("Carregando…") em `--text-secondary`.
- **Sem pisca-pisca em restore rápido:** o splash entra com opacidade 0 e faz fade-in depois de **200ms** de atraso, só com CSS (`animation-delay`). Se o restore terminar antes disso, o usuário não vê nada piscar.
- **Acessibilidade:** `role="status"` e `aria-live="polite"`. O sprite é decorativo (`aria-hidden`).
- O sucesso renderiza o `<Outlet />` e o fracasso redireciona, exatamente como hoje.

### Transição pós-login

1. Durante o `login()` e o `loadAndApplyUserPreferences()`, o botão segue com o spinner, como hoje. Se algo falhar, o formulário segue mostrando o erro e **nenhuma camada aparece**.
2. Com tudo pronto, o `LoginForm` chama `playLoginTransition()`. A camada (fundo `var(--background)`, já no tema preferido do usuário) entra com fade de `--duration-base`, toca o `feedback_receita` em 192px e resolve a Promise no fim.
3. O `LoginForm` navega com `replace` para o destino de sempre (`state.from`, senão `/home`).
4. Montada **fora das rotas**, a camada sobrevive à troca de página e some com fade de `--duration-slow` sobre a tela de destino.
5. **Acessibilidade:** a camada tem `role="status"` e o texto oculto `auth:login.entering` ("Entrando…"). Ela cobre a tela e bloqueia cliques enquanto está visível. O foco não é movido: a transição é curta.
6. **Pré-carga:** ao montar, o `AuthPage` faz `new Image().src = receiveSpriteUrl`, para o sprite já estar em cache quando a camada abrir.

### Movimento reduzido (`prefers-reduced-motion: reduce`)

- **Splash de sessão:** mostra o frame 1 estático, sem fade-in, com o texto.
- **Transição pós-login:** `playLoginTransition()` resolve na hora e não mostra camada. O login navega direto, como hoje, e mostra o toast `auth:login.successToast`.

## Design técnico

```
src/assets/wallet/
  wallet-loop.png            ← splash_loop/colorido/spritesheet_64px_24frames.png
  wallet-receive.png         ← feedback_receita/colorido/spritesheet_64px_24frames.png
src/shared/components/WalletSprite/
  WalletSprite.tsx / .css    ← <div> com overflow hidden + <img> da faixa inteira; anima transform: translateX via element.animate
src/shared/components/SplashScreen/
  SplashScreen.tsx / .css    ← tela cheia: sprite em loop + "Carregando…"
src/shared/components/LoginTransition/
  LoginTransitionContext.ts  ← mesmo padrão de Toast/ErrorModal
  LoginTransitionProvider.tsx← camada fora das <Routes>; expõe playLoginTransition(label): Promise<boolean> (true se tocou)
  LoginTransition.css
src/shared/hooks/
  useLoginTransition.ts
  usePrefersReducedMotion.ts ← matchMedia + listener de mudança
src/shared/utils/
  spriteTimeline.ts          ← função pura: durações por frame → keyframes + duração total
  spriteTimeline.test.ts
```

### Pontos de contato

- **`App.tsx`:** o `LoginTransitionProvider` envolve o `<RouterProvider>`, ao lado dos providers de Toast e ErrorModal. O `App` agora usa data router, e a camada não depende do router.
- **`ProtectedRoute.tsx`:** `return null` → `return <SplashScreen />`.
- **`LoginForm.tsx`:** depois das preferências, `await playLoginTransition()`, depois o `navigate(...)`. O toast fica só no caminho com movimento reduzido.
- **`AuthPage.tsx`:** pré-carrega o sprite da transição.

### API do `WalletSprite`

```tsx
interface WalletSpriteProps {
  variant: 'loop' | 'receive'
  /** Lado em px; múltiplo de 64 para manter os pixels nítidos. Padrão: 192. */
  size?: 128 | 192 | 256
  /** Só para 'receive': chamado uma vez quando o último frame termina. */
  onEnd?: () => void
}
```

### Exemplo do util puro, testado com o Vitest

```ts
// spriteTimeline.ts
export interface SpriteTimeline {
  keyframes: Keyframe[]
  durationMs: number
}

/** Uma keyframe por frame, com `step-end`, para cada frame ficar parado durante a própria duração. */
export function buildSpriteTimeline(frameDurationsMs: readonly number[], frameSizePx: number): SpriteTimeline {
  const durationMs = frameDurationsMs.reduce((total, ms) => total + ms, 0)
  let elapsed = 0
  const keyframes = frameDurationsMs.map((ms, index) => {
    const keyframe: Keyframe = {
      offset: elapsed / durationMs,
      transform: `translateX(${-index * frameSizePx}px)`,
      easing: 'step-end',
    }
    elapsed += ms
    return keyframe
  })
  // Mantém o último frame até o fim da animação.
  keyframes.push({ offset: 1, transform: `translateX(${-(frameDurationsMs.length - 1) * frameSizePx}px)` })
  return { keyframes, durationMs }
}
```

### Tokens e i18n novos

- `motion.css`: `--splash-reveal-delay: 200ms`.
- `common:splash.loading`: "Carregando…" / "Loading…".
- `auth:login.entering`: "Entrando…" / "Signing in…".

## Comandos

```
npm test            # inclui o spriteTimeline.test.ts
npm run lint
npm run build       # tsc -b + vite build; os PNGs saem com hash em dist/assets
```

Não rodar `npm run dev` nem o backend: o usuário roda os dois e faz a verificação visual.

## Estratégia de testes

- **Vitest (unitário), em `spriteTimeline.test.ts`:**
  - A duração total é a soma dos frames.
  - Os offsets crescem de 0 a 1.
  - O `translateX` do frame *i* vale `-i × tamanho`.
  - Existe uma keyframe final em `offset: 1`.
  - O timing encurtado do `feedback_receita` fica entre 1.400 e 1.800ms.
- **Sem testes de componente.** O projeto não tem jsdom nem Testing Library, e adicionar exige perguntar antes (veja os Limites).
- **Roteiro manual (no DevTools, com o usuário):**
  1. Reload em `/finance` com sessão válida, em Slow 4G: o splash aparece depois de cerca de 200ms, em loop, e some quando a tela carrega.
  2. Reload sem cookie: redireciona para `/auth` sem mostrar o splash por muito tempo.
  3. Login correto: o spinner aparece, a camada toca a carteira por cerca de 1,6s e se dissolve na Home.
  4. Login com senha errada: só aparece o erro no formulário, nenhuma camada.
  5. Login com `state.from` (a pessoa foi barrada em `/habits`): a camada se dissolve em `/habits`.
  6. Emular `prefers-reduced-motion: reduce`: o splash fica estático e o login navega direto com o toast.
  7. Tema claro e tema escuro, a 360px de largura: o sprite nítido, sem desfoque.

## Limites

- **Sempre:** importar os PNGs por `import` do Vite (hash no nome); usar tokens de `motion.css`; atualizar `docs/fluxo-de-telas.md` (o reload agora mostra o splash e o login tem a transição) e o `CLAUDE.md` (seções "Route guards" e "Motion").
- **Perguntar antes:** adicionar uma dependência (Lottie, Framer Motion, Testing Library); mudar a ordem login → preferências → navegação; mostrar o splash em outros lugares (por exemplo, o lazy load de rotas).
- **Nunca:** atrasar o login quando a API falha; segurar o usuário na camada por mais de 2s; usar o GIF; rodar `npm run dev` ou `dotnet run`.

## Critérios de sucesso

- [ ] Um reload numa rota protegida nunca mostra tela em branco por mais de 200ms enquanto o `restoreSession` está pendente.
- [ ] Após o login bem-sucedido, a Home (ou o `from`) fica visível em até **2,1s** depois da resposta das preferências (fade de entrada + cerca de 1,6s + fade de saída).
- [ ] Com o movimento reduzido, o login navega na hora (comportamento atual) e o splash fica estático.
- [ ] Um login que falha nunca mostra a camada.
- [ ] O sprite fica nítido (pixelated) a 360px e em telas de alta densidade, nos dois temas.
- [ ] Os assets novos somam menos de 25 KB e não há dependência nova.
- [ ] `npm test`, `npm run lint` e `npm run build` passam.

## Decisões finais (2026-11-06)

1. **Toast "login.successToast":** é removido quando a animação toca e continua só no caminho com movimento reduzido.
2. **Cadastro:** fica fora. Um cadastro bem-sucedido volta para a aba de login, sem entrar no app, então a transição vale só para o login.
