# Spec: `home-overview` (front)

Módulo do mapa [`README.md`](README.md) (M3 + V5). Branch `feature/home-overview`, a partir da `dev`, nos dois repos. Contrato da API: [`LifeManager/docs/specs/home-overview.md`](../../../LifeManager/docs/specs/home-overview.md).

## Objetivo

A Home deixa de ser dois cartões numa tela vazia e vira o resumo do dia, com atalhos para agir.

## Layout (360px primeiro, uma coluna; duas colunas acima de 768px)

1. **Saudação:** "Boa noite, Revisão", pela hora do aparelho, e a data de hoje (`today` do back, formatada com `Intl`).
2. **Cartão Hábitos:**
   - "1 de 4 feitos hoje", com barra de progresso;
   - "1 pendente de ontem", se houver;
   - a maior sequência ("Ler 10 páginas · 12 dias");
   - as recaídas de hoje dos hábitos a evitar, se houver;
   - nível, HP e moedas numa linha (se `player` vier).
   - Botão "Ir para Hoje" → `/habits/today`.
3. **Cartão Finanças:**
   - o mês corrente: saldo em destaque, receitas e despesas;
   - se houver orçamento: "R$ 3.120 de R$ 4.510" com barra, e a fatia mais apertada ("Mercado · 92%").
   - **Sem mês:** "Novembro ainda não tem lançamentos".
   - Botões: "Novo lançamento" (abre o `TransactionFormModal` rápido do `quick-transaction`, se já existir) e "Ver mês" ou "Ir para Finanças".
4. **Módulos:** os dois `ModuleCard` atuais, menores, no fim.

## Dados

- `home/services/homeService.ts` e `home/hooks/useHomeOverview.ts`: um `GET` com `AbortController`. Na volta à aba (`visibilitychange`), recarrega se a data mudou.
- O primeiro carregamento usa skeleton dos dois cartões, no padrão de `Skeleton`. Um erro mostra cada cartão com "Tentar de novo", sem modal.

## Modo privacidade

O saldo da Home tem que respeitar o modo privacidade de Finanças. Hoje o `usePrivacyMode` e as máscaras ficam em `finance/`, e uma feature não importa de outra.

- O store passa para `shared/hooks/usePrivacyMode.ts`, com a **mesma chave** `localStorage['lm-finance-privacy']`, então ninguém perde a preferência.
- `finance/hooks/usePrivacyMode.ts` vira um reexport, ou some e os imports são ajustados.
- A Home formata o dinheiro com um formatador compartilhado mínimo (`shared/utils/money.ts`: BRL, `Intl`, máscara). O `useFinanceFormat` passa a usá-lo, para as duas telas mascararem do mesmo jeito.
- O cartão Finanças da Home também tem o botão de olho (`PrivacyToggle` movido para `shared/components/`).

## Critérios de aceite

- A 360px: saudação, Hábitos e Finanças cabem sem rolagem horizontal, e os botões têm 44px no toque.
- Os números batem com a tela Hoje e com o detalhe do mês no mesmo momento.
- Com o modo privacidade ligado em Finanças, a Home mostra `R$ ••••••` e vice-versa, inclusive entre abas.
- Usuário novo (sem hábitos e sem mês): os dois cartões mostram um estado vazio com a ação de começar ("Criar primeiro hábito", "Novo lançamento").
- O redirecionamento de convite pendente da Home continua funcionando.
- Tour novo da Home (intro, Hábitos, Finanças), com textos nas duas línguas e o `describeTourCopy`.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:**
  - a saudação pela hora (`home/utils/greeting.ts`);
  - os textos dos cartões a partir do DTO (`home/utils/overviewCopy.ts`: vazio, sem orçamento, recaída);
  - `shared/utils/money.ts` (máscara);
  - o teste do tour.
- **Manual (usuário):** usuário de teste e usuário novo, nos dois temas, a 360px e no desktop.

## Docs

- `CLAUDE.md`: módulo `home/` e a mudança do `usePrivacyMode` para `shared/`.
- `docs/fluxo-de-telas.md`: a Home nova.

## Arquivos

`home/pages/HomePage.tsx` + CSS, `home/components/HabitsTodayCard/`, `home/components/FinanceMonthCard/`, `home/services/`, `home/hooks/`, `home/types/`, `home/utils/` (+ testes), `home/locales/*`, `shared/hooks/usePrivacyMode.ts`, `shared/components/PrivacyToggle/`, `shared/utils/money.ts` (+ teste), `finance/hooks/useFinanceFormat.ts`, o tour da Home (`home/utils/homeTours.ts`, registrado no `Header` da Home), `CLAUDE.md` e `docs/fluxo-de-telas.md`.
