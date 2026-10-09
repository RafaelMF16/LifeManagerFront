# LifeManagerFront

O LifeManager é uma ferramenta pessoal para organizar várias áreas da vida num só lugar. Este repositório é o **frontend**, uma SPA em React. Ele consome a API do [LifeManager](https://github.com/RafaelMF16/LifeManager) (.NET).

## O que o app tem

- **Acesso:** login, cadastro e sessão renovada automaticamente. Tema claro/escuro e idioma (português/inglês) ficam salvos na conta.
- **Financeiro:** painel do período, meses com seus lançamentos (receitas, gastos e investimentos), categorias, metas mensais, transações recorrentes e um modo de privacidade que oculta os valores.
- **Hábitos:** checklist do dia, hábitos para construir ou evitar, personagem com nível, XP, HP e moedas, estatísticas por hábito, extrato e uma loja de recompensas.

O passo a passo de cada tela e botão está em [docs/fluxo-de-telas.md](docs/fluxo-de-telas.md). As regras de negócio (o que a API garante) estão no repositório do back, em `docs/regras-de-negocio.md`.

## Stack

- React 19 + TypeScript + Vite
- React Router, React Hook Form + Zod
- i18next (`pt-BR` e `en-US`)
- lucide-react (ícones)
- Vitest (testes) e Oxlint (lint)
- Mobile-first: todas as telas funcionam a partir de 360px de largura

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20.19+ ou 22.12+ (exigência do Vite 8)
- A **API rodando** em `https://localhost:7233`. Siga o README do [LifeManager](https://github.com/RafaelMF16/LifeManager): banco, secrets, certificado, migrations e `dotnet run`.

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar o endereço da API

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Ele já aponta para a API local:

```
VITE_API_BASE_URL=https://localhost:7233
```

### 3. Rodar

```bash
npm run dev
```

Abra **https://localhost:5173**. Use `https` e a porta 5173, porque a API só aceita chamadas (CORS e cookie de sessão) dessa origem.

O servidor de desenvolvimento usa um certificado autoassinado, então o navegador mostra um aviso na primeira vez. Aceite para continuar. Se o login falhar com "Erro de conexão", confira se a API está no ar e se o certificado dela foi confiado (`dotnet dev-certs https --trust`).

### 4. Primeiro acesso

Na tela inicial, escolha **Criar conta**, cadastre-se e entre. Depois escolha um módulo na Home.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Checagem de tipos (`tsc -b`) + build de produção |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Oxlint |
| `npm test` | Testes do Vitest |

## Documentação

- [docs/fluxo-de-telas.md](docs/fluxo-de-telas.md): guia de uso, com cada tela, o que ela mostra e o que cada botão faz.
- [CLAUDE.md](CLAUDE.md): referência técnica (arquitetura, convenções, i18n, responsividade e detalhes de cada módulo).
