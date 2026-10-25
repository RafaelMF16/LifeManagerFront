# Spec: Menu radial no celular (viabilidade)

> Substitui a spec anterior (barra com 4 abas + "Mais", commit `54894d6`, no ramo `feature/mobile-nav`). Se esta
> proposta for aprovada, o menu radial toma o lugar da aba "Mais". O cabeçalho do login (Task 1 anterior) fica como
> está.

## Objective

No celular (≤768px), trocar a barra de abas por um **botão flutuante centralizado embaixo** (sem barra). Ao tocar
nele, uma animação suave abre **todas as telas do módulo + "Todos os módulos"** como **bolhas só com ícone** em **um
arco** em volta do botão, como no esboço: um semicírculo acima dele, das laterais de baixo até o topo. O nome de cada
tela aparece num tooltip com o mouse e no meio do arco com o foco do teclado. Tocar numa bolha navega e o arco se fecha.

**Por quê:** a barra com uma aba por tela fica cheia e cada módulo novo piora isso. O arco cabe todas as telas sem
"Mais", e a tela aberta já mostra onde o usuário está (título e conteúdo), então a barra não precisa mais marcar a aba
ativa.

**Usuário:** quem usa o LifeManager pelo celular, que é o alvo principal. O desktop (>768px) mantém a sidebar atual.

### Análise de viabilidade (geometria)

As contas foram feitas com um script de colisão (caixas das bolhas não podem se sobrepor nem sair da tela, com 8px de
margem lateral e 4px entre bolhas). O arco é centrado no botão e pode descer um pouco abaixo da horizontal (até 200°).

| Itens no arco | Bolha | 320px | 360px |
|---|---|---|---|
| 5 (Hábitos: 4 telas + Módulos) | só ícone (48px) | ✅ raio 80 | ✅ raio 80 |
| 5 | ícone + rótulo de até 2 linhas (64px) | ✅ raio 98 | ✅ raio 98 |
| 6 (Finanças: 5 telas + Módulos) | só ícone (48px) | ✅ raio 107 | ✅ raio 107 |
| 6 | ícone + rótulo de até 2 linhas (64px) | ❌ | ✅ raio 130 |
| 6 | ícone + rótulo de 1 linha (76px, cabe "Planejamento") | ❌ | ❌ |
| 7 (um módulo com 6 telas) | qualquer | ❌ num arco só | ❌ num arco só |

**Conclusão: é viável com um arco, só com ícones (decidido).** Seis bolhas de 48px cabem num arco de 200° com raio
~107px a partir de 320px de largura. O arco ocupa até ~135px acima do centro do botão, o que cabe com folga em qualquer
altura de celular, inclusive deitado. O meio do arco (raio interno ~80px) sobra para mostrar o nome de um item.

**Limite de escala:** um arco só comporta **até 6 itens**. Um módulo com 6 telas ou mais vai precisar de um segundo anel
ou de outra solução. Isso não acontece hoje, mas fica registrado.

### Critérios de aceite

- **AC1 — Botão flutuante:** em ≤768px, a barra inferior deixa de existir (abas e "Mais"). No lugar, um botão
  redondo de 56px, centralizado acima da área segura de baixo, com sombra (`--elevation-3`) e o **ícone do módulo**
  (carteira em Finanças, check em Hábitos). O rótulo acessível é "Menu de <módulo>".
- **AC2 — Abrir:** tocar no botão escurece a tela (scrim) e abre o arco. As bolhas saem do botão e vão para a posição no
  arco em ~260ms (`--duration-slow`, `--ease-out`), uma após a outra com ~20ms de atraso. O ícone do botão vira um **X**.
- **AC3 — Conteúdo:** o arco mostra, como bolhas de 48px só com ícone, todas as telas do módulo na ordem de
  `NAV_ITEMS`, da esquerda para a direita, e "Todos os módulos" por último, à direita. Uma tela com `path: null`
  aparece apagada e não navega. A tela atual tem a bolha destacada (cor de destaque).
- **AC3b — Nome das telas:** cada bolha tem o nome no `aria-label`. Em aparelhos com mouse (`hover: hover`), passar o
  mouse mostra um tooltip com o nome. Com foco de teclado, o nome aparece no meio do arco. No toque, segurar a bolha
  ~300ms mostra o nome no meio do arco, e soltar navega (ver Decisões).
- **AC4 — Fechar:** tocar numa bolha navega e fecha. Tocar no scrim, no X ou apertar Esc fecha sem navegar. Fechar faz a
  animação inversa, mais curta (`--duration-base`).
- **AC5 — Cabe na tela:** nenhuma bolha (nem tooltip) se sobrepõe a outra nem sai da tela em 320, 360, 390 e 430px, em
  Finanças (6 itens) e Hábitos (5).
- **AC6 — Acessibilidade:** o botão tem `aria-expanded` e `aria-controls`. Aberto, o arco é um `dialog` modal com os itens
  como links; o foco vai para o primeiro item, Tab e Shift+Tab ficam presos no menu, e ao fechar o foco volta ao botão.
  Alvos de toque de pelo menos 48px.
- **AC7 — Movimento reduzido:** com `prefers-reduced-motion: reduce`, o arco aparece e some sem animar, só com fade.
- **AC8 — Desktop:** acima de 768px, nada muda: sidebar completa, recolher, sem botão central.
- **AC9 — Conteúdo livre:** `--app-bottom-inset` passa a ser a altura do botão + margens (~80px), e o conteúdo da
  página continua com esse respiro, então o botão nunca cobre o último item de uma lista, a paginação ou o Toast.
- **AC10 — Textos e docs:** os textos novos ficam em `common` (pt-BR e en-US). `docs/fluxo-de-telas.md` e a nota do
  CLAUDE.md descrevem o menu radial.

## Tech Stack

Vite + React 19 + TypeScript, `react-router-dom`, `react-i18next`, CSS puro com tokens (`motion.css`, `spacing.css`),
`lucide-react` através do `Icon`, Vitest. **Sem dependência nova:** a animação é CSS (transform + transition com
`--i` por bolha), sem biblioteca de animação.

## Commands

```
Dev:    npm run dev
Test:   npm test
Lint:   npm run lint
Build:  npm run build
```

## Project Structure (arquivos tocados)

```
src/shared/utils/radialLayout.ts (+ .test.ts)          → posições das bolhas: arco, raio e abertura por quantidade de
                                                          itens e largura da tela
src/shared/components/RadialNav/RadialNav.tsx + .css    → botão central + scrim + arco (o dialog)
src/shared/components/ModuleSidebar/ModuleSidebar.tsx   → no compacto, renderiza o RadialNav no lugar das abas;
                                                          remove a aba "Mais" e a folha
src/shared/components/ModuleSidebar/ModuleSidebar.css   → no compacto, a sidebar some e fica só o botão flutuante;
                                                          `--app-bottom-inset` passa à altura do botão
src/shared/utils/moduleNav.ts (+ .test.ts)              → `splitNavItems` sai (deixa de ser usado); `isAnyItemActive`
                                                          fica para destacar a tela atual
src/shared/locales/{en-US,pt-BR}.ts                     → moduleSidebar.menu ("Menu de {{module}}"), moduleSidebar.close
src/shared/components/ModuleSidebar/ModuleSidebar.tsx   → nova prop `moduleIcon` (o ícone do botão)
src/finance/components/FinanceSidebar/, src/habits/components/HabitsSidebar/ → passam `moduleIcon`
docs/fluxo-de-telas.md, CLAUDE.md                       → menu radial
```

`FinanceSidebar` e `HabitsSidebar` só ganham o `moduleIcon`.

## Design técnico

- **Posição por CSS:** `radialLayout.ts` calcula, para cada bolha, um ângulo e um raio. O componente passa
  `--x`/`--y` (destino) e `--i` (ordem) por `style`, e o CSS anima de `translate(0, 0) scale(0.4)`, no botão, até
  `translate(var(--x), var(--y)) scale(1)`. Fechado, as bolhas ficam no centro com `opacity: 0` e `pointer-events: none`.
- **Largura da tela:** o raio depende da quantidade de itens e da largura, que o componente lê
  (`window.innerWidth`) ao abrir. Girar a tela com o menu aberto o reposiciona na próxima abertura.
- **Tooltip:** um rótulo posicionado acima de cada bolha, visível em `:hover` dentro de `@media (hover: hover)` e,
  perto das bordas, deslocado para dentro da tela. O nome no meio do arco é um elemento só, preenchido com o item em
  foco.
- **Dialog próprio, não o `Dialog` compartilhado:** o `Dialog` vira bottom sheet no compacto e não posiciona itens em
  volta de um ponto. O `RadialNav` usa o mesmo scrim (cor e z-index) e o mesmo Esc, mas tem layout próprio. É a exceção à
  regra "modais passam pelo `Dialog`", e precisa ficar anotada no CLAUDE.md.
- **Fechar ao navegar:** a mesma técnica da folha "Mais": o menu fica aberto só no pathname em que foi aberto.
- **Ordem de foco:** os links ficam no DOM na ordem do arco, da esquerda para a direita, então Tab segue o desenho.

## Code Style

O padrão do projeto: componentes em função, `translate('common:...')`, classes BEM `lm-*`, `import type`, lógica pura em
`utils/` com teste, animações dentro de `@media (prefers-reduced-motion: no-preference)` com tokens de `motion.css`.

```ts
// shared/utils/radialLayout.ts
export interface RadialSlot {
  x: number // px a partir do centro do botão
  y: number // px para cima (negativo no CSS)
}

export function radialLayout(count: number, viewportWidth: number): RadialSlot[]
```

## Testing Strategy

- **Vitest:** `radialLayout` para 5 e 6 itens em 320, 360, 390 e 430px. Nenhuma bolha se sobrepõe (a mesma checagem
  do script da análise), todas ficam dentro da tela, e a ordem vai da esquerda para a direita. `isAnyItemActive` mantém os testes atuais.
- **Manual no Safari** (Modo de Design Responsivo, 320/360/390/430px; claro/escuro; PT/EN): abrir e fechar por bolha,
  scrim, X e Esc; a tela atual destacada; Tab preso no menu; o foco volta ao botão. Movimento reduzido ativado nos Ajustes
  do macOS (Acessibilidade → Tela → Reduzir movimento).
- **Simulador do iOS** (opcional): toque real e área segura embaixo do botão.
- `npm run lint`, `npm test` e `npm run build` verdes.

## Boundaries

- **Always:** i18n em todo texto novo; tokens de movimento e cor; animação só dentro de
  `prefers-reduced-motion: no-preference`; alvos de 48px; atualizar docs e CLAUDE.md no mesmo change; testar em 360px
  antes de dar como pronto.
- **Ask first:** mudar o desktop; adicionar biblioteca de animação; um módulo com mais de 6 itens; mudar o `Dialog`
  compartilhado.
- **Never:** importar ícones direto do `lucide-react`; ação ou informação essencial só por hover; commitar sem você
  pedir.

## Success Criteria

AC1 a AC10 conferidos como descrito acima, com lint, testes e build verdes.

## Decisões

- Botão flutuante, sem barra (pergunta 1 da versão anterior).
- Bolhas só com ícone em qualquer largura; nome por tooltip com mouse e no meio do arco com foco de teclado.
- Ícone do botão: o do módulo (padrão recomendado; a pergunta ficou sem resposta).

- **Nome no toque: segurar mostra o nome.** Toque rápido navega. Segurar uma bolha por ~300ms mostra o nome dela no
  meio do arco (e a bolha cresce um pouco); soltar sem arrastar navega, e arrastar para fora cancela, que é o
  comportamento nativo do clique. As bolhas têm `-webkit-touch-callout: none`, `user-select: none` e o `contextmenu`
  bloqueado, para o iOS não abrir a pré-visualização de link.

## Open Questions

Nenhuma.
