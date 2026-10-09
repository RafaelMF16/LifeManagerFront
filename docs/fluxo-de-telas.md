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
  - [Planejamento: Metas](#planejamento-metas)
  - [Planejamento: Recorrentes](#planejamento-recorrentes)
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
  /finance/planning         → Metas
    /finance/planning/goals      Metas (?month=aaaa-mm)
    /finance/planning/recurring  Recorrentes
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

Menu: **Painel**, **Meses**, **Planejamento**, **Categorias**.

### Modo privacidade

O botão **Ocultar valores** no cabeçalho esconde todos os valores em dinheiro e porcentagens do Financeiro (aparecem como `R$ ••••••` e `••%`). As barras de metas ficam neutras e com o mesmo tamanho, e os marcadores de meta do gráfico somem. **Mostrar valores** desfaz.

A escolha fica salva neste dispositivo e vale para todas as abas abertas.

### Painel

**Rota:** `/finance/dashboard` (é a tela inicial do Financeiro).

- **Período:** Este mês, Últimos 3 meses, **Últimos 6 meses** (padrão), Últimos 12 meses, Este ano e cada ano anterior em que você tem meses. Ao lado aparece "Comparado com …", o período usado na comparação.
- **Totais do período:** Receitas, Gastos, Investido e Saldo, cada um com a variação ("Subiu 12% em relação a …").
- **Evolução mensal:** gráfico com receitas, investimentos, gastos e saldo por mês, e as metas do total do mês como marcadores. **Selecione um mês** para ver os valores dele.
- **Gastos por categoria** e **Investimentos por categoria:** as 8 maiores categorias e "Outras". Clicar numa categoria abre o detalhe **Por mês**.
- **Metas do período:**
  - Limite de gastos e alvo de investimento do mês, com "Dentro do limite em X de N meses fechados". O mês atual fica fora da contagem.
  - **Categorias que mais estouraram** e **Investimentos por meta**.
  - **Definir metas** (sem metas) ou **Gerenciar metas** abrem a tela de Metas.
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

> Meses de lançamentos recorrentes são criados sozinhos quando a recorrência é lançada.

### Detalhe do mês

**Rota:** `/finance/months/:id`. Para chegar: clique num mês da lista.

**Topo**
- **Meses** (voltar): retorna à lista.
- Título com o mês e o ano, e o selo **Mês atual** quando for o caso.
- **Mês anterior / Próximo mês:** vão para o mês cadastrado mais próximo. Ficam desabilitados quando não há.

**Totais**
- Receitas, Gastos, Investido e Saldo, com a quantidade de lançamentos de cada tipo e "X% das receitas gastos".

**Metas do mês**
- Mostra até 3 metas, as mais perto ou já além da meta, com "X de N metas em dia".
- **Ver metas** abre a tela de Metas já neste mês. Sem metas, aparece **Definir metas**.

**Lançamentos**
- Lista com Data, Descrição, Categoria e Valor. Os lançamentos feitos por uma recorrência têm um ícone de repetição ("Lançado por uma recorrência").
- **Filtros:** Tipo (Todos, Receitas, Gastos, Investimentos), Categoria e **Buscar descrição**.
- **Ordenação:** Data (padrão: mais recente primeiro), Descrição, Categoria ou Valor.
- **Novo lançamento:** abre o formulário.
- **Editar** (em cada linha): abre o mesmo formulário preenchido. **Salvar** mostra "Lançamento atualizado".
- **Excluir** (em cada linha): pede confirmação ("Excluir "Mercado" de R$ 250,00? Essa ação não pode ser desfeita.") e mostra "Lançamento excluído".
- Toda mudança atualiza os totais e as metas do mês na hora.

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

### Planejamento: Metas

**Rota:** `/finance/planning/goals` (aba **Metas** dentro de **Planejamento**). Também abre por **Ver metas**, **Definir metas** ou **Gerenciar metas**.

- **Navegação de mês:** **Mês anterior**, **Próximo mês** e **Ir para o mês atual**. O mês escolhido fica no endereço (`?month=2026-10`).
- As metas aparecem em dois grupos, **Gastos** e **Investimentos**, com o **Total do mês** primeiro. Cada grupo mostra quanto houve no mês ("No mês: …").
- Cada meta mostra:
  - uma barra de progresso e "R$ X de R$ Y";
  - "Restam …", "Passou …" ou "Faltam …";
  - a situação: Dentro do limite, Perto do limite (80% ou mais), Limite estourado, Alvo atingido ou Abaixo do alvo;
  - "Desde …" (o mês em que a meta começou a valer).
- **Nova meta** (topo) ou **Adicionar** (em cada grupo): abre o formulário.
  - **Tipo:** Limite de gastos ("O máximo que você quer gastar no mês") ou Alvo de investimento ("O mínimo que você quer investir no mês").
  - **Categoria:** uma categoria ou "Total do mês (todas as categorias)".
  - **Valor.**
  - **A partir de:** o mês em que a meta começa a valer. Ela vale desse mês em diante, e os meses anteriores continuam com a meta que tinham.
  - **Salvar meta** mostra "Meta salva".
- **Alterar meta:** muda o valor a partir de um mês. Tipo e categoria ficam fixos.
- **Remover meta:** pede confirmação ("Remover a meta … a partir de …? Os meses anteriores continuam com ela.") e mostra "Meta removida".

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

### Categorias

**Rota:** `/finance/categories`.

- Lista de **Todas as categorias**, com **Buscar categoria**.
- **Nova categoria:** pede só o **Nome** (até 50 caracteres). **Criar categoria** mostra "Categoria criada". Um nome repetido, mesmo com outros acentos ou maiúsculas, mostra "Já existe uma categoria com esse nome".
- **Editar:** renomeia a categoria.
- **Excluir:** pede confirmação. Se a categoria tem lançamentos ou recorrências, a exclusão é recusada com uma janela de erro explicando que é preciso trocar a categoria deles antes. Se tem metas, elas são apagadas junto.

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
