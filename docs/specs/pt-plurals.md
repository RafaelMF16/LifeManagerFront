# Spec: `pt-plurals`

Módulo do mapa [`README.md`](README.md) (V1). Branch `fix/pt-plurals`, a partir da `dev`.

## Objetivo

Em português, toda contagem zero sai no plural: "0 dias limpos", "0 semanas", "0/66 dias".

**Causa:** no CLDR, `Intl.PluralRules('pt-BR').select(0)` é `one`, e o i18next escolhe a chave `_one` para `count: 0`. Hoje são 131 chaves `_one` em pt-BR e só 4 têm `_zero` (as da importação, que já têm texto próprio, como "Nada para importar").

## Abordagem

O i18next (v26) usa a chave `_zero` sempre que `count === 0` e a chave existe, seja qual for a regra do idioma. Em vez de escrever 127 chaves à mão, uma função pura completa os recursos pt-BR na inicialização:

```ts
// src/i18n/withZeroPlurals.ts
/** For every `key_one` with a `key_other` and no `key_zero`, adds `key_zero` = `key_other` (pt-BR reads 0 as plural). */
export function withZeroPlurals<T extends object>(resources: T): T
```

- A função é recursiva e não muta o objeto de entrada.
- Um `_zero` que já existe (texto próprio) é mantido.
- `i18n.ts` aplica a função só aos namespaces de `pt-BR`. Em `en-US` o 0 já é `other`.

Fora do escopo: revisar a redação das 131 frases.

## Critérios de aceite

- `t('…', { count: 0 })` em pt-BR devolve o texto de `_other` para toda chave plural sem `_zero` próprio.
- As 4 chaves `_zero` da importação continuam com o texto delas.
- `count: 1` continua no singular e `count: 2` no plural.
- Nas telas: "0 dias limpos" (Hoje), "0 semanas" e "Recorde: 0 semanas" (Detalhe do hábito), "0/66 dias".

## Testes (Vitest, TDD)

- **`withZeroPlurals.test.ts`:**
  - adiciona `_zero` a partir de `_other`;
  - mantém um `_zero` existente;
  - percorre objetos aninhados;
  - ignora `_one` sem `_other`;
  - não muta a entrada.
- **`i18n` pt-BR real:** um teste percorre todas as chaves `_one` dos 5 namespaces e confere que `t(key, { count: 0 })` não devolve o texto de `_one`. Esse teste é o que impede a regressão quando surgir uma chave nova.
- **Portão:** `npm test`, `npm run lint` e `npm run build`.

## Arquivos

`src/i18n/withZeroPlurals.ts` (+ teste), `src/i18n/i18n.ts`, `src/i18n/i18n.plurals.test.ts` e `CLAUDE.md` (seção i18n: uma linha sobre o zero em pt-BR).
