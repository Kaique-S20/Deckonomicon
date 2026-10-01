/* ==========================================
   0. BANCO DE DADOS E ESTADO
   ========================================== */
let deckCartas = []; // Array que vai guardar as cartas do deck atual
let cartaSelecionadaBusca = null;

// IDs do DOM
const inputBusca = document.getElementById('busca-carta');
const listaSugestoes = document.getElementById('sugestoes-carta');
const formAdicionar = document.getElementById('form-adicionar-carta');
const containerLista = document.getElementById('container-lista-cartas');

// IDs do Painel Lateral
const painelTitulo = document.getElementById('painel-titulo');
const painelImg = document.getElementById('painel-img');
const painelNome = document.getElementById('painel-nome');
const painelTotal = document.getElementById('painel-total');
const painelValor = document.getElementById('painel-valor');


/* ==========================================
   1. AUTOCOMPLETE (SCRYFALL)
   ========================================== */
let temporizadorBusca;

inputBusca.addEventListener('input', function() {
    cartaSelecionadaBusca = null; 
    clearTimeout(temporizadorBusca);
    const termo = inputBusca.value.trim();

    if (termo.length < 3) {
        listaSugestoes.style.display = 'none';
        return;
    }

    temporizadorBusca = setTimeout(async () => {
        try {
            console.log(`🔎 Buscando na API por: "${termo}"`);
            const resposta = await fetch(`https://api.scryfall.com/cards/search?q=name%3A${encodeURIComponent(termo)}`);
            
            if (!resposta.ok) throw new Error('Nada encontrado ou erro na API');
            
            const dados = await resposta.json();
            const cartas = dados.data.slice(0, 5); 
            
            console.log("✅ Sugestões retornadas pelo Scryfall:", cartas.map(c => c.name));
            
            listaSugestoes.innerHTML = ''; 
            
            cartas.forEach(carta => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid var(--border-color)';
                li.style.cursor = 'pointer';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '10px';
                
                const imgUrl = carta.image_uris ? carta.image_uris.art_crop : (carta.card_faces ? carta.card_faces[0].image_uris.art_crop : '');
                li.innerHTML = `<img src="${imgUrl}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;"> <span>${carta.name}</span>`;
                
                li.addEventListener('mouseover', () => li.style.background = 'rgba(255, 255, 255, 0.05)');
                li.addEventListener('mouseout', () => li.style.background = 'transparent');

                li.addEventListener('click', () => {
                    inputBusca.value = carta.name; 
                    cartaSelecionadaBusca = carta; 
                    console.log("🎯 Carta selecionada para adicionar:", carta.name);
                    listaSugestoes.style.display = 'none'; 
                });
                
                listaSugestoes.appendChild(li);
            });
            
            listaSugestoes.style.display = 'block'; 
            
        } catch (erro) {
            console.warn("❌ Erro na busca:", erro.message);
            listaSugestoes.style.display = 'none';
        }
    }, 500); 
});

document.addEventListener('click', (evento) => {
    if (evento.target !== inputBusca) {
        listaSugestoes.style.display = 'none';
    }
});

/* ==========================================
   2. TRADUTOR E AGRUPADOR DE CATEGORIAS
   ========================================== */
function obterCategoria(typeLine) {
    if (!typeLine) return 'Outros';
    const linha = typeLine.toLowerCase();
    
    if (linha.includes('creature')) return 'Criaturas';
    if (linha.includes('planeswalker')) return 'Planeswalkers';
    if (linha.includes('instant')) return 'Mágicas Instantâneas';
    if (linha.includes('sorcery')) return 'Feitiços';
    if (linha.includes('artifact')) return 'Artefatos';
    if (linha.includes('enchantment')) return 'Encantamentos';
    if (linha.includes('land')) return 'Terrenos';
    
    return 'Outros';
}

/* ==========================================
   3. ADICIONAR CARTA AO DECK
   ========================================== */
const inputQtd = document.getElementById('qtd-carta');

formAdicionar.addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    if (!cartaSelecionadaBusca) {
        alert('Por favor, selecione uma carta da lista suspensa antes de adicionar.');
        return;
    }

    const qtdDesejada = parseInt(inputQtd.value) || 1; // Lê a quantidade do input
    const carta = cartaSelecionadaBusca;
    const categoriaStr = obterCategoria(carta.type_line);
    
    const precoStr = carta.prices?.usd || carta.prices?.usd_foil || "0";
    const precoCard = parseFloat(precoStr) || 0;
    
    let imagemCompleta = '';
    if (carta.image_uris && carta.image_uris.normal) {
        imagemCompleta = carta.image_uris.normal;
    } else if (carta.card_faces && carta.card_faces[0].image_uris) {
        imagemCompleta = carta.card_faces[0].image_uris.normal;
    }

    const indexExistente = deckCartas.findIndex(c => c.id === carta.id);
    
    if (indexExistente >= 0) {
        deckCartas[indexExistente].quantidade += qtdDesejada; // Adiciona as N cópias
    } else {
        deckCartas.push({
            id: carta.id,
            nome: carta.name,
            categoria: categoriaStr,
            preco: precoCard,
            imagem: imagemCompleta,
            tipoOriginal: carta.type_line,
            quantidade: qtdDesejada // Cria a carta já com N cópias
        });
    }

    // Reseta os campos para a próxima busca
    inputBusca.value = '';
    inputQtd.value = 1; 
    cartaSelecionadaBusca = null;
    
    renderizarListaCartas();
    atualizarEstatisticas();
});

/* ==========================================
   3.5 ADICIONAR TERRENOS BÁSICOS (ACESSO RÁPIDO)
   ========================================== */
const botoesTerreno = document.querySelectorAll('.btn-add-terreno');

botoesTerreno.forEach(botao => {
    // Efeito de hover (opcional, só para ficar bonito)
    botao.addEventListener('mouseover', () => botao.style.opacity = '0.8');
    botao.addEventListener('mouseout', () => botao.style.opacity = '1');

    botao.addEventListener('click', async () => {
        const nomeTerreno = botao.getAttribute('data-land');
        const qtdDesejada = parseInt(inputQtd.value) || 1;
        
        try {
            // Requisição exata e direta: não tem erro, traz exatamente a carta oficial
            const resposta = await fetch(`https://api.scryfall.com/cards/named?exact=${nomeTerreno}`);
            if (!resposta.ok) throw new Error('Erro ao buscar o terreno');
            
            const carta = await resposta.json();
            
            const precoStr = carta.prices?.usd || carta.prices?.usd_foil || "0";
            const precoCard = parseFloat(precoStr) || 0;
            
            let imagemCompleta = '';
            if (carta.image_uris && carta.image_uris.normal) {
                imagemCompleta = carta.image_uris.normal;
            }
            
            // Verifica se já temos este terreno básico no deck
            const indexExistente = deckCartas.findIndex(c => c.nome === carta.name);
            
            if (indexExistente >= 0) {
                deckCartas[indexExistente].quantidade += qtdDesejada;
            } else {
                deckCartas.push({
                    id: carta.id,
                    nome: carta.name,
                    categoria: 'Terrenos', // Forçamos a categoria direto para Terrenos
                    preco: precoCard,
                    imagem: imagemCompleta,
                    tipoOriginal: carta.type_line,
                    quantidade: qtdDesejada
                });
            }
            
            // Reseta a caixinha e atualiza a tela
            inputQtd.value = 1; 
            renderizarListaCartas();
            atualizarEstatisticas();
            
        } catch (erro) {
            console.error('Falha ao adicionar terreno:', erro);
            alert('Não foi possível conectar com o Scryfall para adicionar o terreno.');
        }
    });
});

/* ==========================================
   4. RENDERIZAÇÃO E INTERATIVIDADE
   ========================================== */
function renderizarListaCartas() {
    containerLista.innerHTML = '';
    
    const categoriasAgrupadas = {};
    deckCartas.forEach(carta => {
        if (!categoriasAgrupadas[carta.categoria]) categoriasAgrupadas[carta.categoria] = [];
        categoriasAgrupadas[carta.categoria].push(carta);
    });

    const ordemDesejada = [
        'Comandante',
        'Criaturas',
        'Feitiços',
        'Mágicas Instantâneas',
        'Artefatos',
        'Encantamentos',
        'Terrenos',
        'Planeswalkers',
        'Outros'
    ];

    const categoriasOrdenadas = Object.entries(categoriasAgrupadas).sort((a, b) => {
        let indexA = ordemDesejada.indexOf(a[0]);
        let indexB = ordemDesejada.indexOf(b[0]);
        
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        
        return indexA - indexB;
    });

    for (const [nomeCategoria, cartasDaCategoria] of categoriasOrdenadas) {
        const totalCartasCategoria = cartasDaCategoria.reduce((acc, c) => acc + c.quantidade, 0);
        
        const section = document.createElement('section');
        section.className = 'categoria';
        section.style.marginBottom = '20px';
        
        section.innerHTML = `<h3 style="color: var(--brand-color); border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">${nomeCategoria} (${totalCartasCategoria})</h3>`;
        
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.marginTop = '10px';

        cartasDaCategoria.forEach(carta => {
            const li = document.createElement('li');
            li.style.cursor = 'pointer';
            li.style.padding = '8px 5px';
            li.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            // NOVO: Adicionado input type="number" diretamente na linha da carta
            li.innerHTML = `
                <div style="display: flex; align-items: center; flex-grow: 1; gap: 10px;">
                    <input type="number" class="input-qtd-lista" value="${carta.quantidade}" min="0" style="width: 50px; text-align: center; border-radius: 4px; border: 1px solid var(--border-color); background: var(--surface-color); color: var(--brand-color); font-weight: bold; padding: 2px;">
                    <span>${carta.nome}</span>
                </div>
                <span style="color: var(--text-secondary); margin-right: 15px;">$ ${(carta.preco * carta.quantidade).toFixed(2)}</span>
                <button class="btn-remover" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-weight: bold; font-size: 1.2em; padding: 0 5px;" title="Remover carta do deck">&times;</button>
            `;
            
            li.addEventListener('mouseover', () => li.style.backgroundColor = 'rgba(255, 255, 255, 0.05)');
            li.addEventListener('mouseout', () => li.style.backgroundColor = 'transparent');
            
            // Mostrar a carta no painel lateral
            li.addEventListener('click', () => {
                painelTitulo.textContent = carta.tipoOriginal; 
                painelImg.src = carta.imagem;
                painelImg.style.width = '100%';
                painelImg.style.borderRadius = '4.75% / 3.5%'; 
                painelNome.textContent = carta.nome;
            });

            // NOVO: Evento para quando você muda o número na caixinha
            const inputQtdLista = li.querySelector('.input-qtd-lista');
            
            // Impede que clicar na caixinha acione a visualização da carta
            inputQtdLista.addEventListener('click', (eventoInput) => eventoInput.stopPropagation());
            
            inputQtdLista.addEventListener('change', (eventoInput) => {
                const novaQtd = parseInt(eventoInput.target.value) || 0;
                const indexCarta = deckCartas.findIndex(c => c.id === carta.id);
                
                if (indexCarta >= 0) {
                    if (novaQtd <= 0) {
                        deckCartas.splice(indexCarta, 1); // Se colocar 0, remove a carta
                    } else {
                        deckCartas[indexCarta].quantidade = novaQtd; // Atualiza para a nova quantidade
                    }
                    renderizarListaCartas();
                    atualizarEstatisticas();
                }
            });

            // O botão X agora remove a carta inteira de uma vez
            const btnRemover = li.querySelector('.btn-remover');
            btnRemover.addEventListener('click', (eventoBotao) => {
                eventoBotao.stopPropagation();
                
                const indexCarta = deckCartas.findIndex(c => c.id === carta.id);
                if (indexCarta >= 0) {
                    deckCartas.splice(indexCarta, 1); // Remove do array
                    renderizarListaCartas();
                    atualizarEstatisticas();
                }
            });

            ul.appendChild(li);
        });

        section.appendChild(ul);
        containerLista.appendChild(section);
    }
}

function atualizarEstatisticas() {
    const totalCartas = deckCartas.reduce((acc, c) => acc + c.quantidade, 0);
    const valorTotal = deckCartas.reduce((acc, c) => acc + (c.quantidade * c.preco), 0);

    painelTotal.textContent = `Total de Cartas: ${totalCartas}`;
    painelValor.textContent = `Valor Estimado: $ ${valorTotal.toFixed(2)}`;
}