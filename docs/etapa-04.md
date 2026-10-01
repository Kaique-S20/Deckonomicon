# etapa-04

## Documentação da etapa

### Funcionalidade 1: Autocomplete e Busca Integrada via API (Scryfall)
* **Descrição da funcionalidade:** O sistema realiza requisições assíncronas para a API oficial do Scryfall enquanto o usuário digita o nome de uma carta ou comandante, exibindo uma lista flutuante com os 5 melhores resultados.
* **Como funciona:** Um evento de `input` monitora a digitação. Um mecanismo de temporização (500ms) impede que requisições sejam feitas a cada tecla pressionada. Ao receber o JSON da API, o DOM é manipulado para gerar as tags `<li>` dinâmicas com miniatura e nome, permitindo o clique para seleção.
* **Arquivos envolvidos:** `meusDecks.js` e `deckConstrutor.js`.
* **Principais conceitos de programação utilizados:** Consumo de APIs REST (Fetch API), Assincronismo (`async/await`), Manipulação de DOM, Temporizadores (`setTimeout`/`clearTimeout`), Event Listeners.
* **Validações implementadas:** A busca só é disparada se o termo possuir 3 ou mais caracteres para evitar sobrecarga.
* **Situações inválidas tratadas:** Caso a API retorne erro ou nenhuma carta seja encontrada, o bloco `try/catch` captura a exceção e oculta a lista de sugestões silenciosamente sem quebrar a aplicação.
* **Instruções para testar:** Na página do construtor de decks, digite o nome de uma carta (ex: "Dragon") no campo de busca e aguarde a lista flutuante aparecer. Clique em uma das sugestões para confirmar a seleção.

### Funcionalidade 2: Construtor Dinâmico de Decks (Lista e Estatísticas)
* **Descrição da funcionalidade:** Permite ao usuário adicionar cartas ao baralho definindo sua quantidade, agrupando-as automaticamente por tipo (Criaturas, Terrenos, etc.) e atualizando o painel de estatísticas laterais em tempo real.
* **Como funciona:** Ao confirmar a adição no formulário, a carta é salva no array global `deckCartas`. Uma função de renderização agrupa os elementos iterando sobre o array, ordena as categorias por hierarquia e injeta o HTML na tela. Inputs numéricos inseridos em cada linha gerada permitem alterar a quantidade de cartas ativamente.
* **Arquivos envolvidos:** `deckConstrutor.js`.
* **Principais conceitos de programação utilizados:** Arrays de Objetos, Métodos de Iteração (`reduce`, `forEach`, `sort`, `findIndex`), Manipulação de Eventos e Propagação (`stopPropagation`).
* **Validações implementadas:** O usuário é bloqueado de adicionar uma carta se tentar enviar o formulário sem ter clicado em uma sugestão válida na lista suspensa (exibe um `alert`).
* **Situações inválidas tratadas:** Se a API retornar uma carta sem preço listado, o sistema converte o valor nulo para `0` para evitar o erro matemático `NaN` na soma total. Inserir quantidade `0` no input da lista remove a carta do array.
* **Instruções para testar:** Pesquise uma carta, defina a quantidade e clique em "Adicionar". Altere o número diretamente na caixinha gerada na lista ou clique no "X" para remover a carta. Observe os valores sendo atualizados no painel lateral.

### Funcionalidade 3: Sistema de Navegação por Pastas e Estado
* **Descrição da funcionalidade:** Na tela de "Meus Decks", o usuário pode criar pastas e organizar seus decks dentro delas. A interface limpa e recarrega o conteúdo dependendo do nível de navegação acessado.
* **Como funciona:** Uma variável global `pastaAtualId` atua como estado. Se for nula, a tabela renderiza as pastas e decks da raiz. Ao clicar em uma pasta, a variável recebe o ID correspondente e a função de renderização é chamada novamente, filtrando (`.filter()`) os decks dessa pasta e injetando um botão "Subir um nível".
* **Arquivos envolvidos:** `meusDecks.js`.
* **Principais conceitos de programação utilizados:** Gerenciamento de Estado, Filtragem de Arrays, Injeção Dinâmica de HTML (`innerHTML`).
* **Validações implementadas:** O formulário de criação impede a submissão de nomes vazios utilizando a API de validação nativa do HTML5 (`setCustomValidity`).
* **Situações inválidas tratadas:** Impedimento do recarregamento padrão da página ao submeter o formulário (`preventDefault`) e bloqueio da criação de objetos vazios no banco de dados simulado.
* **Instruções para testar:** Acesse "Meus Decks" e crie uma nova pasta preenchendo o nome. Crie um novo deck e selecione essa pasta no formulário. Clique na pasta gerada na tabela e observe a tela exibir apenas o deck contido nela, além do botão de voltar à raiz.

## Matriz de Evidência

| Requisito | Funcionalidade relacionada | Arquivo(s) | Evidência |
| :--- | :--- | :--- | :--- |
| **Manipulação do DOM** | Construção da lista de cartas e agrupamento de categorias | `deckConstrutor.js` | Utilização de `document.createElement()`, `innerHTML` e `appendChild()` na função `renderizarListaCartas()`. |
| **Tratamento de eventos** | Interatividade na quantidade de cartas e remoção | `deckConstrutor.js` | Implementação de `addEventListener` para eventos de `change` (no input de quantidade) e `click` (nos botões de remover e adicionar terrenos). |
| **Validação de formulários** | Prevenção de submissão com dados em branco ao criar pastas e decks | `meusDecks.js` | Verificações de strings vazias acionando `input.setCustomValidity()` e `input.reportValidity()`. |
| **Alteração dinâmica da interface** | Atualização do painel lateral de detalhes da carta selecionada | `deckConstrutor.js` | Alteração via JavaScript das propriedades `src` da imagem e `textContent` dos títulos ao clicar num item da lista. |
| **Uso de funções** | Organização modular da lógica de interface e cálculo | `deckConstrutor.js` | Criação e chamada de funções específicas como `renderizarListaCartas()`, `atualizarEstatisticas()` e `obterCategoria()`. |
| **Uso de arrays** | Armazenamento do estado temporário do baralho em construção | `deckConstrutor.js` | Declaração da variável `let deckCartas = []` e utilização dos métodos `.push()` (inserir) e `.splice()` (remover). |
| **Métodos de iteração** | Cálculo do valor do deck e organização da exibição no ecrã | `deckConstrutor.js` | Aplicação massiva de `.reduce()` (para soma de valores e quantidades), `.forEach()` (para desenhar a lista) e `.filter()`. |
| **Tratamento de situações inválidas** | Prevenção de valores `NaN` e erros de requisição à API | `deckConstrutor.js` | Conversão segura de preços nulos com fallback (`parseFloat(precoStr) || 0`) e blocos `try/catch` no autocomplete. |

## Instruções de Execução e Teste

Para executar a aplicação e reproduzir as funcionalidades implementadas nesta etapa, siga os passos abaixo:

### Execução da Aplicação
1. Clone o repositório ou faça o download dos ficheiros correspondentes à versão da entrega (tag `etapa-04`).
2. Abra o ficheiro `home.html` (ou diretamente o `meus-decks.html`) num navegador web moderno (Chrome, Firefox, Edge, etc.). 
3. Não é necessária a instalação de um servidor local, a aplicação consome a API do Scryfall diretamente pelo cliente.

### Teste 1: Sistema de Pastas e Estado
1. Na página **"Meus Decks"**, clique no botão **"+ Nova Pasta"**.
2. **Teste a validação:** tente submeter o formulário com o campo do nome em branco e observe o aviso de bloqueio nativo do navegador (`setCustomValidity`).
3. Preencha um nome (ex: "Decks Competitivos") e crie a pasta.
4. Clique na linha da pasta recém-criada na tabela. O ecrã será atualizado dinamicamente (sem recarregar a página) para mostrar o interior da pasta. Repare que surgirá um botão **"Subir um nível"** para voltar à raiz.

### Teste 2: Autocomplete e Consumo da API (Scryfall)
1. Aceda ao construtor de baralhos abrindo o ficheiro `deck.html`.
2. No formulário central, no campo "Adicionar carta ao deck", digite o nome de uma carta (ex: "Sol Ring" ou "Dragon").
3. Aguarde um instante (mecanismo de *debounce* de 500ms) e observe a lista flutuante aparecer com os resultados exatos e miniaturas geradas pela API oficial do Scryfall.

### Teste 3: Construtor Dinâmico e Atualização da Interface
1. Com a lista do Autocomplete aberta (Teste 2), clique numa das cartas sugeridas.
2. Defina uma quantidade e clique em **"Adicionar"**. A carta será processada, categorizada pelo seu tipo (Criatura, Feitiço, etc.) e inserida na lista abaixo.
3. **Teste os Terrenos Básicos de Acesso Rápido:** no campo de quantidade, digite `30` e clique no botão **"💀 Pântano"** (ou outro terreno) logo abaixo da pesquisa. A categoria "Terrenos (30)" será gerada imediatamente no fundo da lista.
4. **Interatividade na Lista:** Na lista de cartas gerada, altere o valor dentro da caixinha numérica (`<input type="number">`) de qualquer carta.
5. **Teste de Alteração Dinâmica:** Enquanto altera as quantidades ou adiciona cartas, observe o Painel Lateral (Comandante/Carta selecionada). Ele atualizará o **Total de Cartas** e o **Valor Estimado** em tempo real utilizando os métodos de redução de arrays.
6. **Teste de Remoção:** Defina a quantidade de uma carta para `0` ou clique no botão **"X"** vermelho. A carta será removida do array de estado e a lista será re-renderizada automaticamente.