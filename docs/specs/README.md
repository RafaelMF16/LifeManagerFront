# Spec: Revisão geral do LifeManager (back + front), novembro de 2026

Este documento é o **mapa de capacidades** (Fase 0), aprovado em 09/11/2026, com o diagnóstico que o justifica e o **índice de todos os specs** dos dois repos (ver "Specs"). Cada spec precisa ser aprovado antes de virar código.

## Objetivo

Levantar o que está com problema, o que pode melhorar e o que vale acrescentar no LifeManager, e transformar isso em módulos pequenos, independentes e priorizados.

- **Usuário:** quem usa o app no celular (360px é o alvo) para controlar finanças e hábitos.
- **Sucesso:** cada achado vira um módulo com critério de aceite testável, ou é descartado conscientemente.

## Estado verificado (09/11/2026)

| Item | Resultado |
|---|---|
| `LifeManager` (back) | `main`, já atualizado (`5b21345`) |
| `LifeManagerFront` | trocado de `feature/loadings` para `main`, com fast-forward até `fb5fd91` (merge de loadings/skeletons) |
| Migrations | 0 pendentes: o banco local já está na `AddHabitAutoTrigger` |
| Back: `dotnet build` / `dotnet test` | ok, **2.019 testes passando** (1.205 Domain + 814 Application), **61 warnings** (todos CS8602 em `LifeManager.Application.Test`) |
| Front: `build` / `lint` / `test` | ok, **777 testes passando** (69 arquivos), lint limpo, aviso de chunk > 500 kB |
| Telas no navegador | verificadas a 360px com um usuário de teste (ver "Responsividade e revisão visual") |

Pontos fortes que **não** precisam de ação: toda rota do back tem `[Authorize]` ou rate limit; toda consulta filtra por usuário (conferido nos repositórios); nenhum segredo versionado; no CSS não há largura fixa acima de 360px, todo `100vh` tem o fallback `100dvh` e não há tabela com rolagem horizontal.

## Diagnóstico

### Problemas (bugs e riscos)

| # | Gravidade | Onde | O quê |
|---|---|---|---|
| P1 | **Média (bug)** | `LifeManager.Application/.../MonthlySummaryService.cs:21`, `LifeManager.Domain/.../MonthlySummaryYear.cs:18` | O ano do mês novo vem de `DateTimeOffset.UtcNow.Year`, não do `AppClock` (fuso do negócio). Em 31/12, das 21h às 24h (Brasília), criar "Dezembro" cria **dezembro do ano seguinte**, enquanto o front mostra o ano corrente. O teste também não alcança isso, porque o código lê o relógio fora do `TimeProvider`. |
| P2 | Baixa | `TokenService.cs:72,122,155`, `RefreshToken.cs:12`, `User.cs:12` | Leem `UtcNow` direto, fora do `TimeProvider`, então não dá para testar expiração com tempo controlado. |
| P3 | **Média (risco)** | back inteiro | Nada roda contra um Postgres real. SQL cru (`FOR UPDATE`, `ON CONFLICT`, `unnest`), mapeamentos EF e migrations só são verificados subindo a API (o próprio CLAUDE.md admite isso). |
| P4 | Baixa | `LifeManager.Tests/` | Projeto vazio, fora do `.slnx`. |
| P5 | Baixa | `LifeManager.Application.Test` | 61 warnings de nulabilidade (`CS8602`) escondem warnings novos. |
| P6 | **Média (perf mobile)** | `LifeManagerFront/src/App.tsx` | As 30 páginas são importadas de forma estática, num JS único de **1,07 MB (297 kB gzip)** e num CSS de 228 kB. No 4G, o login carrega o módulo Hábitos inteiro. |
| P7 | Baixa | `LifeManagerFront/index.html` | `<title>` "lifemanagerfront" (é o nome da aba e do favorito), sem `meta description`, `theme-color`, `apple-touch-icon` e manifest. O `<html lang>` em si está certo: `i18n.ts` e `applyLanguage` o atualizam em tempo de execução; o `en-US` do HTML só vale antes do JS carregar. |
| P8 | Baixa | `finance/hooks/useCategoryOptions.ts` | Os selects de categoria trazem só 100 categorias (limite conhecido, documentado no código). |
| P9 | Baixa | front: `TransactionFormModal`, `MonthlySummaryFormModal`, `MonthNavigator`, `useFinanceDashboard`… | O "hoje" e o "mês atual" das Finanças vêm do relógio do navegador, e o back usa o fuso do negócio. Isso só diverge fora de Brasília ou na virada do dia. |

### Responsividade e revisão visual (09/11/2026, Chrome, app num iframe de 360px)

**Como foi feito:** com o usuário de teste `revisao.claude@lifemanager.test`, populado pela API com 6 meses de lançamentos, orçamento, recorrência, 5 hábitos e 2 recompensas.

**Telas vistas:** Home; Painel; Meses; Detalhe do mês (+ modal de lançamento); Orçamento; Recorrentes; Importar; Categorias; Hoje (+ momento de conquista); Hábitos; Detalhe do hábito; Desafios; Loja (3 abas); Conquistas; Ranking; Perfil; Histórico; menu radial.

**Resultado geral:** nenhuma tela estoura a largura (`scrollWidth` = largura visível em todas). Os modais viram bottom sheet, o FAB não cobre o fim das páginas, nenhum erro no console (só o websocket de HMR do Vite) e nenhum `role=alert`.

**Não visto, por falta de dado:** Revisar importação (precisa de um extrato), Ranking do grupo (precisa de um grupo com membros), estados de erro e tema escuro. Ficam para os roteiros manuais de cada spec.

| # | Gravidade | Onde | O quê |
|---|---|---|---|
| V1 | **Média (bug, visível em todo lugar)** | i18n pt-BR | **Plural com zero no singular:** "0 dia limpo" (Hoje), "0 semana" e "Recorde: 0 semana" (Detalhe do hábito), "0/66 dia". `Intl.PluralRules('pt-BR').select(0)` devolve `one` (é a regra do CLDR), e o i18next escolhe a chave `_one`. São **131 chaves `_one`** em pt-BR e só 4 têm `_zero`. |
| V2 | Média (360px) | Perfil, cartão de identidade | O nome fica cortado ("Revisão ...") porque divide a linha com o botão Editar, e "jogando desde novembro de 2026" quebra em 3 linhas numa coluna estreita. Em telas compactas, o cartão deveria empilhar (avatar em cima, nome na largura toda). |
| V3 | Média (UX celular) | Conquistas | A página tem **8.162px de altura** a 360px: os 31 cartões ficam um por linha. Proposta: famílias recolhíveis, ou um cartão compacto em 2 colunas no celular. |
| V4 | Baixa (texto) | Painel, "Orçamento do período" | O título "Categorias que mais estouraram" lista também categorias "Dentro do limite". Ou o título muda ("Categorias do orçamento"), ou a lista mostra só as que estouraram. |
| V5 | Baixa (UX) | Home | Só dois cartões numa tela vazia, no celular e no desktop. Confirma o M3. |
| V6 | Observação | Conquistas de Finanças | Uma conta nova ganhou "Poupador" (prata) e "Sobrou no fim do mês" na primeira visita, porque os meses passados contam. Lançar meses antigos (pela importação hoje, e à mão depois do M1) libera moedas e XP na hora. O ranking não usa essas moedas, então o risco é baixo. Registrado para decidir se as conquistas de Finanças devem contar só meses criados depois do cadastro. |

### Melhorias de funcionalidade (o que já existe e pode ficar melhor)

| # | Melhoria | Por quê |
|---|---|---|
| M1 | **Lançar sem criar o mês antes.** Um "Novo lançamento" que abre o mês sozinho (como já fazem a recorrência, a importação e o resgate com gasto) e liberar o ano anterior na criação manual. | Hoje é preciso criar o mês, entrar nele e só então lançar. Em janeiro, também não dá para criar dezembro à mão. |
| M2 | **Seletor de categoria pesquisável** (combobox com busca no back). | Resolve o P8 e fica melhor no celular do que um select longo. |
| M3 | **Home útil:** em vez de só dois cartões, um resumo do dia (hábitos pendentes, saldo do mês, fatia do orçamento mais perto do limite) com atalhos. | A Home é a primeira tela depois do login e hoje não mostra nada. |

### Novas funcionalidades (candidatas)

| # | Funcionalidade | Observação |
|---|---|---|
| N1 | **Minha conta:** editar nome, trocar senha estando logado, sair de todos os aparelhos, exportar meus dados e excluir a conta. | Hoje o back só tem `GET /api/Users/Me`. Exportar e excluir são direitos previstos na LGPD. |
| N2 | **PWA instalável:** manifest, ícones e service worker só para o shell. | O app é mobile-first, mas não se instala na tela inicial. É pré-requisito do N3. |
| N3 | **Lembretes de hábitos** (push). | Já está no backlog do módulo Hábitos e depende do N2. |
| N4 | **Objetivos de economia** ("Viagem: R$ 5.000 até dez/2027"), alimentados pelos lançamentos de investimento. | O orçamento cobre o mês, mas nada cobre metas de médio prazo. |
| N5 | **Exportar lançamentos** (CSV de um período). | Complementa a importação e o N1. |
| N6 | **Fuso horário por usuário.** | Está no backlog e resolve o P9 na raiz. |

## Mapa de capacidades (proposta)

| Module id | Responsabilidade | Repo(s) | Depende de | Tamanho |
|---|---|---|---|---|
| `review-fixes` | P1 + P2 + P4 + P5 + P6 + P7 + V1–V4: as correções da revisão, juntas (relógio no fuso do negócio, higiene dos testes, rotas sob demanda e metadados, zero no plural, ajustes de celular, ícone e animação do leme, CI nos PRs para a `dev`) | back + front | — | M |
| `integration-tests` | P3: projeto de testes com Testcontainers (Postgres real) cobrindo migrations, totais do mês, commit da importação e lock da carteira | back | `review-fixes` | M |
| `quick-transaction` | M1: lançar sem criar o mês antes e liberar o ano anterior | back + front | `review-fixes` | M |
| `category-picker` | M2/P8: combobox de categoria com busca | front | — | S |
| `home-overview` | M3: resumo do dia na Home | back (endpoint agregado) + front | — | M |
| `account-settings` | N1: Minha conta (nome, senha, sessões, exportar, excluir) | back + front | — | L |
| `pwa` | N2: manifest, ícones, service worker do shell, CSP revisada | front | `review-fixes` | S |
| `habit-reminders` | N3: push de lembretes | back + front | `pwa` | L |
| `savings-goals` | N4: objetivos de economia | back + front | — | L |
| `transactions-export` | N5: CSV de um período | back + front | — | S |

**Ordem de execução:** `review-fixes` → `integration-tests` → `quick-transaction`, `category-picker` → `home-overview` → `account-settings` → `pwa` → `habit-reminders` / `savings-goals` / `transactions-export` (à escolha).

`N6` (fuso por usuário) fica fora do mapa por enquanto: ele mexe no `AppClock` de todos os fluxos e merece uma decisão própria.

## Specs

Cada spec fica em `docs/specs/` do repo onde está o trabalho. Um módulo que mexe nos dois repos tem **um spec em cada um**, com o mesmo id e a mesma branch:
- o do back traz o **contrato da API**;
- o do front traz a tela e aponta para o do back.

A exceção foi o `review-fixes`: um spec só, no front, que juntou as correções dos dois repos.

| Ordem | Módulo | Back (`LifeManager/docs/specs/`) | Front (`LifeManagerFront/docs/specs/`) | Branch (a partir da `dev`) | Status |
|---|---|---|---|---|---|
| 1 | `review-fixes` | — | — (removido) | `fix/review-fixes` (nos dois repos) | **mergeado na `dev`** em 10/11/2026 (PRs RafaelMF16/LifeManager#41 e RafaelMF16/LifeManagerFront#39) |
| 2 | `integration-tests` | — (removido) | — | `test/integration-tests` | **mergeado na `dev`** em 10/11/2026 (PR RafaelMF16/LifeManager#43) |
| 3 | `quick-transaction` | — (removido) | — (removido) | `feature/quick-transaction` | **mergeado na `dev`** em 10/11/2026 (PRs RafaelMF16/LifeManager#45 e RafaelMF16/LifeManagerFront#43) |
| 3 | `category-picker` | — | — (removido) | `feature/category-picker` | **mergeado na `dev`** em 10/11/2026 (PR RafaelMF16/LifeManagerFront#42) |
| 4 | `home-overview` | [home-overview](../../../LifeManager/docs/specs/home-overview.md) | [home-overview](home-overview.md) | `feature/home-overview` | aprovado |
| 5 | `account-settings` | [account-settings](../../../LifeManager/docs/specs/account-settings.md) | [account-settings](account-settings.md) | `feature/account-settings` | aprovado |
| 6 | `pwa` | — | [pwa](pwa.md) | `feature/pwa` | aprovado |
| 7 | `habit-reminders` | [habit-reminders](../../../LifeManager/docs/specs/habit-reminders.md) | [habit-reminders](habit-reminders.md) | `feature/habit-reminders` | aprovado · dependência em discussão |
| 7 | `savings-goals` | [savings-goals](../../../LifeManager/docs/specs/savings-goals.md) | [savings-goals](savings-goals.md) | `feature/savings-goals` | aprovado |
| 7 | `transactions-export` | [transactions-export](../../../LifeManager/docs/specs/transactions-export.md) | [transactions-export](transactions-export.md) | `feature/transactions-export` | aprovado |

São **10 módulos e 17 branches**: 8 no back e 9 no front.

**Spec implementado e mergeado na `dev` sai da pasta.** O histórico fica no git, e as regras passam para o `CLAUDE.md` e as docs. Os specs de loadings (`splash`, `auth-entrance`, `skeleton` e o mapa `loadings`), implementados no PR #38, já saíram. Também saíram o `review-fixes` (PRs #41 do back e #39 do front) o `integration-tests` (PR #43 do back), o `category-picker` (PR #42 do front) e o `quick-transaction` (PRs #45 do back e #43 do front).

## Comandos

```
# back (LifeManager/)
dotnet build LifeManager.slnx
dotnet test LifeManager.slnx
dotnet ef migrations list --project LifeManager.Infrastructure --startup-project LifeManager.WebApi
dotnet ef database update --project LifeManager.Infrastructure --startup-project LifeManager.WebApi

# front (LifeManagerFront/)
npm run build      # tsc -b + vite build (olhar o tamanho dos chunks)
npm run lint
npm test
```

Os servidores de desenvolvimento (`npm run dev`, `dotnet run`) são iniciados pelo usuário.

## Estrutura do projeto

Segue a de cada repo, descrita nos dois `CLAUDE.md`: camadas por feature no back; módulos `auth/`, `finance/`, `habits/`, `home/` e `shared/` no front, mais `account/` com o `account-settings`.

- **Specs:** em `docs/specs/<id>.md` de cada repo (ver "Specs").
- **Plano e tarefas da vez:** em `tasks/plan.md` + `tasks/todo.md` do repo, ignorados pelo git.

## Estilo de código

O que já está nos `CLAUDE.md` continua valendo:
- Back: Result pattern, async com `CancellationToken`, VOs, testes `Method_ShouldX_WhenY` com mocks escritos à mão.
- Front: i18n desde o primeiro texto, 360px, `Dialog` para modais, listagens paginadas no back, skeleton só no primeiro carregamento.

Exemplo da correção do P1 (o padrão é este):

```csharp
// MonthlySummaryService: o ano vem do relógio do negócio, não do UTC
var monthlySummaryResult = MonthlySummary.Create(userId.Value, dto.Month, _appClock.Today().Year);

// MonthlySummaryYear: recebe o ano corrente em vez de ler o relógio
public static Result<MonthlySummaryYear> Create(int value, int currentYear) { ... }
```

## Estratégia de testes

- **Back:** cada regra nova ou corrigida ganha um teste de domínio ou de serviço (o P1 ganha um teste com `FakeTimeProvider.SetToday` em 31/12 às 22h de Brasília). O `integration-tests` adiciona uma camada com Postgres real, sem substituir os mocks.
- **Front:** os utils puros novos ganham testes Vitest. A verificação visual é manual, pelo usuário, a 360px, e cada spec traz o roteiro.
- **Portão de toda tarefa:** back `dotnet build` + `dotnet test` sem warnings novos; front `npm test`, `npm run lint` e `npm run build`.

## Limites

- **Sempre:** atualizar `docs/regras-de-negocio.md` (regra ou código de erro novo), `docs/fluxo-de-telas.md` (tela ou botão novo) e o tour da tela; i18n pt-BR e en-US; migrations aditivas (expand/contract).
- **Perguntar antes:** mudança de schema, dependência nova (Testcontainers, `vite-plugin-pwa`, combobox), mudança na CSP do `firebase.json`, qualquer regra de negócio que mude o comportamento atual (ex.: liberar o ano anterior).
- **Nunca:** subir dev server, commitar ou abrir PR sem o OK, apagar ou pular teste para ficar verde, renomear códigos de erro existentes.

## Critérios de sucesso

- Este mapa aprovado (com cortes ou acréscimos) e a ordem de execução confirmada.
- Cada módulo aprovado tem o próprio `docs/specs/<id>.md` com critérios testáveis antes de qualquer código.
- Ao final das correções rápidas: 0 warnings no `dotnet build`, o chunk inicial do front abaixo de 500 kB (o aviso do Vite some) e a aba com o nome do app.

## Decisões (09/11/2026)

- **Mapa aprovado** sem cortes, na ordem proposta.
- **Verificação visual:** sim, no Chrome, com um usuário de teste criado por mim (`revisao.claude@lifemanager.test`), cadastrado pelo fluxo real de definir senha.
- **M1:** liberar a criação manual de meses do **ano anterior**.
- **N1:** a exclusão de conta tem **prazo de arrependimento**. Entrar de novo dentro do prazo cancela; passado o prazo, a conta é apagada de vez.
- **Git:** uma branch por funcionalidade ou correção, criada a partir da `dev`. A `dev` não existia em nenhum dos dois repos e foi criada localmente a partir da `main` (`5b21345` no back, `fb5fd91` no front). Os PRs vão para a `dev`.
  - Nomes: `fix/review-fixes` (as correções), `test/integration-tests` e `feature/<id>` para as funcionalidades.

- **Specs** organizados em `docs/specs/` de cada repo. Os de loadings, já implementados, foram removidos.
- **Módulos acrescentados ao mapa depois da revisão visual:** `pt-plurals` e `mobile-polish`.
- **Os specs foram aprovados**, com estas decisões:
  - prazo de exclusão de **7 dias**;
  - lembrete de hábito em **hora cheia**, com o agendador atual;
  - usar o dinheiro de um objetivo **não** baixa o objetivo neste módulo.
- **Commits dos specs:** branch `docs/specs` a partir da `dev`, em cada repo.
- **Pipeline:** os testes com banco (Testcontainers) entram no pipeline, e um workflow `ci.yml` novo roda os testes de cada repo em todo PR para a `dev` (e a `main`). Fica no `review-fixes`.
- **PWA aprovado**, com o `vite-plugin-pwa` e o ajuste da CSP.
- **Ícone:** a roda das áreas da vida (quatro fatias, Finanças e Hábitos com os seus ícones) substitui o ícone padrão do Vite (favicon e `apple-touch-icon`), a partir de `public/favicon.svg`. Fica no `review-fixes`, e o `pwa` gera os seus ícones do mesmo SVG.
- **`integration-tests` (10/11/2026):** o teste da cascata da exclusão do usuário achou um bug. As quatro FKs `NO ACTION` (`HabitCheckIns`/`HabitProgressEntries.UserId` e `Transactions`/`RecurringTransactions.CategoryId`) travavam o `DELETE` do usuário, porque o Postgres checa o `NO ACTION` no fim de cada cascata. A correção entrou no mesmo PR: a migration `MakeUserDeletionForeignKeysDeferrable` as deixa `DEFERRABLE INITIALLY DEFERRED`. Isso destrava a exclusão definitiva do `account-settings`.
- **Ícone e animação (10/11/2026):** o leme substitui a roda na logo e nos ícones, e a carteira nas animações de carregamento (em pixel art, com moedas chegando no lugar das notas). A carteira dava a ideia de app de finanças, e o leme fala de controle da vida.
- **As cinco correções viraram um módulo só:** `clock-fixes`, `test-hygiene`, `front-shell`, `pt-plurals` e `mobile-polish` agora são o `review-fixes`, com um spec só (`review-fixes.md`, já removido) e uma branch só, `fix/review-fixes`, a partir da `dev`, com o mesmo nome nos dois repos.

## Perguntas em aberto

1. **V6:** as conquistas de Finanças devem contar só meses criados depois do cadastro? Fora de todos os módulos até haver decisão.
2. **Dependência ainda em discussão:** o `habit-reminders` só começa depois dessa conversa.
   - `WebPush` (NuGet) e as chaves VAPID no deploy (`habit-reminders`).
