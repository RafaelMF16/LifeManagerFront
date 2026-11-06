# Spec: `auth-entrance` (entrada da tela de login)

Módulo do mapa `SPEC-loadings.md`.

## Objetivo

Quando a tela `/auth` abre, ela começa **quase escura e clareia** (como luzes acendendo), enquanto os componentes **chegam em sequência**: o cabeçalho desce e o cartão do formulário sobe em cascata. A primeira impressão do app fica viva sem custar tempo nem interação ao usuário.

## Comportamento

### Véu (escuro → claro)

- Um pseudo-elemento `::before` em `.lm-auth-page` cobre a tela inteira (`position: fixed; inset: 0`). Ele tem `pointer-events: none` e fica por cima do conteúdo.
- Começa em `rgb(2 6 23 / 0.88)` (`--slate-950` a 88%) e vai a opacidade 0 em **600ms** com `--ease-out`.
- É igual nos dois temas. No tema escuro o efeito sai mais sutil, como esperado.

### Componentes chegando (cascata)

| Ordem | Elemento | Movimento |
|---|---|---|
| 0 | Cabeçalho (marca, idioma, tema) | desce de `-8px` + fade |
| 1 | Barra das abas Entrar/Criar conta | sobe de `16px` + fade |
| 2 | Título e subtítulo do formulário | sobe de `16px` + fade |
| 3 | Campos (e-mail e senha) | sobe de `16px` + fade |
| 4 | Botão "Entrar" e "Esqueci a senha" | sobe de `16px` + fade |
| 5 | Rodapé "Não tem conta? Criar conta" | fade |

- Cada item dura **420ms** com `--ease-out` e começa **70ms** depois do anterior.
- Tudo termina em cerca de **770ms**, com o véu correndo em paralelo.
- Em CSS puro: cada item recebe `--enter-index` (inline style). O atraso é `calc(var(--enter-index) * var(--stagger-step))`, com `animation-fill-mode: both`.

### Regras

- **Interação liberada desde o primeiro frame.** Clique, foco, digitação e autofill do navegador funcionam durante a animação: nada usa `pointer-events: none` nos campos e nada atrasa a montagem.
- **Toca só na montagem do `AuthPage`.** Isso cobre a primeira visita, o logout e o redirecionamento por sessão expirada. A troca entre Entrar e Criar conta (o carrossel do `AuthTabs`), a troca de tema e a troca de idioma **não** repetem a animação.
- A cascata vale para o painel que estiver ativo. O painel de cadastro, fora da tela, não precisa animar.
- **Movimento reduzido:** sem véu e sem deslocamento. A página aparece normalmente, como hoje.

## Design técnico

- **`AuthPage.css`:** o véu (`::before` + `@keyframes lm-auth-veil`) e a regra genérica `.lm-auth-page [data-enter]` com `@keyframes lm-auth-rise` e `lm-auth-drop`. Tudo dentro de `@media (prefers-reduced-motion: no-preference)`.
- **`AuthPage.tsx`, `AuthTabs.tsx`, `LoginForm.tsx` e `RegisterForm.tsx`:** só recebem `data-enter` e `style={{ '--enter-index': n }}` nos blocos da tabela. Nenhuma lógica nova, nenhum estado.
- **`motion.css`, tokens novos:** `--duration-reveal: 600ms`, `--duration-enter: 420ms`, `--stagger-step: 70ms`.
- **Tipagem:** se `'--enter-index'` em `style` acusar erro no TS, usar um cast local (`as CSSProperties`) ou declarar a propriedade custom. Nunca usar `@ts-ignore`.

```css
@media (prefers-reduced-motion: no-preference) {
  .lm-auth-page::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: rgb(2 6 23 / 0.88);
    animation: lm-auth-veil var(--duration-reveal) var(--ease-out) both;
  }

  .lm-auth-page [data-enter] {
    animation: lm-auth-rise var(--duration-enter) var(--ease-out) both;
    animation-delay: calc(var(--enter-index, 0) * var(--stagger-step));
  }

  .lm-auth-page [data-enter='drop'] {
    animation-name: lm-auth-drop;
  }
}

@keyframes lm-auth-veil {
  to { opacity: 0; }
}
@keyframes lm-auth-rise {
  from { opacity: 0; transform: translateY(16px); }
}
@keyframes lm-auth-drop {
  from { opacity: 0; transform: translateY(-8px); }
}
```

**Cuidado com o `AuthTabs`:** a altura do viewport dele é medida no JS (`style={{ height }}`) e o carrossel usa `transform`. O `data-enter` vai nos **filhos** do painel, nunca no `__track`, para não brigar com o `translateX` do carrossel.

## Comandos

```
npm run lint
npm run build
```

Este módulo não tem lógica pura para testar no Vitest.

## Estratégia de testes

Verificação manual, com o usuário rodando o dev server:

1. Abrir `/auth` a 360px, nos temas claro e escuro: o véu clareia e os blocos chegam na ordem da tabela, em até cerca de 800ms.
2. Clicar no campo de e-mail e digitar durante a animação: funciona.
3. Trocar para "Criar conta" e voltar: nada se repete.
4. Trocar o tema e o idioma: nada se repete.
5. Logout pelo Header: a animação toca de novo ao chegar em `/auth`.
6. Com o movimento reduzido emulado: a página aparece direto, sem véu.
7. DevTools Performance: só `opacity` e `transform` animam, sem layout ou paint por frame no conteúdo.

## Limites

- **Sempre:** animar só `opacity` e `transform`; usar os tokens; manter o formulário utilizável desde o primeiro frame.
- **Perguntar antes:** animar outras telas além da `/auth`; mudar a estrutura de DOM do `AuthTabs`.
- **Nunca:** bloquear a interação até a animação acabar; repetir a animação a cada troca de aba ou tema.

## Critérios de sucesso

- [ ] Véu e cascata terminam em até 800ms a partir da montagem.
- [ ] Os campos aceitam foco e digitação desde o primeiro frame.
- [ ] A troca de aba, tema e idioma não reanima nada.
- [ ] Sem animação com movimento reduzido.
- [ ] Só `opacity` e `transform` são animados.
- [ ] `npm run lint` e `npm run build` passam.

## Perguntas em aberto

Nenhuma. A intensidade do véu (88%) e as durações são o ponto de partida e podem ser ajustadas no olho.
