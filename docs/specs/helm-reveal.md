# Spec: `helm-reveal` (front)

Módulo fora do mapa original do [`README.md`](README.md), pedido em 11/11/2026. Só front. Branch `feature/helm-reveal`, a partir da `dev`. Protótipo aprovado pelo usuário: [`helm-reveal-prototype.html`](helm-reveal-prototype.html) (abrir num navegador; o card "Login completo", opção **"Abre do centro do timão"**, é a referência visual e de tempos). Ele sai junto com este spec.

## Objetivo

O timão pixelado (`HelmSprite`) é o único elemento em pixel art do app. A UI é vetorial e flat: Inter, ícones lucide e o próprio logo em SVG (`AppLogo`). Ele vira **o mesmo SVG do logo, animado**. A entrada no login também ganha um fechamento: depois da volta do timão, **a tela de destino se abre num círculo que nasce no centro do timão**, sobre o fundo do tema, e os blocos da Home sobem em sequência.

- **Usuário:** quem entra no app (o login diário, no celular a 360px, é o caso principal) e quem abre uma aba nova (splash).
- **Sucesso:** o splash e a entrada usam o desenho do `AppLogo`, nítido em qualquer tamanho e nos dois temas, e a transição do protótipo roda no app real sem mostrar a tela de login por baixo.

## Escopo

1. **`AnimatedHelm`** (`shared/components/AnimatedHelm/`) substitui o `HelmSprite`, com a mesma API: `variant: 'loop' | 'receive'`, `size?` (px, **qualquer valor**; padrão 192) e `onEnd?`.
   - **Desenho:** a geometria do timão sai do `AppLogo` para um lugar só (ex.: `shared/components/AppLogo/helmGeometry.ts`, ângulos e medidas), usada pelos dois componentes. Mudar o logo muda a animação.
   - **Peças animadas:** os raios e manoplas giram, mas o reflexo do aro fica parado (luz de cima à esquerda). O miolo acende em âmbar e solta um anel. As moedas são âmbar, a cor das moedas do jogo de hábitos (token `--chart-coins` ou um token novo `--coin-*` em `colors.css`). Os brilhos são estrelas de 4 pontas.
   - **`loop`** (splash): ciclo de 2,6 s, infinito. A cada ciclo, duas moedas chegam em arco por lados opostos, e cada chegada acende o miolo e vira o timão 45°, com um leve passar do ponto. Como o desenho se repete a cada 45°, o loop não tem emenda.
   - **`receive`** (login): toca uma vez, ≈ 1,75 s. O timão fica parado 120 ms. A moeda voa até o centro (até 720 ms) e o miolo acende. O timão dá uma volta completa que assenta com um leve passar do ponto (até 1420 ms). Os quatro brilhos aparecem em sequência (a partir de 1280 ms). `onEnd` chega no fim.
   - **Tempos e keyframes ficam numa função pura** (`shared/utils/helmTimeline.ts`, que substitui `spriteTimeline.ts`). O componente só aplica os keyframes com a Web Animations API, como hoje: só `transform`, `opacity` e `fill`.
   - **Movimento reduzido:** o timão parado. `receive` chama `onEnd` na hora (comportamento atual).
2. **Transição "abre do centro do timão"** no `LoginTransitionProvider`:
   - **Ordem:** a capa toca o `receive` → a navegação acontece **por baixo da capa** → a tela de destino é montada → um círculo abre na capa a partir do centro do timão, cobrindo a tela em 700 ms (`cubic-bezier(.65,0,.25,1)`), enquanto o timão cresce até ~1,35× → a capa sai.
   - **Nunca revelar a tela de login:** o círculo só abre depois que a navegação terminou. Hoje o `play` resolve e o `LoginForm` navega em seguida. O contrato passa a deixar o provider esperar a navegação (ex.: `play(label, go)`, em que `go` é a navegação, que retorna a `Promise` do `navigate` do data router). O formato exato fica para o plano.
   - **Chunk:** o `AuthPage` hoje pré-carrega o sprite. Ele passa a pré-carregar o chunk da Home (a rota mais comum depois do login), para a espera depois da volta ser curta.
   - **Limite:** o `MAX_PLAY_MS` (hoje 2 s) cobre o `receive` mais a espera pela navegação. Estourado, a capa abre do mesmo jeito.
   - **Fundo do tema:** a capa continua com o `--background` do tema e o círculo revela a tela por baixo. Nada de cor de destaque cobrindo a tela (a opção "onda teal" foi descartada).
   - **Técnica do furo:** uma `mask` de `radial-gradient` com o raio numa custom property registrada (`@property --lm-reveal-radius`), centrada no meio da capa (onde fica o timão: `50% 50%`, sem medir na hora). Num navegador sem `@property` ou com o timeout estourado, a capa esmaece como hoje (260 ms).
3. **Entrada da Home** (só quando ela vem do login): o cabeçalho desce 8 px e os blocos (saudação, data, os dois cartões e os módulos) sobem 16 px, um depois do outro, com os tokens da tela de login (`--duration-enter` 420 ms, `--stagger-step` 70 ms, `--ease-out`). A sequência começa junto com a abertura do círculo.
   - O `enterStyle` (`auth/utils/`) vai para `shared/utils/`, e o CSS `[data-enter]` vira uma regra compartilhada. O `AuthLayout` passa a usar a versão de `shared/`.
   - A Home sabe que veio do login por uma marca de navegação (ex.: `state` da rota ou um sinal do provider). Um F5 ou uma volta à Home pelo menu **não** fazem a entrada.
   - Se a Home ainda estiver no esqueleto (primeira carga), os blocos sobem com o esqueleto. Nada espera os dados.
   - Outras telas de destino (o "voltar para onde você tentou ir") ganham só o círculo, sem a sequência de blocos.
4. **Remoções:** `HelmSprite/`, `spriteTimeline.ts` (+ teste), `src/assets/helm/*.png`, `scripts/generate-helm-sprites.mjs` e o pré-carregamento do sprite (`HELM_RECEIVE_URL`).

## Critérios de aceite

- O splash (aba nova ou F5 com sessão, além do `hydrateFallbackElement`) mostra o timão SVG em loop, com o mesmo desenho e as mesmas cores do `AppLogo` e sem fundo em disco, nos temas claro e escuro.
- O login mostra o `receive` e, em seguida, a tela de destino se abrindo num círculo a partir do centro do timão. **Em nenhum quadro aparece a tela de login** por trás do círculo (conferir com a rede em "Fast 4G" e "Slow 4G" do DevTools).
- Com a Home como destino, cabeçalho e blocos entram em sequência. Um F5 na Home, ou uma navegação comum até ela, não faz a entrada.
- Com "reduzir movimento": o splash mostra o timão parado, e o login não mostra capa nenhuma e exibe o toast "Login realizado com sucesso". Tudo isso é o comportamento atual.
- Aba em segundo plano durante o login: a capa sai em até `MAX_PLAY_MS` e a tela fica usável.
- Do clique em "Entrar" (resposta da API já recebida) até a tela usável: ≤ 2,6 s com o chunk já carregado (hoje ≈ 1,9 s).
- A 360px, o círculo cobre os cantos e não há rolagem horizontal durante a transição.
- Nenhum PNG do timão no bundle (`npm run build` sem `helm-*.png` em `dist/assets`).
- `CLAUDE.md` (parágrafos "Helm sprite", "Sign-in transition" e assets) e `docs/fluxo-de-telas.md` (linhas 140 e 157: "leme animado", "cerca de 1,6 segundo") atualizados.
- `npm test`, `npm run lint` e `npm run build` passam.

## Comandos

```
npm run dev       # Vite com HMR (https://localhost:5173), com a API local
npm test          # Vitest
npm run lint      # Oxlint
npm run build     # tsc -b + vite build
```

## Estrutura

```
src/shared/components/AnimatedHelm/      → novo (AnimatedHelm.tsx + .css)
src/shared/components/AppLogo/           → geometria extraída, compartilhada com o AnimatedHelm
src/shared/components/LoginTransition/   → capa: espera a navegação e abre o círculo
src/shared/components/SplashScreen/      → usa o AnimatedHelm
src/shared/utils/helmTimeline.ts (+ .test.ts)  → keyframes puros (substitui spriteTimeline)
src/shared/utils/enterStyle.ts           → movido de auth/utils
src/auth/components/LoginForm/           → passa a navegação ao play
src/auth/pages/AuthPage.tsx              → pré-carrega o chunk da Home
src/home/pages/HomePage.tsx (+ .css)     → data-enter quando vem do login
```

## Estilo de código

O mesmo do repo: componentes de função, CSS por componente com prefixo `lm-`, tokens de `shared/styles/tokens/`, comentários em inglês, i18n pt-BR/en-US para qualquer texto (aqui só os rótulos que já existem). A lógica de tempo fica pura e testável, e o componente só aplica:

```ts
/** The `receive` animation: one coin into the hub, a full turn that settles, then the sparkles. */
export function helmReceiveTimeline(): HelmTimeline {
  const durationMs = 1750
  const hit = 720 / durationMs
  return {
    durationMs,
    wheel: [
      { offset: 0, transform: 'rotate(0deg)' },
      { offset: hit, transform: 'rotate(0deg)', easing: 'cubic-bezier(.2,.65,.3,1.08)' },
      { offset: 1420 / durationMs, transform: 'rotate(360deg)' },
      { offset: 1, transform: 'rotate(360deg)' },
    ],
    // coin, hub, sparkles…
  }
}
```

## Testes

- **Vitest** (`helmTimeline.test.ts`):
  - offsets crescentes e dentro de [0, 1] em toda trilha;
  - o `loop` termina girado num múltiplo de 45° (sem emenda);
  - a moeda chega ao centro no mesmo offset em que o miolo acende;
  - o `receive` dura ≈ 1,75 s e termina com o timão em 360°.
- **Vitest** (se a lógica sair do componente): a decisão "faz a entrada?" a partir da marca de navegação.
- **Manual (usuário + navegador do Claude):**
  - splash e login nos dois temas, a 360px e no desktop;
  - login com rede lenta, sem quadro da tela de login;
  - reduzir movimento;
  - aba em segundo plano;
  - o "voltar para onde você tentou ir" (ex.: abrir `/finance` deslogado).

## Limites

- **Sempre:** seguir `CLAUDE.md` e os tokens; manter `prefers-reduced-motion`; animar só `transform`/`opacity` (e `fill` do miolo); atualizar `CLAUDE.md` e `docs/fluxo-de-telas.md` na mesma mudança; rodar test, lint e build antes de cada commit.
- **Perguntar antes:** adicionar dependência (ex.: biblioteca de animação; a ideia é não precisar); mudar o desenho do logo/`favicon.svg` (o que obrigaria a regerar os ícones da PWA); fazer a entrada em sequência em outras telas além da Home; mudar o contrato do `useLoginTransition` além do necessário para esperar a navegação.
- **Nunca:** mostrar a tela de login no círculo; deixar a capa sem saída (o timeout fica); prender o foco ou a digitação depois que a capa saiu; usar `localStorage` para a marca "veio do login".

## Decisões (11/11/2026)

1. **Tempo total:** o círculo abre já nos brilhos (~1450 ms do `receive`) quando a navegação já terminou; só espera quando ela ainda não terminou. O `onEnd`/fim do `receive` deixa de ser o gatilho da abertura.
2. **Destinos que não são a Home:** só o círculo, sem a sequência de blocos.
3. **Splash:** fica o loop do protótipo (2 moedas por ciclo, viradas de 45°).
