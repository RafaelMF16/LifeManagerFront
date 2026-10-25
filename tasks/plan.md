# Implementation Plan: Navegação mobile enxuta + cabeçalho do login

Spec: `SPEC.md`. Tarefas e checkpoints: `tasks/todo.md`.

## Overview

No compacto (≤768px) a barra inferior do `ModuleSidebar` passa a ter no máximo 4 abas: as 3 primeiras telas do módulo
e um botão "Mais", que abre a folha inferior (`Dialog`) com as telas restantes e "Todos os módulos". O desktop não muda.
Em paralelo, o cabeçalho do login deixa de sobrepor a marca no celular.

## Architecture Decisions

- **Perguntas abertas da spec resolvidas pelas recomendações:** "3 + Mais" nos dois módulos (o Histórico de Hábitos vai
  para "Mais"); em Finanças ficam na barra Painel, Meses e Planejamento. Para trocar, é só reordenar o `NAV_ITEMS`
  (nenhum código depende de qual tela é principal).
- **Um DOM só, decidido por CSS:** os links excedentes e "Todos os módulos" recebem
  `lm-module-sidebar__link--overflow` (escondidos só no compacto), e o botão "Mais" fica escondido acima de 768px. Sem
  media query em JS: girar a tela não deixa a barra num estado inconsistente.
- **Lógica pura em `shared/utils/moduleNav.ts`:** `splitNavItems(items, primaryCount)` e
  `isAnyItemActive(items, pathname)` (com `matchPath`, `end: false`, ignorando `path: null`). É testável no Vitest sem
  DOM, já que o projeto não tem testing-library.
- **Foco:** o `Dialog` não devolve o foco ao fechar. O `ModuleSidebar` guarda um `ref` do botão "Mais" e chama
  `focus()` ao fechar pelo Escape, pelo fundo ou pelo botão de fechar. Ao fechar por navegação, o foco não volta (a página
  mudou). O `Dialog` não é alterado, para não mexer nos outros modais.
- **Fechar ao navegar:** um efeito de `pathname` (`useLocation`) fecha a folha. Também fecha ao clicar num link da folha
  que aponte para a própria rota atual (via `onClick`).
- **Ícone "Mais":** registrar `ellipsis` (lucide `Ellipsis`) no `Icon`; se a folha tiver um botão de fechar, `x` (o
  registro ainda não tem nenhum dos dois).

## Dependency Graph

```
moduleNav.ts (pura, testada)
      │
      └── ModuleSidebar (.tsx/.css) + Icon + locales common
                │
                └── docs/fluxo-de-telas.md + CLAUDE.md

AuthPage.css (independente de tudo acima)
```

## Task List

### Phase 1: Ganho rápido e base
- [x] Task 1: Cabeçalho do login sem sobreposição no celular (XS)
- [x] Task 2: Lógica pura da navegação mobile, com testes (S)

### Checkpoint A
- [ ] `npm test`, `npm run lint`, `npm run build` verdes; login conferido em 320/360/390px

### Phase 2: Barra com "Mais"
- [x] Task 3: Aba "Mais" e folha inferior no `ModuleSidebar` (M)

### Checkpoint B
- [ ] AC1–AC6 conferidos no navegador (Finanças e Hábitos, claro/escuro, pt-BR/en-US); revisão com você

### Phase 3: Documentação
- [ ] Task 4: `docs/fluxo-de-telas.md`, CLAUDE.md e SPEC.md atualizados (XS)

### Checkpoint C: Completo
- [ ] AC1–AC8 atendidos; lint, testes e build verdes; pronto para você revisar e commitar

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rótulo longo ("Planejamento") ainda truncar em 320px | Med | 4 abas dão ~80px cada em 320px; conferir em 320px; se truncar, reduzir o `padding` lateral da aba antes de mexer na fonte |
| Folha aberta ao girar para paisagem acima de 768px vira modal centralizado | Low | Aceitável (continua funcional); ela fecha na primeira navegação |
| `display: contents` no `nav` + botão novo quebrar o grid da barra | Med | O botão "Mais" fica no mesmo nível de grid dos links; conferir que são 4 colunas iguais |
| Aba "Mais" e item principal ativos ao mesmo tempo | Low | `isAnyItemActive` usa só os excedentes; teste unitário cobre rota de item principal |
| Mudança no `ModuleSidebar` afetar o desktop | Med | Todas as regras novas ficam dentro do `@media (max-width: 768px)`, exceto o `display: none` do botão "Mais"; conferir sidebar recolhida/expandida |

## Open Questions

Nenhuma bloqueante. As duas da spec estão resolvidas pelos padrões acima e podem mudar com você.
