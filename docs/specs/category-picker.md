# Spec: `category-picker`

Módulo do mapa [`README.md`](README.md) (M2 + P8). Branch `feature/category-picker`, a partir da `dev`. Só front: a busca de categorias já existe no back (`GET /api/Categories?search=`, sem acento e sem diferença de maiúsculas).

## Objetivo

Escolher uma categoria com busca, em vez de um `select` longo. Isso resolve o limite de 100 categorias (`useCategoryOptions` lê uma página só) e fica melhor no celular: digitar "mer" acha "Mercado".

## Componente: `finance/components/CategoryPicker/`

Fica em `finance/`, porque só o módulo Finanças usa categorias. É um **combobox ARIA** (padrão "combobox with listbox popup" do APG), feito em casa, **sem dependência nova**.

- **Campo:** um `Input` com `role="combobox"`, `aria-expanded`, `aria-controls` e `aria-activedescendant`. Ao focar ou digitar, abre a lista.
- **Lista:** `role="listbox"`, renderizada **no fluxo da página, abaixo do campo**, e não flutuando. Dentro do bottom sheet de um `Dialog` nada é cortado, e o sheet rola normalmente.
  - Altura máxima de 5 itens com rolagem.
  - Cada item tem 44px no toque (`--control-height-md`).
- **Dados:**
  - novo hook `finance/hooks/useCategorySearch.ts`: busca com debounce (`useDebouncedValue`, 250ms), `pageSize=20`, `sortDirection=Asc`, `AbortController` a cada nova busca;
  - abrir sem texto mostra as 20 primeiras;
  - um item "Ver mais" no fim carrega a próxima página.
- **Valor:** `value: { id, name } | null`, e `onChange`. O nome vem de quem chama (o lançamento editado já traz `categoryName`), então o campo mostra a categoria certa **mesmo que ela não esteja na página carregada**.
- **Teclado:**
  - ↑/↓ andam pela lista;
  - Enter escolhe;
  - Esc fecha e devolve o texto do valor atual;
  - Tab escolhe o item ativo e sai.
  - Sair do campo sem escolher volta ao valor anterior: texto solto nunca vira categoria.
- **Criar na hora** (opcional por prop, `onCreateRequest(term)`): um item "Criar categoria "<termo>"" no fim da lista abre o `CategoryFormModal` já preenchido. É o que a importação faz hoje com `NEW_CATEGORY_OPTION`.
- **Estados:**
  - carregando: uma linha "Buscando…";
  - vazio: "Nenhuma categoria encontrada";
  - erro: uma linha com "Tentar de novo".
- **`react-hook-form`:** integra via `Controller`. Os erros de validação continuam embaixo do campo, como no `Select`.
- **Exclusões:** prop `excludeIds` para o orçamento, que não oferece categorias que já têm fatia.

## Onde entra

São 5 lugares, e o `useCategoryOptions` é removido no fim:

- `TransactionFormModal`
- `RecurringTransactionFormModal`
- `AddSliceDialog` (com `excludeIds`)
- `ImportRowFormModal`
- `ImportRowList`: o seletor de categoria inline de cada linha, com o "criar" ligado.

`MonthDetailsPage`, `RecurringTransactionsPage`, `BudgetsPage` e `ImportReviewPage` param de carregar as opções.

O filtro de categoria da lista de lançamentos (`TransactionList`) também passa para o picker, com um item "Todas" no lugar de `null`.

## Critérios de aceite

- Um usuário com 150 categorias acha e escolhe a 150ª pela busca, em qualquer um dos 5 lugares.
- Editar um lançamento cuja categoria está fora das 20 primeiras mostra o nome certo.
- Funciona a 360px dentro do bottom sheet, com o teclado do celular aberto: a lista fica visível acima do teclado, porque o sheet rola até o campo.
- Só com teclado: abrir, navegar, escolher e cancelar. O leitor de tela anuncia o item ativo.
- Nenhuma chamada a `/api/Categories` com `pageSize=100` sobra no código.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:** a máquina de estados do combobox (abrir, ativo, escolher, reverter ao sair) vira um reducer puro, `finance/utils/comboboxState.ts`, com testes.
- **Manual (usuário):** os 5 lugares no celular, o "criar" na importação e o teclado no desktop.

## Docs

`CLAUDE.md` (o picker no lugar do `useCategoryOptions`; some a frase do limite de 100) e `docs/fluxo-de-telas.md` (os campos de categoria agora têm busca).

## Arquivos

`finance/components/CategoryPicker/` (novo), `finance/hooks/useCategorySearch.ts` (novo), `finance/utils/comboboxState.ts` (+ teste), os 5 componentes acima, as 4 páginas, `finance/hooks/useCategoryOptions.ts` (removido), `finance/locales/*`, `CLAUDE.md` e `docs/fluxo-de-telas.md`.
