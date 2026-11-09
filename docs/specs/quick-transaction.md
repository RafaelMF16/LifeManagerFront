# Spec: `quick-transaction` (front)

Módulo do mapa [`README.md`](README.md) (M1). Branch `feature/quick-transaction`, a partir da `dev`, nos dois repos. Contrato da API: [`LifeManager/docs/specs/quick-transaction.md`](../../../LifeManager/docs/specs/quick-transaction.md).

## Objetivo

"Novo lançamento" num toque, de qualquer lugar de Finanças, sem criar nem abrir o mês antes. Também passa a dar para criar meses do ano anterior.

## Escopo

1. **Botão "Novo lançamento"** (ícone `plus`, primário):
   - no cabeçalho de **Meses** e do **Painel**;
   - no atalho do PWA (`/finance/months?new=1`, que abre o modal e limpa o parâmetro);
   - na Home, se o `home-overview` já existir.
2. **`TransactionFormModal` sem mês fixo** (`mode: 'quick'`):
   - **Data:** livre, padrão hoje. Validação `createQuickTransactionSchema(minDate, maxDate)`:
     - mínimo 01/01/2000, que é a regra do back para um mês existente;
     - máximo 31/12 do ano corrente;
     - o back decide se pode **abrir** um mês que falta (ano corrente ou anterior).
   - **Categoria:** com o `CategoryPicker`, se o `category-picker` já estiver na `dev`. Se não, com o select atual.
   - **Envio:** `POST /api/Transactions` (`transactionService.createQuick`).
   - **Sucesso:** toast "Lançamento salvo em novembro de 2026", ou "… · mês criado" quando `monthCreated`, com a ação "Ver mês" → `/finance/months/:monthlySummaryId`.
     - Se a tela aberta é aquele mês, recarrega a lista e os totais.
     - Se é o Painel, recarrega o período.
   - **`autoCheckIns`:** o mesmo toast que o lançamento aninhado já mostra.
   - **Erros:**
     - `MonthlySummary.YearNotCurrent` aparece no campo data: "Só dá para criar meses deste ano ou do anterior";
     - os outros códigos usam o mapa atual (`transactionErrorMap`).
3. **Criar mês com ano** (`MonthlySummaryFormModal`):
   - o ano deixa de ser só leitura e vira um `Select` com o ano corrente e o anterior;
   - padrão: o corrente;
   - envia `{ month, year }`.

## Critérios de aceite

- Sem novembro criado, "Novo lançamento" com a data de hoje cria o mês e o lançamento. O toast leva ao mês com os totais certos.
- Em janeiro (dá para simular trocando a data do sistema), um lançamento em 15/12 do ano anterior cria dezembro. Uma data de dois anos atrás num mês que não existe mostra o erro no campo.
- Um lançamento num mês que já existe, de qualquer ano (um importado de 2024, por exemplo), funciona.
- No celular, o modal é um bottom sheet, e o teclado numérico abre no valor.
- `docs/fluxo-de-telas.md` e os tours de Meses e Painel ganham o botão novo.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:**
  - `createQuickTransactionSchema` (limites de data, o resto igual ao schema atual);
  - a montagem do texto do toast (mês criado ou não), como função pura em `finance/utils/`.
- **Manual (usuário):** os 4 primeiros critérios a 360px.

## Arquivos

`finance/components/TransactionFormModal/*`, `finance/validation/transactionSchema.ts` (+ teste), `finance/services/transactionService.ts`, `finance/types/*`, `finance/pages/MonthsPage.tsx`, `finance/pages/DashboardPage.tsx`, `finance/components/MonthlySummaryFormModal/*`, `finance/locales/*`, `finance/utils/financeTours.ts`, `CLAUDE.md` (Finance: "the year is always the current one" muda) e `docs/fluxo-de-telas.md`.
