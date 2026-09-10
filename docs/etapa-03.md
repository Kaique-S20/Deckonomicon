# etapa-03

## 1. Interfaces Apresentadas
O projeto contempla as seguintes interfaces responsivas de gerenciamento de decks e autenticação:

Perfil: Perfil (perfil.html) contendo as informações do usuário.

Gerenciamento: Meus Decks (meus-decks.html) contendo tabela de listagem e modal flutuante de criação.

Deck: Deck (deck.html) contendo a lista de cartas de um deck.

## 2. Viewports Utilizados nos Testes e Evidências
O design responsivo foi validado considerando os seguintes intervalos de viewport:

Desktop: Viewports acima de 1024px (foco em monitores e notebooks).

Tablet: Viewports entre 769px e 1024px (foco em orientação retrato/paisagem de tablets).

Mobile (Smartphones): Viewports de max-width: 768px (foco em telas estreitas de dispositivos móveis).

## 3. Breakpoints Utilizados
O principal ponto de interrupção (breakpoint) estruturado nas folhas de estilo para reconfiguração de layout é:

max-width: 768px: Utilizado globalmente nos arquivos CSS para adaptar elementos complexos de grid, tabelas e barras de navegação para telas móveis.

## 4. Principais Decisões de Responsividade
Adaptação do Cabeçalho (Header): Em viewports menores, o menu horizontal flexbox migra de um alinhamento lateral para um fluxo empilhado (flex-direction: column), evitando estouros de tela e mantendo os botões de ação acessíveis.

Layouts em Grade Fluida (CSS Grid): As telas da Comunidade e do Perfil utilizam funções de dimensionamento automático (repeat(auto-fill, minmax(280px, 1fr))), permitindo que os cards se redistribuam dinamicamente sem necessidade de quebras manuais de linha.

Reorganização de Formulários: Elementos alinhados lado a lado (como os grupos de rádio botões ou inputs duplos) são reconfigurados via grid ou blocos flexíveis no mobile, garantindo usabilidade ergonômica para toque em dispositivos móveis.

## 5. Localização dos Arquivos CSS Responsivos
Todas as regras de estilo e suas respectivas Media Queries encontram-se centralizadas no diretório padrão de estilização do projeto:

frontend/assets/css/style.css (Estilos globais e variáveis de tema)

frontend/assets/css/home.css (Responsividade da página Home)

frontend/assets/css/comunidade.css (Responsividade da grade de decks públicos)

frontend/assets/css/perfil.css (Responsividade do painel de usuário)

frontend/assets/css/configuracoes.css (Responsividade dos formulários de ajustes)

frontend/assets/css/login.css & modal.css (Responsividade de modais e caixas de acesso)