# Tasks: Menu radial no celular

Spec: `SPEC.md` · Plano: `tasks/plan.md`

## Task 1: Geometria do arco

**Description:** `src/shared/utils/radialLayout.ts` exporta `radialLayout(count, viewportWidth)`, que devolve uma
posição `{ x, y }` por bolha (px a partir do centro do botão, `y` para cima), da esquerda para a direita, num arco de até
200° com o menor raio em que bolhas de 48px (+4px de folga) não colidem e ficam a 8px das bordas.

**Acceptance criteria:**
- [x] Para 5 e 6 itens em 320, 360, 390 e 430px: nenhuma colisão, tudo dentro da tela, ordem da esquerda para a direita
- [x] O arco é simétrico (o primeiro e o último item espelhados) e o raio não passa de ~110px para 6 itens

**Verification:**
- [x] `npm test` com os novos casos; `npm run lint`

**Dependencies:** None

**Files likely touched:**
- `src/shared/utils/radialLayout.ts`
- `src/shared/utils/radialLayout.test.ts`

**Estimated scope:** S

## Task 2: Botão flutuante e arco no lugar da barra

**Description:** Criar `shared/components/RadialNav/` com o botão redondo de 56px (ícone do módulo, que vira X quando
aberto, `aria-expanded`/`aria-controls`), o scrim e o arco (`role="dialog"`, `aria-modal`), as bolhas posicionadas por
`--x`/`--y`/`--i` de `radialLayout` e animadas por CSS (abrir ~260ms em cascata, fechar `--duration-base`; só fade com
movimento reduzido). Fecha por bolha (navegação), scrim, X e Esc, com o foco como no plano. O `ModuleSidebar` ganha
`moduleIcon`, renderiza o `RadialNav` e some no compacto; a aba "Mais" e a folha saem. `--app-bottom-inset` passa a ser
o botão + margens. `FinanceSidebar` (`wallet`) e `HabitsSidebar` (`check`) passam o ícone.

**Acceptance criteria:**
- [ ] No compacto: só o botão flutuante; abre e fecha com animação; todas as telas + "Todos os módulos" no arco, a atual
      destacada, `path: null` apagado (AC1–AC4, AC7)
- [ ] Foco vai para a primeira bolha, circula no menu e volta ao botão ao fechar sem navegar (AC6)
- [ ] Desktop igual ao de hoje; conteúdo e Toast livres do botão (AC8, AC9)

**Verification:**
- [ ] `npm test`, `npm run lint`, `npm run build`
- [ ] Manual no Safari (Modo de Design Responsivo) em 320/360/430/1024px: Finanças e Hábitos, abrir/fechar pelos 4
      caminhos, Tab, um toast, o orçamento com alterações não salvas

**Dependencies:** Task 1

**Files likely touched:**
- `src/shared/components/RadialNav/RadialNav.tsx`
- `src/shared/components/RadialNav/RadialNav.css`
- `src/shared/components/ModuleSidebar/ModuleSidebar.tsx`
- `src/shared/components/ModuleSidebar/ModuleSidebar.css`
- `src/shared/locales/{pt-BR,en-US}.ts`
- `src/finance/components/FinanceSidebar/FinanceSidebar.tsx`, `src/habits/components/HabitsSidebar/HabitsSidebar.tsx`

**Estimated scope:** M (no limite: se crescer, separar o `moduleIcon` numa tarefa)

## Task 3: Nome das telas

**Description:** No `RadialNav`: tooltip acima de cada bolha em `:hover` (dentro de `@media (hover: hover)`, deslocado
para dentro perto das bordas); um rótulo no meio do arco (`aria-hidden`) com o nome do item em foco; e, no toque,
segurar ~300ms mostra o nome ali e aumenta a bolha, enquanto soltar navega e arrastar cancela. As bolhas levam
`-webkit-touch-callout: none`, `user-select: none` e bloqueiam o `contextmenu`.

**Acceptance criteria:**
- [ ] Mouse: tooltip com o nome, sem sair da tela (AC3b, AC5)
- [ ] Teclado: o nome do item em foco aparece no meio do arco
- [ ] Toque: toque rápido navega; segurar mostra o nome; soltar navega; arrastar para fora cancela; sem pré-visualização
      de link no iOS

**Verification:**
- [ ] `npm run lint`, `npm run build`
- [ ] Manual: Safari no Mac (mouse e teclado); Simulador do iOS para segurar e soltar, se disponível (senão fica
      registrado como não verificado)

**Dependencies:** Task 2

**Files likely touched:**
- `src/shared/components/RadialNav/RadialNav.tsx`
- `src/shared/components/RadialNav/RadialNav.css`

**Estimated scope:** S

## Checkpoint A
- [ ] AC1–AC9 no Safari em 320/360/390/430px, claro/escuro, PT/EN, com e sem "Reduzir movimento"
- [ ] Revisão com você antes da documentação

## Task 4: Limpeza e documentação

**Description:** Remover `splitNavItems` (e os testes dele) de `moduleNav.ts` e as chaves de locale que ficaram sem uso
(`moduleSidebar.more`). Atualizar `docs/fluxo-de-telas.md` (menu do módulo no celular: o botão, o arco, segurar para ver
o nome) e o CLAUDE.md (a nota de "Module navigation", a exceção ao `Dialog` e o `RadialNav`).

**Acceptance criteria:**
- [ ] Nenhum código ou texto morto da aba "Mais"
- [ ] Guia e CLAUDE.md descrevem o menu radial, com os rótulos exatos de `pt-BR.ts` (AC10)

**Verification:**
- [ ] `npm test`, `npm run lint`, `npm run build`; `grep -rn "splitNavItems\|moduleSidebar.more" src` vazio

**Dependencies:** Task 3

**Files likely touched:**
- `src/shared/utils/moduleNav.ts`, `src/shared/utils/moduleNav.test.ts`
- `src/shared/locales/{pt-BR,en-US}.ts`
- `docs/fluxo-de-telas.md`, `CLAUDE.md`

**Estimated scope:** XS

## Checkpoint B: Completo
- [ ] AC1–AC10 atendidos
- [ ] `npm test`, `npm run lint`, `npm run build` verdes
