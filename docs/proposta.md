#ETAPA-01 PROPOSTA E ESPECIFICAÇÃO DO PROJETO

## 1. Nome da aplicação 
Deckonomicon.

## 2. Descrição do problema
No jogo de cartas Magic The Gathering, os jogadores lidam com a dificuldade de organização de cartas para seus decks e principalmente seus preços, além de exigir o refinamento de cartas melhores e mais consistentes.

## 3. Público alvo
Jogadores de Magic the Gathering além de colecionadores de cartas.

## 4. Objetivo principal da aplicação.
Fornecer uma plataforma web centralizada onde os usuários possam montar e gerenciar seus decks, acompanhando variações financeiras ao longo do tempo e organizando suas listas com ferramentas específicas para o jogo.

## 5. Funcionalidades da aplicação
1. Criação, edição e gerenciamento de listas de decks.
2. Exibição de gráficos do quanto seu deck e suas cartas valorizaram com o passar do tempo e das coleções.
3. Importação e exportação de listas de cartas em massa.
4. Sincronização de dados de cartas e preços da API pública do Scryfall.
5. Sistema de busca e filtros avançados para organizar o deck por tipo, curva de mana ou mecânicas.

## 6. Entidades ou conceitos importantes do domínio
1. **Usuário:** Dono da conta que possui os decks.
2. **Deck:** A coleção estruturada de cartas.
3. **Carta:** A entidade com dados técnicos, regras e o histórico de preço.

## 7. Descrição de interfaces (telas)
1. **Tela de Login:** Exibe uma tela inicial para o usuário criar sua conta colocando seu e-mail e sua senha.
2. **Tela de Dashboard Inicial:** Exibe um resumo da conta, o valor total somado do patrimônio em cartas.
3. **Tela de Edição do Deck:** Interface onde o usuário visualiza a lista em tabela, altera as cartas, usa filtros e importa listas em massa.
4. **Tela de Detalhes da Carta:** Página que exibe a arte da carta, regras oficiais e um gráfico detalhado com o histórico da variação do seu preço.

## 8. Operações na aplicação
1. Cadastrar e autenticar um usuário no sistema.
2. Criar um novo deck vazio vinculado ao usuário.
3. Adicionar, editar ou remover instâncias de cartas em um deck.
4. Processar a importação em massa de uma lista de texto para instanciar cartas no banco.
5. Executar uma rotina automatizada (CRON Job) no servidor para consultar a API do Scryfall e atualizar os preços das cartas.

## 9. Tecnologias no cliente
HTML5, CSS3 e JavaScript.

## 10. Tecnologias no servidor
Java com o framework Spring Boot.

## 11. Tecnologia de persistência
Banco de dados relacional (PostgreSQL).

## 12. Diagrama da visão geral da solução
A arquitetura do sistema seguirá um modelo Cliente-Servidor com integração a uma API externa.