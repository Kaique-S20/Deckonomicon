/* ==========================================
   0. BANCO DE DADOS SIMULADO E DOM
   ========================================== */
let minhasPastas = []; 
let meusDecks = []; 
let comandanteSelecionado = null; // Vai guardar a carta que você clicar
let pastaAtualId = null;

const tabelaBody = document.getElementById('tabela-decks-body');

// Traduz a identidade de cor (ex: ["R", "G"]) para os símbolos oficiais SVG do Scryfall
function traduzirCores(identidade) {
    // Para comandantes incolores (como Trazyn the Infinite ou Traxos), a API devolve um array vazio
    if (!identidade || identidade.length === 0) {
        return `<img src="https://svgs.scryfall.io/card-symbols/C.svg" title="Incolor" style="width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 0 2px rgba(0,0,0,0.8);">`;
    }
    
    // Mapeia as siglas para as imagens correspondentes
    const HTMLSimbolos = identidade.map(cor => {
        return `<img src="https://svgs.scryfall.io/card-symbols/${cor}.svg" title="${cor}" style="width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 0 2px rgba(0,0,0,0.8);">`;
    }).join('');
    
    // Agrupa os símbolos lado a lado num pequeno contentor flex
    return `<div style="display: flex; gap: 4px; align-items: center;">${HTMLSimbolos}</div>`;
}

/* ==========================================
   1. GERENCIAMENTO DE MODAIS
   ========================================== */
const modalDeck = document.getElementById('modal-novo-deck');
const btnAbrirDeck = document.getElementById('btn-abrir-modal');
const btnFecharDeck = document.getElementById('btn-fechar-modal');

const modalPasta = document.getElementById('modal-nova-pasta');
const btnAbrirPasta = document.getElementById('btn-nova-pasta');
const btnFecharPasta = document.getElementById('btn-fechar-pasta');

// Lógica de abertura
if (btnAbrirDeck) btnAbrirDeck.addEventListener('click', () => modalDeck.showModal());
if (btnAbrirPasta) btnAbrirPasta.addEventListener('click', () => modalPasta.showModal());

// Lógica de fechamento (Botão X)
if (btnFecharDeck) btnFecharDeck.addEventListener('click', () => modalDeck.close());
if (btnFecharPasta) btnFecharPasta.addEventListener('click', () => modalPasta.close());

// Função para fechar a janela ao clicar fora do modal
function fecharAoClicarFora(modal, evento) {
    const dimensoes = modal.getBoundingClientRect();
    if (
        evento.clientX < dimensoes.left || 
        evento.clientX > dimensoes.right || 
        evento.clientY < dimensoes.top || 
        evento.clientY > dimensoes.bottom
    ) {
        modal.close();
    }
}

if (modalDeck) modalDeck.addEventListener('click', (e) => fecharAoClicarFora(modalDeck, e));
if (modalPasta) modalPasta.addEventListener('click', (e) => fecharAoClicarFora(modalPasta, e));


/* ==========================================
   2. VALIDAÇÃO DE FORMULÁRIOS
   ========================================== */
const formNovaPasta = document.getElementById('form-nova-pasta');
const inputNomePasta = document.getElementById('pasta-nome');

if (formNovaPasta) {
    formNovaPasta.addEventListener('submit', function(evento) {
        evento.preventDefault(); // Impede o reload da página

        const nomeDaPasta = inputNomePasta.value.trim();

        // Verifica se está vazio (ou se tem apenas espaços)
        if (nomeDaPasta === '') {
            // Define uma mensagem de erro forçando o balão nativo do HTML5 a aparecer
            inputNomePasta.setCustomValidity('Por favor, preencha o nome da pasta.');
            inputNomePasta.reportValidity(); // Exibe o balão na tela
            
            // Remove o erro assim que o usuário começar a digitar de novo
            inputNomePasta.addEventListener('input', function() {
                inputNomePasta.setCustomValidity('');
            }, { once: true });
            
            return; // Trava a execução
        }

        // 4.Cria um objeto pasta e joga dentro do Array
        minhasPastas.push({
            id: Date.now(), // Gera um ID único baseado no tempo
            nome: nomeDaPasta
        });
        
        // 5. Manda o JavaScript redesenhar a tabela na tela
        renderizarTabela();
        atualizarSelectPastas(); 
        
        // 6. Fecha o modal e limpa o campo para a próxima vez
        modalPasta.close();
        formNovaPasta.reset();
    });
}

/* ==========================================
   3. RENDERIZAÇÃO DA TABELA (INJEÇÃO NO DOM)
   ========================================== */
function renderizarTabela() {
    tabelaBody.innerHTML = '';

    // A. SE ESTIVER DENTRO DE UMA PASTA: Desenha o botão "Up a level"
    if (pastaAtualId !== null) {
        const trVoltar = document.createElement('tr');
        trVoltar.style.cursor = 'pointer';
        trVoltar.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        trVoltar.innerHTML = `
            <td colspan="4" style="color: #bfa6ff; font-weight: bold;">
                ⬆️ Subir um nível (Voltar)
            </td>
        `;
        // Ao clicar em voltar, define a pasta atual como nula (raiz) e redesenha
        trVoltar.addEventListener('click', () => {
            pastaAtualId = null;
            renderizarTabela();
        });
        tabelaBody.appendChild(trVoltar);
    }

    // B. SE ESTIVER NA RAIZ: Desenha todas as pastas criadas
    if (pastaAtualId === null) {
        minhasPastas.forEach(pasta => {
            // Conta quantos decks pertencem a esta pasta
            const qtdDecks = meusDecks.filter(deck => deck.pastaId == pasta.id).length;
            
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
                <td style="color: var(--brand-color); font-weight: bold;">
                    📁 ${pasta.nome} <span style="color: var(--text-secondary); font-weight: normal;">(${qtdDecks})</span>
                </td>
                <td style="color: var(--text-secondary);">-</td>
                <td style="color: var(--text-secondary);">-</td>
                <td style="color: var(--text-secondary);">Agora mesmo</td>
            `;
            
            tr.addEventListener('mouseover', () => tr.style.backgroundColor = 'rgba(255, 255, 255, 0.03)');
            tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');
            
            // O evento que faz o "Enter Folder": define o ID da pasta e redesenha a tabela
            tr.addEventListener('click', () => {
                pastaAtualId = pasta.id;
                renderizarTabela();
            });
            
            tabelaBody.appendChild(tr);
        });
    }

    // C. DESENHA OS DECKS (Filtrados)
    // Filtra os decks: se estiver na raiz, mostra os sem pasta ('none'). Se estiver numa pasta, mostra os dela.
    const decksParaMostrar = meusDecks.filter(deck => {
        if (pastaAtualId === null) {
            return deck.pastaId === 'none' || !deck.pastaId;
        } else {
            return deck.pastaId == pastaAtualId;
        }
    });

    decksParaMostrar.forEach(deck => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><a href="deck.html" style="color: var(--text-primary); text-decoration: none; font-weight: bold;">🃏 ${deck.nome}</a></td>
            <td>${deck.formato}</td>
            <td style="color: var(--brand-color); font-size: 0.9em;">${deck.cores}</td>
            <td><time>Agora mesmo</time></td>
        `;
        
        tr.addEventListener('mouseover', () => tr.style.backgroundColor = 'rgba(255, 255, 255, 0.05)');
        tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');

        tabelaBody.appendChild(tr);
    });
}

/* ==========================================
   4. ATUALIZAÇÃO DO SELECT DE PASTAS
   ========================================== */
function atualizarSelectPastas() {
    // 1. Busca o elemento select do HTML (esta linha estava faltando!)
    const selectPasta = document.getElementById('deck-pasta');
    
    if (!selectPasta) return;
    
    // 2. Limpa as antigas e recria a opção padrão
    selectPasta.innerHTML = '<option value="none">Sem Pasta</option>';

    // 3. Preenche com as pastas que estão no nosso array
    minhasPastas.forEach(pasta => {
        const option = document.createElement('option');
        option.value = pasta.id;
        option.textContent = pasta.nome;
        selectPasta.appendChild(option);
    });
}

/* ==========================================
   5. AUTOCOMPLETE DO COMANDANTE (SCRYFALL)
   ========================================== */
const inputComandante = document.getElementById('deck-comandante');
const checkComandanteValido = document.getElementById('check-comandante-valido');
const listaSugestoes = document.getElementById('sugestoes-comandante');
let temporizadorBusca;

if (inputComandante) {
    inputComandante.addEventListener('input', function() {
        comandanteSelecionado = null; // Limpa a memória se o usuário voltar a digitar
        clearTimeout(temporizadorBusca); // Cancela a busca anterior se o usuário continuar digitando
        const termo = inputComandante.value.trim();

        // Se tiver menos de 3 letras, limpa e esconde a lista
        if (termo.length < 3) {
            listaSugestoes.style.display = 'none';
            return;
        }

        // Aguarda 500ms após o usuário parar de digitar
        temporizadorBusca = setTimeout(async () => {
            try {
                // A mágica da restrição do formato Commander
                const filtro = checkComandanteValido.checked ? ' is:commander' : '';
                const resposta = await fetch(`https://api.scryfall.com/cards/search?q=${termo}${filtro}`);
                
                if (!resposta.ok) throw new Error('Nada encontrado');
                
                const dados = await resposta.json();
                const cartas = dados.data.slice(0, 5); // Pega apenas o Top 5 resultados
                
                listaSugestoes.innerHTML = ''; // Limpa a lista anterior
                
                cartas.forEach(carta => {
                    const li = document.createElement('li');
                    li.style.padding = '10px';
                    li.style.borderBottom = '1px solid var(--border-color)';
                    li.style.cursor = 'pointer';
                    li.style.display = 'flex';
                    li.style.alignItems = 'center';
                    li.style.gap = '10px';
                    
                    // Miniatura estilizada
                    const imgUrl = carta.image_uris ? carta.image_uris.art_crop : '';
                    li.innerHTML = `<img src="${imgUrl}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;"> <span>${carta.name}</span>`;
                    
                    // Efeito Hover (passar o mouse)
                    li.addEventListener('mouseover', () => li.style.background = 'rgba(255, 255, 255, 0.05)');
                    li.addEventListener('mouseout', () => li.style.background = 'transparent');

                    // Evento de Clique na Sugestão
                    li.addEventListener('click', () => {
                        inputComandante.value = carta.name; 
                        comandanteSelecionado = carta; // GUARDA A CARTA INTEIRA AQUI!
                        listaSugestoes.style.display = 'none'; 
                    });
                    
                    listaSugestoes.appendChild(li);
                });
                
                listaSugestoes.style.display = 'block'; // Mostra a lista preenchida
                
            } catch (erro) {
                listaSugestoes.style.display = 'none';
            }
        }, 500); 
    });
    
    // Fecha a lista se o usuário clicar fora do input
    document.addEventListener('click', (evento) => {
        if (evento.target !== inputComandante) {
            listaSugestoes.style.display = 'none';
        }
    });
}

/* ==========================================
   6. CRIAÇÃO DE DECKS E ATUALIZAÇÃO DO PAINEL
   ========================================== */
const formNovoDeck = document.getElementById('form-novo-deck');
const inputNomeDeck = document.getElementById('deck-nome');

const painelImg = document.getElementById('painel-img');
const painelNome = document.getElementById('painel-nome');
const painelStatus = document.getElementById('painel-status');

if (formNovoDeck) {
    formNovoDeck.addEventListener('submit', function(evento) {
        evento.preventDefault(); 
        
        const nomeDoDeck = inputNomeDeck.value.trim();
        
        if (nomeDoDeck === '') {
            inputNomeDeck.setCustomValidity('Por favor, dê um nome ao seu deck.');
            inputNomeDeck.reportValidity();
            inputNomeDeck.addEventListener('input', () => inputNomeDeck.setCustomValidity(''), { once: true });
            return;
        }
        
        // ... código anterior ...
        const selectFormato = document.getElementById('deck-formato');
        const formatoEscolhido = selectFormato.options[selectFormato.selectedIndex].text;

        const selectPastaModal = document.getElementById('deck-pasta');
        const pastaEscolhida = selectPastaModal.value; // Será 'none' ou o ID numérico da pasta

        let imgDoComandante = '';
        let coresDoDeck = 'A definir';

        if (comandanteSelecionado && comandanteSelecionado.name === inputComandante.value.trim()) {
            coresDoDeck = traduzirCores(comandanteSelecionado.color_identity);
            if (comandanteSelecionado.image_uris && comandanteSelecionado.image_uris.art_crop) {
                imgDoComandante = comandanteSelecionado.image_uris.art_crop;
            } else if (comandanteSelecionado.card_faces && comandanteSelecionado.card_faces[0].image_uris) {
                imgDoComandante = comandanteSelecionado.card_faces[0].image_uris.art_crop;
            }
        }

        // Atualiza o push para incluir o pastaId
        meusDecks.push({
            id: Date.now(),
            nome: nomeDoDeck,
            formato: formatoEscolhido,
            cores: coresDoDeck,
            pastaId: pastaEscolhida // A mágica da filtragem acontece por causa desta linha
        });
        
        painelNome.textContent = nomeDoDeck;
        painelStatus.textContent = 'Status: Novo (0/100 cartas)';
        
        if (imgDoComandante) {
            painelImg.src = imgDoComandante;
            painelImg.style.objectFit = 'cover'; 
        } else {
            const primeiraLetra = nomeDoDeck.charAt(0).toUpperCase();
            painelImg.src = `https://placehold.co/100x100/2ecc71/111?text=${primeiraLetra}`;
        }
        
        painelImg.style.transition = 'box-shadow 0.3s ease';
        painelImg.style.boxShadow = '0 0 20px var(--brand-color)';
        setTimeout(() => painelImg.style.boxShadow = 'none', 800);
        
        renderizarTabela();
        
        modalDeck.close();
        formNovoDeck.reset();
        comandanteSelecionado = null; // Limpa para o próximo deck
    });
}