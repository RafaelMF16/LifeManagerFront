# Spec: `mobile-polish`

Módulo do mapa [`README.md`](README.md) (V2 + V3 + V4). Branch `fix/mobile-polish`, a partir da `dev`. Só front.

## Objetivo

Corrigir os três pontos que a revisão visual a 360px encontrou.

## Escopo

### V2: Perfil, cartão de identidade

- **Hoje:** o nome divide a linha com o botão "Editar" e fica cortado ("Revisão ..."). "Jogando desde novembro de 2026" quebra em 3 linhas.
- **Em ≤ 768px**, o `.lm-profile-identity` vira uma coluna:
  1. o avatar (`lg`) e o botão "Editar" na mesma linha, o botão à direita;
  2. o nome na largura toda, com quebra de linha permitida (`overflow-wrap: anywhere`), sem reticências;
  3. o título e "jogando desde" em uma linha cada.
- No desktop, nada muda.

### V3: Conquistas com 8.162px de altura

- **Hoje:** são 31 cartões, um por linha, em 9 famílias.
- **Famílias recolhíveis.** Cada família vira um `<details>` nativo, com o `<summary>` como cabeçalho: ícone, nome, "3 de 5" e as medalhas obtidas em pontinhos. É acessível sem JS extra.
  - **≤ 768px:** todas começam fechadas, menos as que têm uma conquista desbloqueada **ainda não vista** ou a família da primeira conquista de "Quase lá".
  - **Desktop:** todas começam abertas.
- O bloco "Quase lá" continua no topo, como hoje.
- O estado aberto/fechado não é guardado: a página abre sempre do mesmo jeito.
- O skeleton (`AchievementCardSkeleton`) passa a imitar os cabeçalhos fechados no celular, para a página não pular quando os dados chegam.
- **Meta:** com tudo fechado, a página fica com **≤ 2.000px** a 360px.

### V4: Painel, "Categorias que mais estouraram"

- **Hoje:** o título promete as categorias estouradas, mas a lista mostra as 5 primeiras por `gap`, inclusive as que estão dentro do limite.
- **Correção:** `DashboardBudgets` mostra só as categorias com `gap > 0`. A lista tem no máximo 5 itens, que já vêm do back, então filtrar no front aqui não é "baixar tudo para filtrar".
- **Sem nenhuma estourada:** uma linha positiva, com a chave nova `dashboard.budgets.noOverspent` ("Nenhuma categoria passou do limite no período").
- O título continua igual.

## Critérios de aceite

- A 360px, o nome "Revisão Claude" aparece inteiro no Perfil.
- Conquistas: `document.documentElement.scrollHeight` ≤ 2.000px a 360px com o usuário de teste, e é possível abrir e fechar cada família pelo teclado (Enter/Espaço no `summary`).
- Painel: só aparecem categorias com um valor acima da meta, ou a mensagem nova.
- Nenhuma tela ganha rolagem horizontal.
- Os tours continuam achando os alvos. Se o alvo de um passo de Conquistas ficar dentro de um `<details>` fechado, o passo aponta para o `summary` da família.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:** a regra de "quais famílias começam abertas" vira uma função pura em `habits/utils/achievements.ts` (`initiallyOpenFamilies(achievements, near, isCompact)`), com testes.
- **Manual (usuário, a 360px):** Perfil, Conquistas (abrir e fechar), Painel (com e sem categoria estourada) e os dois temas.

## Docs

`docs/fluxo-de-telas.md` (Conquistas: famílias recolhíveis; Painel: o texto do card) e o tour de Conquistas, se o alvo mudar.

## Arquivos

`habits/pages/ProfilePage.tsx` + CSS, `habits/components/AchievementGrid/*`, `habits/utils/achievements.ts` (+ teste), `finance/components/DashboardBudgets/*`, `finance/locales/{pt-BR,en-US}.ts`, `habits/utils/habitsTours.ts` (se preciso) e `docs/fluxo-de-telas.md`.
