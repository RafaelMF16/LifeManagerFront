# Spec: `savings-goals` (front)

Módulo do mapa [`README.md`](README.md) (N4). Branch `feature/savings-goals`, a partir da `dev`, nos dois repos. Contrato da API: [`LifeManager/docs/specs/savings-goals.md`](../../../LifeManager/docs/specs/savings-goals.md).

## Objetivo

Criar objetivos de economia ("Viagem: R$ 5.000 até dez/2027") e vê-los crescer com os lançamentos de investimento ligados a eles.

## Escopo

1. **Nova aba "Objetivos"** em Planejamento (`/finance/planning/savings`), ao lado de Orçamento e Recorrentes.
   - O `PlanningPage` ganha a terceira aba.
   - A sidebar não muda: Planejamento já é o item.
2. **Lista** (`finance/components/SavingsGoalList/`), com `hooks/useSavingsGoals.ts` no padrão de listagem paginada (status `Active|Completed|Archived`, busca, ordenação). Cada objetivo é um cartão:
   - ícone e nome;
   - barra de progresso com "R$ 2.300 de R$ 5.000 (46%)";
   - prazo: "até dez/2027 · faltam 13 meses";
   - "Guarde R$ 208/mês";
   - selo de ritmo: "No ritmo" / "Atrasado" / "Concluído", com cor e texto, nunca só cor.
   - Ações: editar, arquivar.
3. **Formulário** (`SavingsGoalFormModal`, `validation/savingsGoalSchema.ts` + `savingsGoalErrorMap.ts`):
   - nome;
   - meta (texto via `amountField`);
   - prazo opcional (`MonthYearSelect`, a partir do mês corrente);
   - valor que já tinha guardado;
   - ícone (reaproveita a ideia de `rewardIcons`, com uma lista própria de ícones de objetivo no registro do `Icon`).
4. **Detalhe** (`/finance/planning/savings/:goalId`):
   - o cartão grande;
   - um gráfico de barras do guardado por mês nos últimos 12 meses (SVG à mão, como o `MonthlyFlowChart`, cor `--chart-investment`);
   - a lista dos lançamentos ligados: `TransactionList` com o filtro `savingsGoalId`, link para o mês de cada um.
5. **Ligar lançamentos:** no `TransactionFormModal`, quando o tipo é **Investimento**, aparece o campo opcional "Objetivo" (`Select` com os objetivos ativos, uma página de até 100; dificilmente alguém tem mais). Trocar o tipo limpa o campo. A lista de lançamentos mostra um selo com o nome do objetivo.
6. **Modo privacidade:** valores mascarados, barras em cor neutra e o "Guarde R$ X/mês" escondido, como no orçamento.

## Critérios de aceite

- Criar "Viagem", R$ 5.000, até dez/2027. Lançar um investimento de R$ 500 ligado a ele: o cartão mostra 10%, e o "Guarde por mês" é recalculado.
- Apagar esse lançamento: o progresso volta.
- Trocar o tipo do lançamento para Despesa: o campo Objetivo some e não é enviado.
- Arquivar e restaurar: as regras de nome repetido aparecem no campo.
- A 360px: os cartões em uma coluna e o gráfico legível. Nos dois temas.
- Tour de Planejamento ganha o passo da aba Objetivos, e `docs/fluxo-de-telas.md` ganha a tela.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:**
  - `savingsGoalSchema`;
  - o mapa de erros;
  - `utils/savingsGoal.ts` (textos de prazo, "faltam N meses", selo por `pace`);
  - a geometria do gráfico, reaproveitando `chartScale`;
  - o teste do tour.
- **Manual (usuário):** os critérios acima.

## Arquivos

`finance/pages/PlanningPage.tsx`, `finance/pages/SavingsGoalsPage.tsx` e `SavingsGoalDetailsPage.tsx` (novos), `finance/components/SavingsGoal*/` (novos), `finance/hooks/useSavingsGoals.ts` e `useSavingsGoal.ts`, `finance/services/savingsGoalService.ts`, `finance/types/SavingsGoalDtos.ts`, `finance/validation/*`, `finance/utils/savingsGoal.ts` (+ teste), `TransactionFormModal`, `TransactionList`, `shared/components/Icon/Icon.tsx` (ícones novos), `src/App.tsx`, as locales, `financeTours.ts`, `CLAUDE.md` e `docs/fluxo-de-telas.md`.
