# Spec: `skeleton` (skeleton screens)

Módulo do mapa `SPEC-loadings.md`.

## Objetivo

Trocar os textos "Carregando…" por **esqueletos com a mesma forma do conteúdo que vai chegar**, nas telas cujo layout já se conhece (listas, cards, totais). O usuário entende na hora o que vai aparecer, e a tela não pula quando os dados chegam.

## Escopo

### O que vira skeleton (status `loading` na primeira carga)

| Área | Componente ou página | Formato do skeleton |
|---|---|---|
| Finanças | `TransactionList` | 5 linhas: ícone redondo, duas linhas de texto e o valor à direita |
| Finanças | `CategoryList` | 5 linhas: ponto de cor e nome |
| Finanças | `RecurringTransactionList` | 4 linhas, no formato da linha real |
| Finanças | `MonthlySummaryList` | 4 cards de mês |
| Finanças | `StatementImportList` | 3 linhas de importação |
| Finanças | `ImportRowList` | 5 linhas de importação |
| Finanças | `DashboardPage` | totais (3 blocos), gráfico (bloco do tamanho do `MonthlyFlowChart`), ranking (4 linhas) |
| Finanças | `BudgetsPage` | 4 barras de orçamento |
| Finanças | `MonthDetailsPage`, `ImportReviewPage` | cabeçalho, totais e a lista |
| Hábitos | `TodayPage` | 4 itens de check-in |
| Hábitos | `HabitList`, `RewardList`, `RedemptionList`, `LedgerList` | 4–5 linhas no formato real |
| Hábitos | `HabitDetailsPage` | stats e heatmap (bloco) |
| Hábitos | `PlayerHeader` | já tem placeholder. Migrar para os primitivos novos, sem mudar o tamanho |
| Finanças | `DailySpendingCalendar` | grade do calendário (blocos dos dias) |
| Hábitos | `AchievementGrid`, `GameItemList` | grade de cards no formato real |
| Hábitos | `ChallengesPage` | 3 cards de desafio |
| Hábitos | `ProfilePage`, `ProfileShowcase`, `EvolutionChart` | vitrine do perfil e bloco do gráfico |
| Hábitos | `RankingGroupList`, `RankingGroupPage` | 4 linhas de grupo e 5 linhas de ranking |

### O que **não** vira skeleton

- **Recarga com dados na tela** (`isFetching` ao paginar, buscar ou filtrar). Continua mostrando a página anterior, como hoje. O skeleton é só para a **primeira** carga, sem dados.
- **Selects de categoria nos modais** (`categoriesLoading`): ficam com o texto atual, porque um dropdown não tem layout previsível.
- **Botões com spinner** (`Button loading`): ficam como estão.
- **`MonthBudgetsSummary` e o nome no `Header`**: continuam ocultos enquanto carregam, por decisão já registrada (são cards laterais e opcionais).
- **Estados de erro e de vazio**: não mudam.

## Comportamento

- **Pulso, sem brilho que desliza:** os blocos usam `--surface-sunken` e pulsam a opacidade (1 → 0,55 → 1, 1,4s, infinito). O pulso é barato (compositor) e não precisa sincronizar gradientes entre blocos.
- **Sem atraso:** o skeleton aparece na hora. Como ele ocupa o mesmo espaço do conteúdo, uma aparição curta não incomoda.
- **Mesmas dimensões:** o skeleton de cada lista **reutiliza as classes de layout da linha real** (padding, gap, altura). Só o conteúdo vira bloco. É isso que garante zero salto.
- **Acessibilidade:** o contêiner leva `aria-busy="true"` e o texto de carregamento atual **visualmente oculto** (reaproveita as chaves `*.loading` que já existem: nada novo para traduzir). Os blocos levam `aria-hidden`.
- **Movimento reduzido:** os blocos ficam estáticos, sem pulso.
- **Mobile-first:** cada skeleton é desenhado primeiro a 360px. Se a linha real muda de layout em telas largas, o skeleton acompanha pelas mesmas classes.

## Design técnico

```
src/shared/components/Skeleton/
  Skeleton.tsx        ← bloco primitivo
  SkeletonGroup.tsx   ← contêiner: aria-busy + rótulo oculto
  Skeleton.css
src/finance/components/TransactionList/
  TransactionListSkeleton.tsx   ← um por lista/página, ao lado do componente real
...
```

```tsx
interface SkeletonProps {
  /** 'text': altura de uma linha de texto; 'circle': ícone/avatar; 'block': retângulo livre. */
  shape?: 'text' | 'circle' | 'block' | 'pill'
  width?: number | string
  height?: number | string
  className?: string
}

interface SkeletonGroupProps {
  /** Lido pelo leitor de tela no lugar dos blocos, ex.: translate('finance:transactions.list.loading'). */
  label: string
  className?: string
  children: ReactNode
}
```

### Exemplo de uso, no estilo do projeto

```tsx
function TransactionListSkeleton() {
  const { t: translate } = useTranslation('finance')

  return (
    <SkeletonGroup label={translate('finance:transactions.list.loading')} className="lm-transaction-list__rows">
      {ROWS.map((row) => (
        <div key={row} className="lm-transaction-list__row">
          <Skeleton shape="circle" width={36} />
          <div className="lm-transaction-list__info">
            <Skeleton shape="text" width="60%" />
            <Skeleton shape="text" width="35%" />
          </div>
          <Skeleton shape="text" width={72} />
        </div>
      ))}
    </SkeletonGroup>
  )
}
```

Nesse exemplo, `const ROWS = [0, 1, 2, 3, 4]` (chaves estáveis, sem índice de `map` solto). Os nomes de classe são ilustrativos: na implementação, usar as classes reais de cada componente.

No componente real, `if (status === 'loading') return <TransactionListSkeleton />` substitui o `<div className="…__state">`.

### Classe "visualmente oculto"

O projeto repete `.…__visually-hidden` em 7 componentes. O `SkeletonGroup` traz a dele em `Skeleton.css`. **Não** refatorar as outras neste módulo, para não aumentar o escopo.

## Comandos

```
npm run lint
npm run build
npm test
```

## Estratégia de testes

- **Sem lógica pura nova.** Os skeletons são marcação, e o Vitest do projeto cobre só utils (sem jsdom). Se surgir algum helper (por exemplo, o número de linhas por breakpoint), ele ganha teste.
- **Verificação manual por tela (com o usuário):**
  1. DevTools em Slow 4G, a 360px: entrar em cada tela da tabela de escopo e ver o skeleton com a forma do conteúdo.
  2. **Salto:** comparar a posição da primeira linha com skeleton e com dados. A diferença deve ser de até 4px. No Dashboard, o Lighthouse deve dar **CLS < 0,1**.
  3. Paginar, buscar e filtrar com dados na tela: o skeleton **não** aparece, a lista anterior fica.
  4. Erro de rede (offline): aparece o estado de erro com "Tentar de novo", como hoje.
  5. Movimento reduzido: blocos estáticos.
  6. Leitor de tela (NVDA/TalkBack): anuncia "Carregando…" uma vez, não lê os blocos.
  7. Temas claro e escuro: os blocos se distinguem do fundo nos dois.

## Ordem de rollout (fatias pequenas, cada uma verificável e com seu commit)

1. Primitivos (`Skeleton`, `SkeletonGroup`, CSS, token `--duration-pulse: 1400ms`) + `TransactionList` como tela piloto.
2. Demais listas de finanças.
3. Páginas de finanças (Dashboard, Budgets, MonthDetails, ImportReview).
4. Hábitos (Today, as listas, HabitDetails) + migração do `PlayerHeader`.

## Limites

- **Sempre:** reutilizar as classes de layout reais nos skeletons; manter `aria-busy` e o rótulo oculto; usar só a primeira carga; atualizar o `CLAUDE.md` (registrar o padrão "listas com skeleton na primeira carga" ao lado do padrão de paged listings) e o `docs/fluxo-de-telas.md` onde ele descreve o "Carregando…".
- **Perguntar antes:** mudar o hook de algum feature (`status`, `isFetching`); mostrar o skeleton também durante o `isFetching`; adicionar uma dependência (por exemplo, `react-loading-skeleton`).
- **Nunca:** remover as chaves `*.loading` (elas viram o rótulo acessível); criar um skeleton genérico de "3 linhas cinza" para telas que têm layout conhecido.

## Critérios de sucesso

- [ ] Todas as telas da tabela de escopo mostram um skeleton na primeira carga, em vez de texto.
- [ ] A primeira linha não salta mais de 4px quando os dados chegam. O Lighthouse dá CLS < 0,1 no Dashboard.
- [ ] Recarga com dados na tela (`isFetching`) nunca mostra o skeleton.
- [ ] Leitor de tela anuncia o carregamento uma vez e os blocos ficam fora da árvore de acessibilidade.
- [ ] Sem pulso com movimento reduzido.
- [ ] Nenhuma dependência nova. `npm run lint`, `npm run build` e `npm test` passam.

## Decisões finais (2026-11-06)

1. **Linhas:** número fixo por lista (4–5), não o `pageSize`.
2. **Rollout:** as 4 fatias viram commits na mesma branch e no mesmo PR dos outros módulos (veja `SPEC-loadings.md`).
