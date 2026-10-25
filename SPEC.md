# Spec: Navegação mobile enxuta (barra inferior com "Mais") + cabeçalho do login

## Objective

No celular (≤768px), a barra inferior de cada módulo (`shared/components/ModuleSidebar/`) mostra **todos** os itens do
módulo + "Todos os módulos": 6 abas em Finanças e 5 em Hábitos. Em 360px cada aba fica com ~60px, os rótulos são
cortados com reticências e os alvos de toque ficam apertados. No login, o grupo idioma + tema invade o título
"LifeManager", porque o cabeçalho é um grid `1fr auto 1fr` e as colunas laterais (~89px) são menores que o grupo
(~130px).

**Usuário:** quem usa o LifeManager pelo celular, que é o alvo principal (CLAUDE.md, "Responsiveness").

**O que vamos construir:**

1. **Barra inferior com no máximo 4 abas:** as 3 primeiras telas do módulo (na ordem de `NAV_ITEMS`) + uma aba
   **"Mais"**. "Mais" abre uma folha inferior (o `Dialog` compartilhado, que já vira bottom sheet no compacto) com as
   demais telas do módulo e "Todos os módulos".
   - Finanças: Painel · Meses · Planejamento · Mais → (Importar extrato, Categorias, Todos os módulos)
   - Hábitos: Hoje · Hábitos · Loja · Mais → (Histórico, Todos os módulos)
2. **Cabeçalho do login sem sobreposição:** no compacto, marca à esquerda e idioma + tema à direita, em uma linha, sem
   encostar.

**Fora do escopo:** a sidebar no desktop (>768px) continua igual, inclusive o colapsar. Não muda o Header, as listas
nem os filtros (você disse que o resto está ok). Nenhuma rota nova.

### Critérios de aceite

- **AC1:** em ≤768px, a barra de Finanças e a de Hábitos mostram exatamente 4 abas, e nenhum rótulo fica truncado em
  360px de largura, em pt-BR nem em en-US.
- **AC2:** tocar em "Mais" abre a folha com as telas restantes (ícone + rótulo, na ordem de `NAV_ITEMS`), um divisor e
  "Todos os módulos". Item com `path: null` aparece desabilitado, com o selo "Em breve".
- **AC3:** escolher um item da folha navega e fecha a folha. Também fecham: Escape, tocar no fundo e o botão de fechar
  (o comportamento padrão do `Dialog`).
- **AC4:** numa rota que está dentro de "Mais" (ex. `/finance/categories`, `/finance/imports/:id`), a aba "Mais" fica
  com o estado ativo, e a tela atual aparece destacada dentro da folha.
- **AC5:** "Mais" é um `<button>` com `aria-haspopup="dialog"` e `aria-expanded`. Ao fechar a folha, o foco volta para
  ele. Os itens da folha são links navegáveis por teclado.
- **AC6:** no desktop (>768px) a sidebar fica visualmente e funcionalmente igual à de hoje (todos os itens, "Todos os
  módulos", colapsar) e o botão "Mais" não aparece.
- **AC7:** no login, em 320px, 360px e 390px, a marca e os controles de idioma/tema não se sobrepõem nem encostam (gap
  ≥ `--space-2`). Acima de 768px, o layout centralizado de hoje fica igual.
- **AC8:** os textos novos ("Mais", título da folha, rótulo de fechar) estão em `common` nos dois idiomas, e
  `docs/fluxo-de-telas.md` descreve a aba "Mais".

## Tech Stack

Vite + React 19 + TypeScript, `react-router-dom` (data router), `react-i18next`, CSS puro com tokens
(`shared/styles/tokens/`), `lucide-react` através do `Icon`, Vitest. **Nenhuma dependência nova.**

## Commands

```
Dev:    npm run dev
Test:   npm test
Lint:   npm run lint
Build:  npm run build        # tsc -b + vite build
```

## Project Structure (arquivos tocados)

```
src/shared/components/ModuleSidebar/ModuleSidebar.tsx   → aba "Mais" + folha (renderiza o Dialog quando aberto)
src/shared/components/ModuleSidebar/ModuleSidebar.css   → esconde os itens excedentes no compacto; estilo da folha
src/shared/utils/splitNavItems.ts (+ .test.ts)          → divisão pura: principais / excedentes, e qual está ativo
src/shared/components/Icon/Icon.tsx                     → registrar `ellipsis` (ícone do "Mais") se ainda não existir
src/shared/locales/{en-US,pt-BR}.ts                     → moduleSidebar.more, moduleSidebar.moreTitle, ...
src/auth/pages/AuthPage.css (e talvez .tsx)             → cabeçalho em 2 colunas no compacto
docs/fluxo-de-telas.md                                  → aba "Mais" em Finanças e Hábitos
CLAUDE.md                                               → atualizar a nota de "Module navigation"
```

`FinanceSidebar`/`HabitsSidebar` não mudam: a ordem do `NAV_ITEMS` já define as 3 principais.

## Design técnico

- **Um DOM só, decidido por CSS:** `ModuleSidebar` continua renderizando todos os links. No compacto, os links com
  índice ≥ 3 ganham `lm-module-sidebar__link--overflow` (`display: none`), assim como "Todos os módulos". O botão "Mais"
  existe sempre no DOM, mas fica `display: none` acima de 768px. Não há media query em JS, e girar a tela não quebra o
  estado.
- **Folha:** `<Dialog>` compartilhado, renderizado só enquanto `open`. Fecha com `useLocation()`: quando o pathname
  muda, a folha fecha.
- **Ativo no "Mais":** `matchPath({ path: item.path, end: false }, pathname)` contra os itens excedentes, para que
  sub-rotas como `/finance/imports/:id` contem.
- **Constante:** `MOBILE_PRIMARY_COUNT = 3` em `ModuleSidebar`, sem nova prop, até algum módulo precisar de outra coisa.
- **Login:** no `@media (max-width: 768px)`, `.lm-auth-page__header` passa a `grid-template-columns: 1fr auto`, o
  `<span />` vazio some e a marca fica alinhada à esquerda.

## Code Style

Seguir o padrão existente: componentes em função, `translate('common:...')` com namespace explícito, classes BEM
`lm-*`, `import type` para tipos, um comentário curto só onde a regra não é óbvia.

```ts
// shared/utils/splitNavItems.ts
export function splitNavItems<T>(items: T[], primaryCount: number) {
  return { primary: items.slice(0, primaryCount), overflow: items.slice(primaryCount) }
}
```

CSS: hover dentro de `@media (hover: hover)`, alturas por token (`--bottom-nav-height`, `--control-height-*`) e
safe-area preservada (`env(safe-area-inset-bottom)`).

## Testing Strategy

- **Vitest (unitário):** `splitNavItems` (menos itens que o limite, exatamente o limite, mais que o limite) e a função
  que decide se "Mais" está ativo (rota exata, sub-rota, rota de item principal, `path: null`).
- **Manual no navegador** (DevTools, emulação de dispositivo), nos dois temas e nos dois idiomas:
  - 320 / 360 / 390 / 768px: barra com 4 abas sem truncar; folha abre/fecha (item, Escape, fundo); "Mais" ativo em
    Categorias, Importar e Histórico; foco volta ao botão.
  - 769px+: sidebar igual à de hoje, colapsar funciona, sem "Mais".
  - Login em 320 / 360 / 390px sem sobreposição; desktop centralizado.
- `npm run lint`, `npm test` e `npm run build` verdes.

## Boundaries

- **Always:** i18n em todo texto novo (pt-BR + en-US); `Dialog` compartilhado para a folha; tokens em vez de valores
  fixos; atualizar `docs/fluxo-de-telas.md` e a nota do CLAUDE.md no mesmo change; validar em 360px antes de dar como
  pronto.
- **Ask first:** mudar quais telas são principais em algum módulo; mexer no Header ou no layout desktop; adicionar
  dependência; criar prop nova no `ModuleSidebar`.
- **Never:** importar ícones do `lucide-react` direto (usar o registro do `Icon`); ação acessível só por hover; usar
  `100vh` sem fallback `dvh`; commitar sem você pedir.

## Success Criteria

AC1 a AC8 verificados como descrito acima, com lint, testes e build verdes.

## Open Questions

1. **Hábitos tem 4 telas.** Pela regra "3 + Mais", Histórico vai para "Mais". A alternativa é deixar 5 abas em Hábitos
   (as 4 telas + "Mais" só com "Todos os módulos"). Recomendo 3 + Mais nos dois módulos, por consistência.
2. **Ordem das principais em Finanças:** Painel, Meses, Planejamento ficam na barra, e Importar e Categorias vão para
   "Mais". Está ok, ou prefere outra combinação (ex. Importar no lugar de Planejamento)?
