# Fluxo de telas

Guia de uso do LifeManager: como chegar a cada tela, o que ela mostra e o que cada botão faz. Os nomes de botões e campos estão como aparecem no app em português.

Para as regras por trás de cada comportamento (limites, cálculos, prazos), veja `docs/regras-de-negocio.md` no repositório da API.

Quem mantém o código: ao mudar uma tela, um botão ou um fluxo, atualize este documento junto.

## Sumário

- [Mapa de telas](#mapa-de-telas)
- [Elementos comuns](#elementos-comuns)
- [Acesso](#acesso)
- [Home](#home)
- [Financeiro](#financeiro)
  - [Painel](#painel)
  - [Meses](#meses)
  - [Detalhe do mês](#detalhe-do-mês)
  - [Planejamento: Orçamento](#planejamento-orçamento)
  - [Planejamento: Recorrentes](#planejamento-recorrentes)
  - [Importar extrato](#importar-extrato)
  - [Revisar importação](#revisar-importação)
  - [Categorias](#categorias)
- [Hábitos](#hábitos)
  - [Barra do personagem](#barra-do-personagem)
  - [Hoje](#hoje)
  - [Hábitos (lista)](#hábitos-lista)
  - [Detalhe do hábito](#detalhe-do-hábito)
  - [Loja](#loja)
  - [Histórico](#histórico)
  - [Momentos de jogo](#momentos-de-jogo)

## Mapa de telas

```
/auth                       Entrar / Criar conta (só sem sessão)
/home                       Escolha do módulo
/finance                    → Painel
  /finance/dashboard        Painel
  /finance/months           Meses
  /finance/months/:id       Detalhe do mês
  /finance/planning         → Orçamento
    /finance/planning/goals      Orçamento (?month=aaaa-mm)
    /finance/planning/recurring  Recorrentes
  /finance/imports          Importar extrato
  /finance/imports/:id      Revisar importação
  /finance/categories       Categorias
/habits                     → Hoje
  /habits/today             Hoje
  /habits/list              Hábitos
  /habits/list/:id          Detalhe do hábito
  /habits/shop              → Recompensas
    /habits/shop/rewards         Recompensas
    /habits/shop/redemptions     Resgates
  /habits/history           Histórico
```

Qualquer outro endereço leva para a Home. Sem sessão, qualquer tela leva para **/auth**.

## Elementos comuns

### Cabeçalho

Aparece no topo de todas as telas depois do login.

- **Botão do usuário** (canto direito): abre um menu com:
  - o **nome** do usuário;
  - **Tema:** alterna entre claro (sol) e escuro (lua);
  - **Idioma:** português ou inglês;
  - **Sair:** encerra a sessão, mostra "Você saiu da sua conta." e volta para o login.
- Tema e idioma mudam na hora e são salvos na conta: valem em qualquer dispositivo no próximo login.
- No Financeiro, ao lado do menu fica o botão **Ocultar valores / Mostrar valores** (veja [Modo privacidade](#modo-privacidade)).

### Menu lateral dos módulos

Financeiro e Hábitos têm um menu com as telas do módulo.

- **Todos os módulos:** volta para a Home.
- **Recolher menu / Expandir menu:** deixa só os ícones. A escolha fica salva neste navegador.
- **No celular** (até 768px), o menu vira uma **barra fixa na parte de baixo da tela**.

### Padrões de listas

As listas (meses, lançamentos, categorias, recorrências, hábitos, recompensas) seguem o mesmo padrão:

- **Busca:** filtra enquanto você digita, ignorando acentos e maiúsculas.
- **Filtros:** **Limpar** zera um filtro; **Limpar filtros** zera todos.
- **Ordenar por** + **Inverter ordem:** escolhe a coluna e alterna entre crescente e decrescente. Nas tabelas, em tela larga, basta clicar no título da coluna.
- **Paginação** no fim da lista, com o total ("1–20 de 45 lançamentos").
- Se a lista não carregar, aparece **Tentar novamente**.
- No celular, cada item vira um bloco empilhado e os botões de ação ficam sempre visíveis.

### Janelas e avisos

- Formulários e confirmações abrem numa janela sobre a tela. No celular, ela sobe da parte de baixo. **Cancelar** ou **Fechar** fecha sem salvar.
- Uma ação concluída mostra um aviso rápido na parte de baixo ("Categoria criada").
- Um erro que não é de um campo específico abre uma janela de erro. Sem conexão com o servidor, aparece **Erro de conexão**.
- Erros de um campo (nome repetido, valor inválido) aparecem embaixo do próprio campo.

### Sessão

- A sessão se renova sozinha enquanto você usa o app.
- Ao abrir uma nova aba ou recarregar a página, o app recupera a sessão sem pedir login.
- Quando a sessão expira, aparece "Sua sessão expirou. Entre novamente." e o app volta para o login.
- Quem abre um link sem estar logado vai para o login e, depois de entrar, **volta para a tela que tentou abrir**.

## Acesso

**Rota:** `/auth`. Só abre sem sessão; quem já está logado vai para a Home.

A tela tem duas abas: **Entrar** e **Criar conta**.

### Entrar

| Campo | Regra |
|---|---|
| E-mail | Obrigatório, formato `algo@algo.algo` |
| Senha | Obrigatória |

- **Entrar:** com dados certos, mostra "Login realizado com sucesso", aplica o tema e o idioma salvos na conta e abre a Home (ou a tela que você tentou abrir antes). Com dados errados, mostra "E-mail ou senha inválidos".
- **Não tem conta? Criar conta:** troca para a aba de cadastro.
- **Esqueceu a senha?** ainda não tem função.

### Criar conta

| Campo | Regra |
|---|---|
| Nome | Obrigatório, até 100 caracteres |
| E-mail | Obrigatório, formato válido, não pode estar cadastrado ("Este e-mail já está cadastrado") |
| Senha | De 8 a 50 caracteres |
| Confirmar senha | Igual à senha ("As senhas não coincidem") |

- **Criar conta:** cria a conta, mostra "Conta criada com sucesso" e volta para a aba **Entrar**. O cadastro não faz login automático.
- **Já tem conta? Entrar:** volta para a aba de login.

## Home

**Rota:** `/home` (também é para onde vai qualquer endereço desconhecido).

Mostra um cartão por módulo. Clicar abre o módulo:

- **Financeiro:** abre o Painel.
- **Hábitos:** abre a tela Hoje.

## Financeiro

Menu: **Painel**, **Meses**, **Planejamento**, **Importar**, **Categorias**.

### Modo privacidade

O botão **Ocultar valores** no cabeçalho esconde todos os valores em dinheiro e porcentagens do Financeiro (aparecem como `R$ ••••••` e `••%`). As barras do orçamento ficam neutras e com o mesmo tamanho, o gráfico circular do orçamento fica com fatias iguais e neutras, os sliders travam e os marcadores de meta do gráfico do painel somem. **Mostrar valores** desfaz.

A escolha fica salva neste dispositivo e vale para todas as abas abertas.

### Painel

**Rota:** `/finance/dashboard` (é a tela inicial do Financeiro).

- **Período:** Este mês, Últimos 3 meses, **Últimos 6 meses** (padrão), Últimos 12 meses, Este ano e cada ano anterior em que você tem meses. Ao lado aparece "Comparado com …", o período usado na comparação.
- **Totais do período:** Receitas, Gastos, Investido e **Poupado**, cada um com a variação ("Subiu 12% em relação a …"). Poupado é o que sobrou das receitas depois dos gastos: investir conta como guardar, não como gastar. Ao lado do nome vem a **taxa de poupança** (a parte das receitas que foi poupada; não aparece sem receitas, e abaixo de −100% aparece como "<−100%") e embaixo a divisão: quanto foi **investido** e quanto ficou **em conta** (o mesmo Saldo da tela do mês, que pode ser negativo quando você investiu dinheiro de meses anteriores).
- **Evolução mensal:** gráfico com receitas, investimentos e gastos por mês, o **Poupado** de cada mês embaixo das barras e os limites do orçamento de cada mês como marcadores. **Selecione um mês** para ver os valores dele, incluindo o Poupado e o que ficou **Em conta**.
- **Gastos por categoria** e **Investimentos por categoria:** as 8 maiores categorias e "Outras". Clicar numa categoria abre o detalhe **Por mês**.
- **Orçamento do período:**
  - Limite de gastos e alvo de investimento do mês, com "Dentro do limite em X de N meses fechados". O mês atual fica fora da contagem. O limite de gastos de um mês é o total do orçamento menos a fatia de Investimentos; o alvo de investimento é essa fatia.
  - **Categorias que mais estouraram**.
  - **Criar orçamento** (sem orçamento no período) ou **Ver orçamento** abrem a tela de Orçamento.
- Se o painel não carregar: **Tentar de novo**.

### Meses

**Rota:** `/finance/months`.

Lista de **Todos os meses**, com Receitas, Gastos, Investido e Saldo. O mês corrente tem o selo "Mês atual".

- **Filtros:** **Ano** (Todos ou um ano) e **Saldo** (Todos, Positivo, Negativo).
- **Ordenação:** Mês (padrão: mais recente primeiro), Receitas, Gastos, Investido ou Saldo.
- **Clicar numa linha** abre o [Detalhe do mês](#detalhe-do-mês).
- **Novo mês:** abre a janela "Novo mês".
  - **Mês:** escolha de janeiro a dezembro.
  - **Ano:** fixo no ano atual e desabilitado ("Meses são criados no ano atual").
  - **Criar mês:** cria e mostra "Mês criado". Se o mês já existe: "Esse mês já foi criado".
- **Importar extrato:** abre a tela [Importar extrato](#importar-extrato).

> Meses de lançamentos recorrentes são criados sozinhos quando a recorrência é lançada. Meses de anos anteriores entram pela [importação de extrato](#importar-extrato).

### Detalhe do mês

**Rota:** `/finance/months/:id`. Para chegar: clique num mês da lista.

**Topo**
- **Meses** (voltar): retorna à lista.
- Título com o mês e o ano, e o selo **Mês atual** quando for o caso.
- **Mês anterior / Próximo mês:** vão para o mês cadastrado mais próximo. Ficam desabilitados quando não há.

**Totais**
- Receitas, Gastos, Investido e Saldo, com a quantidade de lançamentos de cada tipo e "X% das receitas gastos".

**Orçamento do mês**
- Mostra até 3 fatias, as mais perto ou já além do valor, com "X de N fatias em dia". O Livre entra como "Livre (gastos sem fatia)".
- **Ver orçamento** abre a tela de Orçamento já neste mês. Sem orçamento, aparece "Este mês não tem orçamento." e **Criar orçamento**.

**Lançamentos**
- Lista com Data, Descrição, Categoria e Valor. Os lançamentos feitos por uma recorrência têm um ícone de repetição ("Lançado por uma recorrência").
- **Filtros:** Tipo (Todos, Receitas, Gastos, Investimentos), Categoria e **Buscar descrição**.
- **Ordenação:** Data (padrão: mais recente primeiro), Descrição, Categoria ou Valor.
- **Novo lançamento:** abre o formulário.
- **Editar** (em cada linha): abre o mesmo formulário preenchido. **Salvar** mostra "Lançamento atualizado".
- **Excluir** (em cada linha): pede confirmação ("Excluir "Mercado" de R$ 250,00? Essa ação não pode ser desfeita.") e mostra "Lançamento excluído".
- Toda mudança atualiza os totais e o orçamento do mês na hora.

**Formulário de lançamento**

| Campo | Regra |
|---|---|
| Tipo | Gasto, Investimento ou Receita |
| Descrição | Obrigatória, até 80 caracteres |
| Valor | Maior que zero; aceita `1.234,56` ou `1234.56` |
| Data | Precisa estar dentro do mês ("A data precisa estar em …") |
| Categoria | Obrigatória. Sem categorias, aparece o link **Criar categoria**, que leva à tela de Categorias |

**Salvar lançamento** mostra "Receita registrada", "Gasto registrado" ou "Investimento registrado".

Se o mês não existir (ou for de outro usuário): "Esse mês não existe ou não é seu." e o botão **Voltar para meses**.

### Planejamento: Orçamento

**Rota:** `/finance/planning/goals` (aba **Orçamento** dentro de **Planejamento**). Também abre por **Ver orçamento** ou **Criar orçamento** no painel e no detalhe do mês.

Cada mês tem o seu orçamento: um **Total do mês** dividido em fatias de %, uma por categoria e uma de **Investimentos**. O que não foi dividido fica **Livre**.

- **Navegação de mês:** **Mês anterior**, **Próximo mês** e **Ir para o mês atual**. O mês escolhido fica no endereço (`?month=2026-10`).
- **Mês sem orçamento:** "Este mês ainda não tem orçamento", com:
  - **Copiar de ‹mês›** (quando algum mês anterior tem orçamento): preenche a tela com o orçamento do último mês anterior que tem um, **sem salvar**, e mostra "Orçamento de ‹mês› copiado. Ajuste e salve.";
  - **Criar orçamento:** abre a tela vazia, com tudo livre.
- **Gráfico circular:** uma fatia por categoria, Investimentos em violeta e o Livre hachurado. No centro, "% alocado" e quanto está livre. Passar o mouse ou tocar numa fatia mostra o nome, o % e o valor dela no centro, e tocar também destaca a linha dela na lista. No celular o gráfico fica em cima; no computador, à esquerda, parado enquanto a lista rola.
- **Total do mês:** campo em R$. Mudar o total mantém os % e recalcula os valores.
- **Cada fatia mostra:**
  - cor, nome, % e valor;
  - um **slider** de 0 a 100%. Ele para no que ainda está livre (a parte clara do trilho mostra até onde dá para ir);
  - "R$ X de R$ Y gastos" (ou "investidos"), com uma barra e a situação: Dentro do limite, Perto do limite (80% ou mais), Limite estourado, Alvo atingido ou Abaixo do alvo. Uma fatia ainda não salva mostra "Salve para acompanhar o que já foi gasto.";
  - **tocar no %** abre **Valor exato**, para digitar a **Porcentagem** ou o **Valor** em R$ ("Até … (R$ …)");
  - **Remover** (lixeira): tira a fatia; o % dela volta para o Livre.
- **Livre:** o % e o valor que sobram, com "Gastos sem fatia: R$ X de R$ Y" (o que foi gasto em categorias sem fatia).
- **Adicionar categoria:** abre "Adicionar ao orçamento", com **Investimentos** primeiro (enquanto não estiver no orçamento) e as categorias que ainda não têm fatia, com busca. A fatia entra com 0% e o slider já selecionado.
- **Alterações não salvas:** aparece uma barra no fim da tela com **Descartar** e **Salvar**. Sem o total, ela avisa "Informe o total do mês para salvar.". **Salvar** grava o mês inteiro e mostra "Orçamento salvo". Se as fatias passarem de 100%: "As fatias passam de 100%. Diminua alguma antes de salvar.".
- **Sair sem salvar:** trocar de mês ou ir para outra tela com alterações não salvas pergunta "Sair sem salvar?" ("Você tem alterações não salvas no orçamento de ‹mês›. Se sair agora, elas serão perdidas."), com **Continuar editando** e **Sair sem salvar**. Sair da conta ou ter a sessão expirada não pergunta: a sessão já acabou e as alterações não poderiam mais ser salvas. Fechar ou recarregar a aba mostra o aviso do próprio navegador.
- **Excluir orçamento** (no topo, quando o mês tem um): pede confirmação ("Excluir o orçamento de ‹mês›? Os outros meses não mudam.") e mostra "Orçamento excluído".
- **Modo privacidade:** valores e % ocultos, o gráfico fica com fatias neutras do mesmo tamanho e os sliders ficam travados ("Mostre os valores para editar o orçamento.").

### Planejamento: Recorrentes

**Rota:** `/finance/planning/recurring` (aba **Recorrentes** dentro de **Planejamento**).

Lista de **Transações recorrentes**, um cartão por recorrência com:
- descrição, categoria e valor;
- "Todo dia N" (e "até …" quando tem fim);
- "Próximo: …", ou o selo **Pausada** ou **Encerrada**.

- **Filtros:** Tipo, Situação (Todas, Ativas, Pausadas, Encerradas) e **Buscar descrição**.
- **Ordenar por:** Próximo lançamento (padrão), Descrição, Valor ou Dia do mês, com **Inverter ordem**.
- **Nova recorrência:** abre o formulário.

  | Campo | Regra |
  |---|---|
  | Tipo, Descrição, Valor, Categoria | Mesmas regras de um lançamento |
  | Dia do mês | 1 a 31 ("Em meses mais curtos, cai no último dia.") |
  | Começa em | Mês e ano; não pode ser antes do mês atual |
  | Termina em | Opcional ("Sem data de fim"); não pode ser antes do início |

  **Salvar recorrência** mostra "Recorrência criada". Se o dia já passou no mês de início, a transação desse mês é lançada na hora.
- **Editar:** as mudanças valem para os próximos lançamentos. O início fica travado depois que a recorrência começou.
- **Pausar / Retomar:** os meses em que ela ficou pausada não são lançados.
- **Excluir:** pede confirmação. As transações já lançadas continuam nos meses.
- Se a recorrência acabou de ser lançada enquanto você editava, aparece "Essa recorrência acabou de ser lançada. Tente de novo."

### Importar extrato

**Rota:** `/finance/imports` (item **Importar** do menu, ou **Importar extrato** na tela de Meses).

Traz o extrato do banco para o app: os meses que faltam (de qualquer ano) e as transações, depois de uma revisão.

**Extrato do banco**
- **Escolher arquivo** (ou arrastar o arquivo para a área, com mouse): aceita **OFX** ou **CSV**, até 5 MB e 5.000 lançamentos.
- **OFX:** é lido na hora e abre a revisão.
- **CSV:** antes abre a janela **Colunas do CSV**, porque cada banco monta o arquivo de um jeito:
  - **A primeira linha é o cabeçalho**, **Data**, **Descrição** e **Valor** (**Uma coluna** com sinal, ou **Débito e crédito** em colunas separadas);
  - **Formato da data** (Dia/mês/ano, Ano-mês-dia, Mês/dia/ano) e **Separador dos centavos** (vírgula ou ponto);
  - **Inverter os sinais**, para faturas de cartão que mostram as compras como valores positivos;
  - a **Prévia** mostra as primeiras linhas como serão lidas, com "N lançamentos prontos para revisar" e as linhas que não puderam ser lidas;
  - **Continuar** abre a revisão. As colunas escolhidas ficam guardadas neste navegador: o próximo arquivo com o mesmo cabeçalho já vem configurado.
- Linhas com data futura, anterior a 2000 ou valor zero ficam de fora, com um aviso.
- Ao terminar, aparece "Extrato pronto para revisar" e abre a tela [Revisar importação](#revisar-importação).

**Importações**
- Lista as importações: primeiro as **Em revisão**, depois as **Importado**, com o período, a quantidade de lançamentos e a data do envio.
- **Continuar revisão:** volta a uma importação em revisão (ela fica salva, então dá para continuar depois ou em outro aparelho).
- **Descartar** (em revisão): apaga a revisão; nada foi lançado ainda.
- **Remover do histórico** (importadas): tira da lista; as transações lançadas continuam nos meses.
- Uma importação deixada em revisão por mais de 30 dias é apagada sozinha.

### Revisar importação

**Rota:** `/finance/imports/:id`.

**Topo**
- **Importações** (voltar), o nome do arquivo e o período ("Jan 2023 – Mar 2024 · 120 lançamentos").
- **Descartar:** pede confirmação e apaga a revisão.
- **Confirmar importação:** fica desabilitado enquanto houver lançamentos incluídos sem categoria ("Falta a categoria de N lançamentos incluídos para poder confirmar.").
- Contadores que também filtram a lista: **N para importar**, **N sem categoria**, **N sugeridos**, **N possíveis duplicatas**.

**Meses do extrato**
- Um cartão por mês com **Novo mês** (será criado) ou **Já existe**, as Entradas e Saídas dos lançamentos incluídos, "N de M incluídos" e quantos estão sem categoria.
- Clicar num mês mostra só os lançamentos dele; **Todos os meses** volta. Com muitos meses, **Ver todos os N meses** mostra o resto.

**Lançamentos**
- Cada lançamento mostra a data, a descrição, o texto original do banco ("No banco: …") quando a descrição foi mudada, o valor e a categoria.
- As categorias já vêm preenchidas pelo que você fez antes, com um selo que diz de onde veio e a confiança:
  - **Aprendida:** de importações anteriores do mesmo estabelecimento ("usada 12 vezes");
  - **Pelo histórico:** dos seus lançamentos com a mesma descrição;
  - **Parecida:** de um estabelecimento com nome parecido (confiança média ou baixa: vale conferir).
  - **Você deixou de fora antes:** lançamentos que você não importou da última vez (por exemplo, transferências entre suas contas) já vêm fora.
- Alguns lançamentos já vêm arquivados pelo próprio texto do banco, mesmo na primeira importação, com um selo:
  - **Investimento:** uma aplicação ("Aplicação RDB", "Dinheiro guardado…") vem como investimento, sem categoria;
  - **Resgate:** um resgate ("Resgate RDB", "Crédito Tesouro Direto…") vem fora da importação, porque não é receita;
  - **Entre contas:** um Pix ou transferência com o nome do seu cadastro (dinheiro entre as suas contas) vem fora da importação. Só funciona quando o nome do cadastro tem pelo menos duas palavras e aparece no extrato: com duas palavras, elas precisam estar juntas no extrato; com três ou mais, o banco pode ter nomes a mais no meio.
  - O que você já decidiu antes para o mesmo estabelecimento vale mais que esses selos. Incluir um desses lançamentos ensina a próxima importação.
- **Possível duplicata:** o lançamento parece já estar nos seus meses (mesma linha de um extrato já importado, ou mesma data e valor de um lançamento feito à mão). Vem fora da importação; **Ver no mês** abre o mês do lançamento existente numa nova aba.
- **Categoria** (em cada lançamento): escolher salva na hora. **+ Nova categoria…** abre o formulário de categoria e já usa a nova.
- **Deixar de fora / Incluir na importação** (ícone de olho): tira ou devolve o lançamento.
- **Editar:** abre o formulário completo (Tipo, Descrição, Valor, Data entre 01/01/2000 e hoje, Categoria, **Incluir na importação** e **Conta no mês seguinte**). A data pode mudar de mês.
- **Conta no mês seguinte:** para um salário ou uma conta paga no fim do mês que pertence ao mês seguinte. O lançamento guarda a data do banco, mas vai para o dia 1º do mês seguinte ("Conta em Setembro 2026 (lançado no dia 1º)."). Trocar a data desmarca a caixa. O lançamento ganha o selo **Conta em Setembro 2026**; quando o app marcou sozinho, pelo que você fez nas importações anteriores com o mesmo estabelecimento (só nos últimos 5 dias do mês), o selo diz **Conta em Setembro 2026 · pelo histórico**.
- Depois de mudar um lançamento, se houver outros do mesmo estabelecimento arquivados de outro jeito, aparece "Fazer o mesmo com N outros lançamentos parecidos com …?" com **Aplicar** e **Agora não**. Lançamentos que você editou um a um não mudam.
- **Seleção:** a caixa de cada lançamento (ou **Selecionar todos desta página**) mostra a barra com **Definir categoria…**, **Definir tipo…**, **Definir mês…** (**Conta no mês seguinte** ou **Conta no mês da data**), **Incluir**, **Deixar de fora** e **Limpar seleção**.
- **Mostrar** (Todos, Sem categoria, Sugeridos — com sugestão de categoria ou arquivados pelo texto do banco —, Possíveis duplicatas, Fora da importação), **Buscar descrição** e **Ordenar por** (Data, Descrição, Categoria, Valor).

**Confirmar importação**
- A janela resume: "N transações serão lançadas em M meses." e quantos meses ainda não existem e serão criados.
- **Importar** lança tudo, cria os meses que faltam, guarda as categorias escolhidas para as próximas importações e abre a tela de Meses com "Importação concluída".
- Uma linha do banco que já tinha sido lançada (por outra importação feita no meio tempo) é pulada e aparece no aviso.
- Uma importação já confirmada mostra "Essa importação já foi confirmada." e **Ver meses**.

### Categorias

**Rota:** `/finance/categories`.

- Lista de **Todas as categorias**, com **Buscar categoria**.
- **Nova categoria:** pede só o **Nome** (até 50 caracteres). **Criar categoria** mostra "Categoria criada". Um nome repetido, mesmo com outros acentos ou maiúsculas, mostra "Já existe uma categoria com esse nome".
- **Editar:** renomeia a categoria.
- **Excluir:** pede confirmação. Se a categoria tem lançamentos ou recorrências, a exclusão é recusada com uma janela de erro explicando que é preciso trocar a categoria deles antes. Se tem fatias de orçamento, elas são apagadas junto (em todos os meses).

## Hábitos

Menu: **Hoje**, **Hábitos**, **Loja**, **Histórico**.

### Barra do personagem

Fica no topo de todas as telas de Hábitos:
- **Nível** e barra de **XP** até o próximo nível;
- barra de **HP** (0 a 100);
- **Moedas**;
- **Proteções de ofensiva** (até 2).

Os números se atualizam depois de cada ação. As animações de moeda, nível e dano respeitam a opção do sistema de reduzir movimento.

### Hoje

**Rota:** `/habits/today` (é a tela inicial de Hábitos).

**Sem nenhum hábito**
- Aparecem sugestões fáceis: "Beber um copo de água", "Ler 10 páginas" e "Caminhar 10 minutos".
- Clicar numa sugestão abre o formulário de novo hábito já preenchido, na tela Hábitos. Nada é criado até você salvar.
- **Criar meu próprio hábito** leva para a tela Hábitos.

**Bem-vindo de volta!**
- Depois de uma falha recente, aparece um aviso de incentivo.
- **Fechar aviso** esconde a mensagem até a próxima falha.

**Ontem ficou pendente** (só quando há pendências)
- Lista os hábitos de ontem que não foram marcados. Dá para marcar até o fim de hoje; depois o dia fecha e conta como falha.
- O selo **Ofensiva de N dias em risco** mostra o que está em jogo. Se você tem uma proteção, ele diz "Uma proteção cobre se você não marcar".

**Para hoje**
- Lista os hábitos para construir agendados hoje, com o contador "X de N feitos".
- **Toque na linha inteira** para marcar como feito. Um aviso mostra o ganho ("+10 moedas · +20 XP · +1 HP") e, quando for o caso, o marco, a subida de nível ou a proteção ganha.
- **Toque de novo** num hábito feito para desfazer ("Check-in desfeito").
- Hábitos "vezes por semana" mostram "2/3 esta semana". Depois de bater a meta, marcar não rende nada ("Feito! A meta da semana já tinha sido batida.").
- Com tudo marcado: "Tudo feito hoje. Sua ofensiva agradece!".

**Evitando** (hábitos para evitar)
- Um cartão por hábito, com os dias limpos (ou as semanas no limite) e o recorde. No limite semanal, mostra "N de M nesta semana".
- **Tive uma recaída:** abre a confirmação.
  - **Quando foi:** Hoje ou Ontem (ontem só enquanto ainda é possível registrar).
  - O custo aparece antes de confirmar: "Vai custar 8 HP e zerar sua ofensiva de 12 dias limpos.", ou, dentro do limite semanal, "Ainda dentro do limite: sem perda de HP."
  - **Registrar recaída** confirma.
- Depois de registrar, o cartão mostra "Recaída registrada hoje/ontem" e o botão **Desfazer**.
- **Liberado hoje: …** lista os hábitos de dias fixos que estão de folga hoje.

### Hábitos (lista)

**Rota:** `/habits/list`.

- Lista de **Seus hábitos**, com:
  - o tipo (Construir/Evitar), a dificuldade e a frequência ("Todo dia", "3× por semana", "Até 2× por semana");
  - a ofensiva e o recorde.
- **Situação:** Ativos (padrão) ou Arquivados. Também há **Buscar hábito** e **Ordenar por** Nome ou Data de criação.
- **Clicar num hábito** abre o [Detalhe do hábito](#detalhe-do-hábito).
- **Novo hábito:** abre o formulário.

  | Campo | Regra |
  |---|---|
  | Tipo | **Construir** ou **Evitar**; não muda depois de criado |
  | Nome | Obrigatório, até 60 caracteres, único entre os ativos |
  | Dificuldade | Fácil, Médio ou Difícil |
  | Frequência | Construir: **Todo dia**, **Dias fixos** (escolha os dias) ou **Vezes/semana** (1 a 6). Evitar ("Quando evitar"): **Todo dia**, **Dias fixos** (dias em que você evita; nos outros está liberado) ou **Limite semanal** (máximo de vezes por semana) |
  | Gatilho (opcional) | Até 120 caracteres ("Depois de tomar café…") |
  | Descrição (opcional) | Até 200 caracteres |

  **Criar hábito** mostra "Hábito criado".
- **Editar:** muda tudo, menos o tipo. Mudanças na frequência valem a partir do próximo dia avaliado.
- **Arquivar:** pede confirmação. O hábito sai da lista e deixa de ser cobrado, mas o histórico é mantido.
- **Restaurar** (em Arquivados): volta o hábito com a ofensiva zerada. Se já existe um ativo com o mesmo nome, a restauração é recusada.
- Sem hábitos, aparecem as mesmas sugestões da tela Hoje.

### Detalhe do hábito

**Rota:** `/habits/list/:id`. Para chegar: clique num hábito da lista.

- **Hábitos** (voltar) retorna à lista. Um hábito arquivado mostra o selo **Arquivado**.
- **Resumo:**
  - **Ofensiva** e recorde.
  - **Consistência (30 dias)**, ou **(4 semanas)** nos hábitos semanais.
  - **Rumo ao automático:** dias cumpridos de 66.
- **Últimas 13 semanas:** um mapa com um quadrado por dia (segunda no topo), colorido pelo estado: Feito, Dia limpo, Protegido, Falhou, Recaída, Pendente, Folga, Liberado, Sem registro ou Antes do início.
  - **Toque ou passe o mouse** num dia para ver o que aconteceu.
  - A legenda mostra quantos dias há em cada estado.
- **Lançamentos deste hábito:** o extrato só desse hábito.

### Loja

**Rota:** `/habits/shop`, com duas abas: **Recompensas** e **Resgates**.

**Recompensas**
- Cartões com o ícone, o nome, o preço em moedas e "≈ N dias de hábitos" (quanto tempo de hábitos a recompensa custa, pelo seu ritmo recente).
- **Situação:** Ativas ou Arquivadas. Também há **Buscar recompensa** e **Ordenar por** Preço (padrão: mais barata primeiro) ou Nome.
- **Resgatar:** abre a confirmação com o preço e o saldo depois do resgate.
  - **Resgatar por N moedas** confirma e mostra "Resgatado: …".
  - Sem moedas suficientes, o botão no cartão vira "Faltam N moedas".
- **Nova recompensa:**

  | Campo | Regra |
  |---|---|
  | Nome | Obrigatório, até 60 caracteres, único entre as ativas |
  | Preço em moedas | Número inteiro de 1 a 100.000 ("Um hábito fácil rende 5 moedas; um difícil, 20.") |
  | Ícone | Presente, Videogame, Série ou filme, Café, Comida, Descanso, Compras ou Passeio |

  **Criar recompensa** mostra "Recompensa criada".
- **Editar:** um novo preço vale para os próximos resgates.
- **Arquivar:** tira a recompensa da loja. Os resgates continuam no histórico.
- **Restaurar** (em Arquivadas).
- Sem recompensas, aparecem sugestões ("1h de videogame", "Um café especial", "Um episódio de série") e **Criar minha própria recompensa**.

**Resgates**
- **Histórico de resgates**, do mais recente para o mais antigo, com o preço pago.
- **Desfazer:** só aparece nos resgates de hoje que ainda não foram desfeitos. Devolve as moedas e mostra "Resgate desfeito: …". Resgates desfeitos ficam marcados como **Desfeito**.

### Histórico

**Rota:** `/habits/history`.

O **Extrato** completo, do mais recente para o mais antigo: tudo o que mexeu em moedas, XP e HP. Isso inclui hábito cumprido, falha, recaída, dia limpo, marco de ofensiva, resgate, resgate desfeito, nocaute, proteção usada e subida de nível. Cada linha mostra as variações ("+10 moedas", "−8 HP").

### Momentos de jogo

Em qualquer tela de Hábitos, uma janela comemora ou avisa um acontecimento que você ainda não viu. Isso vale também quando o acontecimento foi no fechamento do dia, com você longe do app.

- **Nível N!** "Seu HP foi restaurado." Botão **Continuar**.
- **Você foi nocauteado:** mostra as moedas perdidas e que o HP foi restaurado. Nível e XP continuam. Botão **Recomeçar**.

Cada momento aparece uma vez por dispositivo.
