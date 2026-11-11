# Spec: `transactions-export` (front)

Módulo do mapa [`README.md`](README.md) (N5). Branch `feature/transactions-export`, a partir da `dev`, nos dois repos. Contrato da API: [`LifeManager/docs/specs/transactions-export.md`](../../../LifeManager/docs/specs/transactions-export.md).

## Objetivo

Baixar os lançamentos de um período em CSV, direto da tela de Meses ou do Painel.

## Escopo

1. **Botão "Exportar"** (ícone `download`, secundário):
   - no cabeçalho de **Meses**;
   - no cabeçalho do **Painel**, que já abre com o período do Painel preenchido.
2. **`ExportTransactionsDialog`** (`finance/components/`), um `Dialog` com:
   - **de** e **até**, com o `MonthYearSelect`. Padrão: os últimos 12 meses até o mês corrente; no Painel, o período em uso;
   - **tipo**: Todos / Despesas / Receitas / Investimentos;
   - **formato**: "Planilha em português (Excel BR)" ou "Planilha em inglês", com o padrão vindo do idioma da interface;
   - validação local: até ≥ de, e no máximo 36 meses (`validation/exportSchema.ts`, os mesmos limites do back).
   - **"Baixar":** `fetch` com o token → `blob` → `shared/utils/downloadBlob.ts` (já existe, do `account-settings`: `fileNameFromContentDisposition` e `saveBlob`; o `apiDownload` do `httpClient` traz o blob e o cabeçalho). O nome do arquivo vem do `Content-Disposition`. O botão mostra "Preparando…" e o dialog fecha ao terminar, com o toast "Arquivo baixado".
   - **Erros:** os códigos de período do dashboard pelo mapa existente, e 429 "Tente de novo em alguns minutos".
3. O CSV é gerado no back. O front não monta nenhuma linha.

## Critérios de aceite

- O arquivo baixado abre no Excel BR com acentos e valores certos (vírgula decimal, `;`), e no Google Planilhas com o formato inglês.
- Um período sem lançamentos não baixa nada, e o toast avisa: "Nenhum lançamento no período". A informação vem do cabeçalho `X-Row-Count` do back.
- A 360px, o dialog é um bottom sheet, e o download funciona no Chrome Android e no Safari iOS (no iOS abre a folha de compartilhar).
- Tours de Meses e Painel e `docs/fluxo-de-telas.md` ganham o botão.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:**
  - `exportSchema` (limites);
  - a montagem da query (`utils/exportQuery.ts`);
  - a leitura do nome do arquivo do `Content-Disposition`, que também cobre um nome com UTF-8 (`filename*`);
  - o teste do tour.
- **Manual (usuário):** abrir o arquivo nos dois programas, e o download no celular.

## Arquivos

`finance/components/ExportTransactionsDialog/` (novo), `finance/validation/exportSchema.ts` (+ teste), `finance/utils/exportQuery.ts` (+ teste), `finance/services/transactionService.ts`, `finance/pages/MonthsPage.tsx`, `finance/pages/DashboardPage.tsx`, `shared/utils/downloadBlob.ts`, `shared/components/Icon/Icon.tsx` (`download`, se faltar), as locales, `financeTours.ts` e `docs/fluxo-de-telas.md`.
