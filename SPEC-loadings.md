# Mapa de capacidades: Loadings e animações de entrada

Hoje o app indica carregamento de três formas fracas:

- **Tela em branco** no `ProtectedRoute` (`return null`) enquanto o `restoreSession()` tenta o cookie de refresh, num reload ou numa aba nova.
- **Textos "Carregando…"** soltos em cerca de 18 listas e páginas.
- **Troca seca** da tela de login para a Home. Hoje o único retorno é o toast "login.successToast".

**Objetivo:** o usuário nunca vê uma tela vazia sem contexto. Os conteúdos com layout conhecido aparecem como um esqueleto do que vai chegar. O login vira um momento com identidade (a carteira em pixel art).

## Módulos

| Id | Responsabilidade | Depende de | Spec |
|---|---|---|---|
| `splash` | Sprite da carteira (`WalletSprite`), splash de sessão no `ProtectedRoute` e transição pós-login | — | `SPEC-splash.md` |
| `auth-entrance` | Entrada da tela `/auth`: véu escuro que clareia e componentes chegando em sequência | — | `SPEC-auth-entrance.md` |
| `skeleton` | Primitivos `Skeleton`/`SkeletonGroup` e troca dos "Carregando…" por esqueletos fiéis ao layout | — | `SPEC-skeleton.md` |

**Ordem de build:** `splash` → `auth-entrance` → `skeleton`.

Os módulos não dependem uns dos outros. A ordem segue o valor percebido: o `splash` tira a tela branca e o `skeleton` é o maior em arquivos tocados. Tudo vai numa **única branch e num único PR** (`feature/loadings`), com commits separados por módulo e por fatia.

## Decisões (respondidas em 2026-11-06)

1. **Momentos da carteira:** o `splash_loop` aparece durante o `restoreSession`. O `feedback_receita` toca uma vez após o login bem-sucedido e se dissolve na Home.
2. **Duração pós-login:** encurtada para cerca de 1,6s (o original tem 2,9s).
3. **Variante do sprite:** `colorido`, com o contorno escuro, nos dois temas.
4. **Tela de login:** fade de um véu quase preto para a página normal (como luzes acendendo), igual nos dois temas.

## Regras transversais (valem para os três módulos)

- **Sem dependência nova.** Animação em CSS, ou na Web Animations API (nativa) quando precisar de timing por frame ou de um evento de fim.
- **Movimento reduzido:** toda animação respeita `prefers-reduced-motion`, como já faz o resto do app. O comportamento de cada módulo sem movimento está definido no spec dele.
- **Tokens:** as durações e curvas vêm de `shared/styles/tokens/motion.css`. Os tokens novos são adicionados lá.
- **i18n:** todo texto novo entra em `pt-BR` e `en-US` no mesmo PR.
- **Mobile-first:** tudo é verificado a 360px de largura.
- **Docs:** `docs/fluxo-de-telas.md` é atualizado sempre que um fluxo visível mudar (login, reload, telas de lista).
