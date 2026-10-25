# Tasks: Navegação mobile enxuta + cabeçalho do login

Spec: `SPEC.md` · Plano: `tasks/plan.md`

## Task 1: Cabeçalho do login sem sobreposição no celular

**Description:** No `@media (max-width: 768px)`, o `.lm-auth-page__header` passa de `1fr auto 1fr` para `1fr auto`: o
`<span />` vazio é escondido, a marca fica à esquerda e idioma + tema à direita, com gap ≥ `--space-2`. O desktop fica
como está.

**Acceptance criteria:**
- [ ] Em 320, 360 e 390px a marca e os controles não se sobrepõem nem encostam (AC7)
- [ ] Acima de 768px o cabeçalho continua centralizado como hoje

**Verification:**
- [ ] `npm run lint` e `npm run build` verdes
- [ ] Manual: `/auth` no DevTools em 320/360/390/1024px, claro e escuro, PT e EN

**Dependencies:** None

**Files likely touched:**
- `src/auth/pages/AuthPage.css`
- `src/auth/pages/AuthPage.tsx` (só se precisar de uma classe no `<span />`)

**Estimated scope:** XS

## Task 2: Lógica pura da navegação mobile

**Description:** Criar `src/shared/utils/moduleNav.ts` com `splitNavItems(items, primaryCount)` → `{ primary, overflow }`
e `isAnyItemActive(items, pathname)`, que é verdadeira quando algum item com `path` casa com o pathname
(`matchPath`, `end: false`). Testes ao lado.

**Acceptance criteria:**
- [ ] `splitNavItems` cobre: menos itens que o limite, exatamente o limite, mais que o limite
- [ ] `isAnyItemActive` cobre: rota exata, sub-rota (`/finance/imports/abc`), rota de outro item, item `path: null`,
      prefixo enganoso (`/finance/categoriesX` não casa)

**Verification:**
- [ ] `npm test` verde, com os novos casos
- [ ] `npm run lint` verde

**Dependencies:** None

**Files likely touched:**
- `src/shared/utils/moduleNav.ts`
- `src/shared/utils/moduleNav.test.ts`

**Estimated scope:** S

## Checkpoint A
- [ ] `npm test`, `npm run lint`, `npm run build` verdes
- [ ] Login conferido em 320/360/390px

## Task 3: Aba "Mais" e folha inferior no ModuleSidebar

**Description:** Com `MOBILE_PRIMARY_COUNT = 3`, os links a partir do 4º e "Todos os módulos" ganham
`lm-module-sidebar__link--overflow` (`display: none` só no compacto). Um `<button>` "Mais" (`ellipsis`,
`aria-haspopup="dialog"`, `aria-expanded`) entra como 4ª coluna da barra, com estado ativo via `isAnyItemActive`
sobre os excedentes, e fica escondido acima de 768px. Ao tocar, ele abre um `Dialog` com título, os itens excedentes
(o ativo destacado, `path: null` desabilitado com "Em breve"), um divisor e "Todos os módulos". A folha fecha ao
navegar (efeito no `pathname` + `onClick` no link) e devolve o foco ao botão quando fecha sem navegar. Textos novos em
`common` (pt-BR e en-US).

**Acceptance criteria:**
- [ ] No compacto: 4 abas iguais em Finanças e Hábitos, sem rótulo truncado em 360px (pt-BR e en-US); folha abre, lista
      os itens certos e fecha por item/Escape/fundo/fechar (AC1–AC3)
- [ ] "Mais" ativo em rotas excedentes (inclusive sub-rotas) e o item atual destacado na folha; foco volta ao botão
      (AC4, AC5)
- [ ] Desktop igual ao de hoje: todos os itens, "Todos os módulos", colapsar, sem "Mais" (AC6)

**Verification:**
- [ ] `npm test`, `npm run lint`, `npm run build` verdes
- [ ] Manual no DevTools em 320/360/390/768/1024px, claro/escuro, PT/EN: `/finance/dashboard`, `/finance/categories`,
      `/finance/imports/<id>`, `/habits/today`, `/habits/history`; teclado (Tab até "Mais", Enter, Escape → foco volta)

**Dependencies:** Task 2

**Files likely touched:**
- `src/shared/components/ModuleSidebar/ModuleSidebar.tsx`
- `src/shared/components/ModuleSidebar/ModuleSidebar.css`
- `src/shared/components/Icon/Icon.tsx`
- `src/shared/locales/pt-BR.ts`
- `src/shared/locales/en-US.ts`

**Estimated scope:** M

## Checkpoint B
- [ ] AC1–AC6 conferidos no navegador nos dois módulos, temas e idiomas
- [ ] Revisão com você antes da documentação

## Task 4: Documentação

**Description:** Descrever a aba "Mais" em `docs/fluxo-de-telas.md` (seção do menu do módulo, perto da linha "No
celular…", com os rótulos exatos de `pt-BR.ts`), atualizar a nota "Module navigation" do CLAUDE.md (3 principais +
"Mais", `moduleNav.ts`) e marcar as perguntas abertas do SPEC.md como resolvidas.

**Acceptance criteria:**
- [ ] O guia diz quais telas ficam na barra e quais vão para "Mais", em cada módulo (AC8)
- [ ] CLAUDE.md e SPEC.md refletem o que foi construído

**Verification:**
- [ ] Revisão de leitura: os rótulos citados batem com `src/shared/locales/pt-BR.ts` e os locales dos módulos

**Dependencies:** Task 3

**Files likely touched:**
- `docs/fluxo-de-telas.md`
- `CLAUDE.md`
- `SPEC.md`

**Estimated scope:** XS

## Checkpoint C: Completo
- [ ] AC1–AC8 atendidos
- [ ] `npm test`, `npm run lint`, `npm run build` verdes
- [ ] Pronto para você revisar e commitar
