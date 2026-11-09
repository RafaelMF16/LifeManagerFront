# Spec: `review-fixes` (correções da revisão)

Módulo do mapa [`README.md`](README.md). Junta as cinco correções da revisão de novembro, que antes eram specs separados (`clock-fixes`, `test-hygiene`, `front-shell`, `pt-plurals` e `mobile-polish`). Cobre P1, P2, P4, P5, P6, P7 e V1–V4.

**Branch:** `fix/review-fixes`, a partir da `dev`, **nos dois repos**.
- O git não tem branch entre repositórios, então é o mesmo nome no back e no front.
- Cada correção tem o seu commit (ou commits).
- Um PR por repo, para a `dev`.

## Objetivo

Tirar os bugs e o ruído que a revisão encontrou antes de começar as funcionalidades novas:
- o ano errado na virada do ano;
- leituras de relógio que os testes não alcançam;
- warnings escondendo warnings;
- 1 MB de JS no primeiro acesso;
- "0 dia" no lugar de "0 dias";
- três telas que não ficam bem no celular;
- o ícone padrão do Vite;
- PRs para a `dev` sem nenhum teste automático.

Nenhuma regra de negócio muda e nenhuma migration é criada.

---

## Parte back (`LifeManager`)

### 1. Relógio no fuso do negócio (P1 + P2)

**Bug:** o ano de um mês novo vem de `DateTimeOffset.UtcNow.Year`, em dois lugares:
- `MonthlySummaryService.CreateAsync` passa o ano;
- `MonthlySummaryYear.Create` valida contra ele.

Em 31/12, das 21h à meia-noite de Brasília, criar "Dezembro" cria **dezembro do ano seguinte**.

**Correção:**
- `MonthlySummaryYear.Create(int value, int currentYear)` compara com o parâmetro, sem ler o relógio. `MonthlySummary.Create(idUser, month, year, currentYear)` repassa o valor.
- `MonthlySummaryService` recebe o `AppClock` e usa `_appClock.Today().Year` como ano do mês **e** como ano corrente.
- `TokenService` recebe o `TimeProvider`. Os três `UtcNow` (linhas 72, 122 e 155) passam a usar `_timeProvider.GetUtcNow()`, e o `Expires` do JWT sai do mesmo `now`.
- `RefreshToken.CreatedAt` e `User.CreationDate` perdem o inicializador `= DateTimeOffset.UtcNow`.
  - As duas colunas são persistidas (`RefreshTokenConfiguration`, `UserConfiguration`).
  - O valor passa a ser um parâmetro do factory (`createdAt`), que o `TokenService` e o `RegistrationService` preenchem com o `TimeProvider`.
  - **Sem migration:** nenhuma coluna muda.

**Aceite:**
- Com o `FakeTimeProvider` em **31/12/2026 às 22h de Brasília** (01/01/2027 01:00 UTC), `POST MonthlySummaries { month: 12 }` cria **dezembro de 2026**.
- Em 01/01/2027 às 10h de Brasília (13:00 UTC), criar dezembro cria **dezembro de 2027**: o ano vem sempre de "hoje" no fuso do negócio, e o ano anterior só é liberado no `quick-transaction`.
- `grep -rn "UtcNow\|DateTime.Now" LifeManager.Application LifeManager.Domain` só encontra `_timeProvider.GetUtcNow()` e o `AppClock`.
- Os códigos de erro e as respostas da API não mudam.

**Testes:**
- `MonthlySummaryYearTests` passa a usar `currentYear` explícito.
- `MonthlySummaryServiceTest` ganha os dois casos de virada de ano. O `FakeTimeProvider` ganha `SetUtcNow(DateTimeOffset)`, porque o `SetToday` atual sempre põe meio-dia.
- `TokenServiceTest`: avançar o relógio além de 7 dias invalida o refresh.
- Os testes de `User`/`RefreshToken` passam a data de criação.

### 2. Higiene dos testes (P4 + P5)

- **Apagar `LifeManager.Tests/`:** é só um `.csproj` de scaffold, fora do `.slnx`. A nota sobre ele sai do `CLAUDE.md`.
- **Zerar os 61 `CS8602`** de `LifeManager.Application.Test`:
  - estão em `HabitStatsServiceTest`, `HabitServiceTest`, `RewardServiceTest`, `RewardRedemptionServiceTest` e `StatementImportServiceTest`;
  - a correção é afirmar antes de usar (`Assert.NotNull(result.Value)`, ou `result.Value!` depois de `Assert.True(result.IsSuccess)`), no padrão que já existe;
  - **nada de `#pragma`/`NoWarn`.**
- **Travar o portão:** `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` só nos dois projetos de teste, para um warning de pacote não quebrar o build de produção.

**Aceite:**
- `dotnet build LifeManager.slnx` com **0 Warning(s)**.
- `dotnet test` com os mesmos 2.019 testes (mais os novos da seção 1), sem nenhum removido, pulado ou enfraquecido.

---

## Parte front (`LifeManagerFront`)

### 3. Carregamento sob demanda e metadados (P6 + P7)

**Hoje:** `App.tsx` importa as 30 páginas de forma estática, num JS de **1.077 kB (297 kB gzip)**.

**Rotas `lazy`:** cada página e layout de módulo passa para o `lazy` de rota do React Router, por exemplo:

```tsx
<Route path="dashboard" lazy={() => import('./finance/pages/DashboardPage').then((m) => ({ Component: m.default }))} />
```

- Ficam estáticos só o `RootLayout`, `ProtectedRoute`, `PublicOnlyRoute` e os providers.
- O router baixa o módulo **antes** de trocar de tela, então a tela atual fica visível durante a navegação: sem flash e sem `Suspense` novo.
- **Carga inicial:** `hydrateFallbackElement={<SplashScreen />}` na rota raiz.
- **Chunk que falha** (deploy novo com um hash antigo em cache): um `errorElement` na raiz (`shared/components/RouteError/`) recarrega a página **uma vez**. A marca fica em `sessionStorage`, com try/catch, e a decisão é a função pura `shared/utils/chunkReload.ts`, `shouldReloadOnce(error, storage)`. Na segunda falha, mostra uma mensagem traduzida com o botão "Recarregar".

**`index.html`:**
- `<title>LifeManager</title>`;
- `meta description`;
- `theme-color` claro e escuro (`media="(prefers-color-scheme: …)"`, a partir dos tokens de fundo);
- o `lang` inicial não muda, porque o `i18n.ts` já o corrige em tempo de execução.

**Ícone do app: a roda das áreas da vida, no lugar do raio do Vite.**
- **Desenho** (escolhido pelo usuário em 09/11/2026, opção "Quatro fatias, duas com módulo"): um anel em **quatro fatias iguais**, uma por área da vida, separadas por um vão de 9°.
  - Finanças (fatia da esquerda, teal 700) leva o ícone `wallet` do lucide, e Hábitos (fatia da direita, teal 600) leva o `check`, os mesmos ícones da Home, em branco.
  - As duas fatias claras (teal 200 e 300) ficam vazias, à espera dos próximos módulos. Um módulo novo ganha o seu ícone numa delas.
  - Só tons de teal da marca: verde, vermelho e roxo ficam de fora, porque o app os reserva para valores.
  - O mesmo desenho vale em todos os tamanhos. Em 16 e 32px os ícones dos módulos não se leem, mas a roda continua reconhecível.
- **Fonte:** `public/favicon.svg`, com o desenho em SVG (viewBox 100). Ele também é o favicon dos navegadores que aceitam SVG.
- **Arquivos gerados** a partir do SVG, renderizado pelo Edge (ou Chrome) headless:

| Arquivo | Tamanho | Como |
|---|---|---|
| `public/favicon.png` | 64×64 | a roda, com fundo transparente |
| `public/favicon-32.png` | 32×32 | a roda, com fundo transparente, para aba e favoritos |
| `public/apple-touch-icon.png` | 180×180 | a roda em 144px, centralizada num fundo branco (`--surface` clara). O iOS pinta de preto o que for transparente, então nada de transparência aqui. |

- **No `index.html`:** `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`, os PNGs de 64 e 32 e `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
- **Sai o resto do template do Vite:** `public/icons.svg` (ícones de Bluesky, Discord e GitHub, que nada usa). O `favicon.svg` do Vite (o raio roxo) dá lugar ao da roda.
- **Como gerar:** `scripts/generate-icons.ps1` gera os PNGs uma vez, e eles são commitados, sem passo novo no build. Se o SVG mudar, roda de novo.
- O `pwa` gera do mesmo SVG os ícones de 192 e 512.
- **Na tela:** o `shared/components/AppLogo/` desenha a mesma roda em SVG inline, com as cores dos tokens teal, ao lado do nome "LifeManager" no `Header` (24px) e no topo das telas de login e cadastro (`AuthLayout`, 28px), no lugar do ícone da carteira.
- A animação de carregamento (splash e transição do login) continua com a carteira.

**Aceite:**
- `npm run build` **sem** o aviso "chunks larger than 500 kB".
- Chunk de entrada **≤ 300 kB** minificado, com o antes e o depois no PR. Finanças e Hábitos em chunks próprios.
- Navegar não mostra tela branca, e um reload em `/finance/dashboard` mostra o splash e depois a tela.
- O "sair sem salvar?" do orçamento (`useBlocker`) continua funcionando.
- A aba mostra "LifeManager" com a roda.
- No iPhone, "Adicionar à Tela de Início" mostra a roda nítida, sem borda preta.
- Nada no repo aponta para `icons.svg`.

### 4. Zero no plural em pt-BR (V1)

**Causa:** em pt-BR, as regras de plural do navegador (`Intl.PluralRules`, padrão CLDR) tratam o 0 como singular (`one`), então o i18next escolhe a chave `_one` para `count: 0`. São 131 chaves `_one` e só 4 `_zero`.

**Correção:** a função pura `src/i18n/withZeroPlurals.ts`:
- para cada `key_one` com `key_other` e sem `key_zero`, cria `key_zero` igual a `key_other`;
- é recursiva e não muta a entrada;
- mantém os `_zero` que já existem (os 4 da importação).

O `i18n.ts` aplica a função só aos namespaces pt-BR.

**Aceite:**
- Aparecem "0 dias limpos", "0 semanas", "Recorde: 0 semanas" e "0/66 dias".
- `count: 1` continua no singular e `count: 2` no plural.
- As 4 chaves `_zero` da importação mantêm o texto delas.

**Testes:**
- `withZeroPlurals.test.ts`:
  - adiciona `_zero` a partir de `_other`;
  - mantém um `_zero` existente;
  - percorre objetos aninhados;
  - ignora `_one` sem `_other`;
  - não muta a entrada.
- `i18n.plurals.test.ts` percorre **todas** as chaves `_one` dos namespaces pt-BR e confere que `count: 0` não devolve o texto de `_one`. Esse teste pega qualquer chave nova que esqueça o caso.

### 5. Ajustes de celular (V2 + V3 + V4)

- **Perfil (V2):**
  - em ≤ 768px, o cartão de identidade empilha: avatar e "Editar" numa linha; o nome na largura toda, quebrando a linha se preciso, sem reticências; o título e "jogando desde" em uma linha cada.
  - No desktop, nada muda.
- **Conquistas (V3):**
  - cada família vira um `<details>` nativo; o `<summary>` mostra ícone, nome, "3 de 5" e as medalhas;
  - **no celular**, todas começam fechadas, menos as que têm desbloqueio não visto e a família da primeira conquista de "Quase lá"; **no desktop**, todas abertas;
  - a regra é a função pura `initiallyOpenFamilies(achievements, near, isCompact)`, em `habits/utils/achievements.ts`, com testes;
  - o skeleton imita os cabeçalhos fechados no celular;
  - um passo de tour cujo alvo fique dentro de um `<details>` fechado passa a apontar para o `summary`.
- **Painel (V4):**
  - `DashboardBudgets` mostra só as categorias com `gap > 0`, num máximo de 5 itens, que já vêm do back;
  - sem nenhuma estourada, mostra a linha "Nenhuma categoria passou do limite no período" (chave nova `dashboard.budgets.noOverspent`).

**Aceite:**
- A 360px, o nome "Revisão Claude" aparece inteiro no Perfil.
- A página de Conquistas tem **≤ 2.000px** com tudo fechado, e cada família abre e fecha pelo teclado.
- O Painel mostra só categorias acima da meta, ou a mensagem nova.
- Nenhuma tela ganha rolagem horizontal.

---

## Os dois repos

### 6. Testes em todo PR para a `dev` (CI)

**Hoje** os testes só rodam no `deploy.yml`, em push na `main`. Um PR para a `dev` entra sem nenhuma verificação, e um erro só aparece na hora do deploy.

Um workflow novo, **`.github/workflows/ci.yml`, em cada repo:**
- **Gatilho:** `pull_request` para `dev` e `main`, e `workflow_dispatch`.
- **Permissões:** `permissions: contents: read`. Nenhum segredo, porque testes não publicam nada.
- **Concorrência:** `group: ci-${{ github.ref }}` com `cancel-in-progress: true`. Um push novo no PR cancela a execução antiga.
- **Back:** `actions/setup-dotnet` (10.0.x) e `dotnet test LifeManager.slnx`.
  - Com o `integration-tests`, isso inclui os testes com Postgres real. O runner `ubuntu-latest` já tem Docker, então nada muda no workflow.
- **Front:** Node do `.nvmrc`, `npm ci`, `npm run lint`, `npm test` e `npm run build`, os mesmos passos de verificação do `deploy.yml`.
- **`timeout-minutes: 15`**, como no deploy.
- **Quem trava o merge:** para um PR com teste vermelho **não poder** ser mergeado, é preciso uma regra de proteção da `dev` (e da `main`) no GitHub exigindo o check `CI`. Isso é uma configuração da conta. **O usuário faz em Settings → Branches**, e o PR explica o passo.

**Aceite:**
- O PR do próprio `review-fixes` para a `dev` já mostra o check `CI` rodando e verde, nos dois repos. O workflow vale no PR que o cria.
- Um commit de teste com um teste quebrado deixa o check vermelho. Isso é conferido uma vez e descrito no PR.

**Docs:** `docs/deploy.md` do back, na seção "Deploy automático (GitHub Actions)", ganha o `ci.yml` e a regra de proteção. Os dois `CLAUDE.md` citam o workflow.

---

## Ordem dos commits

- **Back:** CI → `test-hygiene` → relógio.
  - Com o CI primeiro, o resto já passa por ele.
  - Com o portão de warnings ligado antes do relógio, o relógio já nasce sem warnings.
- **Front:** CI → plural → celular → carregamento sob demanda com o ícone. O último mexe no `App.tsx` inteiro, e ir por último evita conflito com o resto.

## Portão (cada commit)

- **Back:** `dotnet build LifeManager.slnx` com 0 warnings e `dotnet test LifeManager.slnx` verde.
- **Front:** `npm test`, `npm run lint` e `npm run build`.

## Roteiro manual (usuário, a 360px, com o usuário de teste)

1. **Hoje / Detalhe do hábito:** os textos com zero no plural.
2. **Perfil:** o nome inteiro.
3. **Conquistas:** a altura, e abrir e fechar as famílias.
4. **Painel:** o card do orçamento.
5. **DevTools em Slow 4G:**
   - abrir `/auth` e conferir que os chunks de Finanças e Hábitos **não** baixaram;
   - entrar e navegar Home → Finanças → Hábitos;
   - dar reload numa tela interna;
   - alterar o orçamento e tentar sair.
6. A aba mostra "LifeManager" com a carteira, e o tema escuro funciona nas telas mexidas.
7. No iPhone, "Adicionar à Tela de Início" mostra a carteira.
8. No GitHub, o PR mostra o check `CI` verde. Depois disso, o usuário cria a regra de proteção da `dev`.

## Docs

- **Back `CLAUDE.md`:**
  - MonthlySummaries: "current UTC year" → "current year in the business time zone (`AppClock`)";
  - sai a nota do `LifeManager.Tests`;
  - Testing: o `SetUtcNow` e o `TreatWarningsAsErrors`.
- **Back `docs/regras-de-negocio.md`:** nada muda, porque a regra já diz "ano corrente no fuso do negócio".
- **Front `CLAUDE.md`:**
  - Architecture notes: o roteamento `lazy` e o `errorElement`;
  - i18n: uma linha sobre o zero em pt-BR.
- **Front `docs/fluxo-de-telas.md`:** Conquistas recolhíveis e o texto do card do Painel.

## Fora do escopo

Liberar o ano anterior (`quick-transaction`), o relógio do navegador no front (P9/N6), o service worker e o manifest (`pwa`), e testes com Postgres real (`integration-tests`).
