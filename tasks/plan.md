# Implementation Plan: Menu radial no celular

Spec: `SPEC.md`. Tarefas e checkpoints: `tasks/todo.md`. Substitui o plano da aba "Mais" (todas as tarefas feitas,
commits `6f67512`..`54894d6`); a aba "Mais" e a folha saem, e a correção do login fica.

## Overview

No compacto (≤768px), a barra de abas do `ModuleSidebar` dá lugar a um botão flutuante centralizado com o ícone do
módulo. Ao tocar nele, um arco de bolhas só com ícone (todas as telas + "Todos os módulos") sai do botão com animação.
O nome de cada tela aparece num tooltip com o mouse, no meio do arco com o foco do teclado e, no toque, ao segurar a
bolha ~300ms. O desktop não muda.

## Architecture Decisions

- **Componente próprio `shared/components/RadialNav/`:** o botão, o scrim e o arco. O `ModuleSidebar` o renderiza e
  esconde a si mesmo no compacto, então `FinanceLayout`/`HabitsLayout` não mudam. Não usa o `Dialog` compartilhado, que
  vira bottom sheet; é a exceção anotada no CLAUDE.md.
- **Sempre no DOM, aberto por classe:** as bolhas ficam montadas (escondidas e `inert` quando fechado), assim a transição
  de abrir e fechar é CSS puro (`transition` com `transition-delay: calc(var(--i) * 20ms)`), sem esperar a animação para
  desmontar.
- **Geometria pura em `shared/utils/radialLayout.ts`:** recebe a quantidade de itens e a largura e devolve `{ x, y }`
  por bolha (arco de até 200°, raio mínimo que não colide, 8px de margem lateral). Os testes repetem a checagem de
  colisão do script da análise.
- **Aberto só no pathname em que abriu:** a mesma técnica da folha "Mais", então navegar fecha sem efeito.
- **Foco:** abrir foca a primeira bolha; Tab e Shift+Tab circulam entre as bolhas e o X; Esc, scrim e X fecham e devolvem
  o foco ao botão. Navegar não devolve o foco.
- **Segurar para ver o nome:** `onPointerDown` arma um timer de 300ms só para `pointerType === 'touch'`;
  `pointerup`/`pointerleave`/`pointercancel` o desarmam e limpam o nome. O clique continua nativo (soltar em cima
  navega, arrastar para fora cancela). O nome no meio do arco é um elemento só (`aria-hidden`, já que cada bolha tem
  `aria-label`), preenchido pelo foco ou pelo toque segurado.
- **`--app-bottom-inset`** passa a ser o botão + margens (56 + 2×12px), e o Toast e o conteúdo continuam livres.
- **`splitNavItems` sai** (sem uso); `isAnyItemActive` fica para destacar a tela atual.

## Dependency Graph

```
radialLayout.ts (pura, testada)
      │
      └── RadialNav (abrir/fechar, animação, foco)  ← ModuleSidebar no compacto + moduleIcon
                │
                └── nomes: tooltip (hover), meio do arco (foco), segurar (toque)
                          │
                          └── docs/fluxo-de-telas.md + CLAUDE.md
```

## Task List

### Phase 1: Base
- [ ] Task 1: Geometria do arco, com testes (S)

### Phase 2: O menu
- [ ] Task 2: Botão flutuante e arco no lugar da barra (M)
- [ ] Task 3: Nome das telas: tooltip, foco e segurar (S)

### Checkpoint A
- [ ] AC1–AC9 no Safari em 320/360/390/430px, claro/escuro, PT/EN, com e sem "Reduzir movimento"; revisão com você

### Phase 3: Limpeza e documentação
- [ ] Task 4: Docs, CLAUDE.md e remoção do que sobrou da aba "Mais" (XS)

### Checkpoint B: Completo
- [ ] AC1–AC10; lint, testes e build verdes

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS abre a pré-visualização de link ao segurar | High | `-webkit-touch-callout: none`, `user-select: none`, `preventDefault` no `contextmenu`; conferir no Simulador do iOS, já que o Safari do Mac não reproduz |
| Clique não dispara depois de segurar no iOS | Med | Não depender dele: se o Simulador mostrar isso, navegar no `pointerup` quando houve "segurar" e o dedo ainda está na bolha |
| O botão flutuante cobre conteúdo fixo embaixo (`UnsavedChangesBar`, `ImportBulkBar`) | Med | Conferir o orçamento com alterações e a revisão de importação com seleção; as duas são sticky e respeitam `--app-bottom-inset` |
| Bolhas `inert`/escondidas ainda recebem foco | Med | `inert` no container fechado (suportado no Safari 15.5+) e conferir com Tab |
| Toast passa por cima do botão | Low | O Toast já se desloca por `--app-bottom-inset`; conferir com um toast |
| Desktop afetado | Med | O `RadialNav` só aparece dentro do `@media (max-width: 768px)`; conferir a sidebar recolhida e expandida |

## Open Questions

Nenhuma.
