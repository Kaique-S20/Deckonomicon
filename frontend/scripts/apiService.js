// 1. Selecionando os elementos principais do DOM
const formBusca = document.querySelector('form');
const inputBusca = document.getElementById('busca-principal');
const divResultados = document.getElementById('resultados-busca');

// Selecionando os elementos do Modal
const modalCarta = document.getElementById('modal-carta');
const imgModal = document.getElementById('img-carta-modal');
const btnFecharModal = document.querySelector('.btn-fechar-imagem');
const precoModal = document.getElementById('preco-carta-modal');

// Lógica para fechar o modal ao clicar no "X"
btnFecharModal.addEventListener('click', () => {
    modalCarta.style.display = 'none';
});

// Lógica para fechar o modal ao clicar fora da imagem (no fundo escuro)
window.addEventListener('click', (evento) => {
    if (evento.target === modalCarta) {
        modalCarta.style.display = 'none';
    }
});

// Função para converter "{1}{B/R}" em ícones visuais
function formatarCustoMana(custoString) {
    if (!custoString) return ''; // Se a carta não tiver custo (ex: Terrenos), retorna vazio
    
    // O .replace procura o padrão {texto} e roda uma função para cada um que encontrar
    return custoString.replace(/{([^}]+)}/g, function(match, simbolo) {
        // Tira a barra e põe em minúsculo. Ex: "B/R" vira "br", "1" vira "1"
        const classeMana = simbolo.toLowerCase().replace('/', '');
        
        // Cria o elemento visual do ícone (a classe ms-cost faz o círculo no fundo)
        return `<i class="ms ms-${classeMana} ms-cost" style="margin-left: 3px; font-size: 0.9em;"></i>`;
    });
}

// 2. Função assíncrona para buscar na API do Scryfall
async function buscarCartaNoScryfall(termo) {
    try {
        // Altera a interface dinamicamente para mostrar que está carregando
        divResultados.innerHTML = '<p style="color: var(--text-secondary); margin-top: 15px;">Invocando magias... aguarde.</p>';

        // Requisição para a API
        const resposta = await fetch(`https://api.scryfall.com/cards/search?q=${termo}`);

        // Tratamento de Situação Inválida: Erro 404 (Carta não encontrada)
        if (!resposta.ok) {
            throw new Error(`Nenhuma carta encontrada para o termo "${termo}".`);
        }

        // Converte a resposta JSON
        const dados = await resposta.json();
        const cartas = dados.data; // O Scryfall guarda os resultados dentro do array 'data'

        // Limpa o aviso de carregamento
        divResultados.innerHTML = '';

        // Cria a lista (ul) para exibir os resultados
        const lista = document.createElement('ul');
        lista.style.listStyle = 'none';
        lista.style.padding = '0';
        lista.style.marginTop = '20px';
        lista.style.textAlign = 'left';

        // Método de iteração: percorre o array de cartas
        cartas.forEach(carta => {
            const li = document.createElement('li');
            li.style.padding = '12px';
            li.style.borderBottom = '1px solid var(--border-color)';
            li.style.color = 'var(--text-primary)';
            li.style.display = 'flex'; // Ajuda a alinhar a imagem e o texto
            li.style.alignItems = 'center';
            
            // Imagem da carta
            const imgUrl = carta.image_uris ? carta.image_uris.art_crop : '';
            const miniatura = imgUrl ? `<img src="${imgUrl}" style="height: 40px; width: 40px; object-fit: cover; border-radius: 50%; margin-right: 15px; border: 1px solid var(--brand-color);">` : '';

            // Usa a nossa nova função mágica para os ícones
            const custoManaVisual = formatarCustoMana(carta.mana_cost);

            // Verifica se a carta tem preço em USD, senão exibe "N/A"
            const precoUsd = carta.prices && carta.prices.usd ? `$ ${carta.prices.usd}` : 'Preço indisponível';

            // Monta a linha com o nome e o preço à esquerda, e o custo à direita
            li.innerHTML = `
                ${miniatura} 
                <div style="flex-grow: 1; display: flex; flex-direction: column;">
                    <strong>${carta.name}</strong>
                    <span style="color: var(--text-secondary); font-size: 0.85em; margin-top: 4px;">${precoUsd}</span>
                </div>
                <span>${custoManaVisual}</span>
            `;
            
            // Deixa o cursor com formato de "mãozinha" para indicar que é clicável
            li.style.cursor = 'pointer';
            // Deixa o cursor com formato de "mãozinha" para indicar que é clicável
            li.style.cursor = 'pointer';

            // Efeito visual ao passar o mouse por cima da linha
            li.addEventListener('mouseover', () => li.style.background = 'rgba(255, 255, 255, 0.05)');
            li.addEventListener('mouseout', () => li.style.background = 'transparent');

            // Tratamento de Evento: Abrir o modal com a imagem da carta
            li.addEventListener('click', () => {
                // A API do Scryfall tem a 'normal' (tamanho perfeito para leitura)
                const imgFullUrl = carta.image_uris ? carta.image_uris.normal : '';
                
                if (imgFullUrl) {
                    imgModal.src = imgFullUrl;
                    // Injeta o preço que já foi calculado no modal
                    precoModal.textContent = precoUsd;
                    
                    modalCarta.style.display = 'flex'; // Exibe o modal centralizado
                } else {
                    alert('Arte indisponível para esta versão da carta.');
                }
            });
            lista.appendChild(li);
        });

        // Injeta a lista montada no DOM
        divResultados.appendChild(lista);

    } catch (erro) {
        // Exibe o erro de forma amigável na tela
        divResultados.innerHTML = `<p style="color: #ff5555; margin-top: 15px;">${erro.message}</p>`;
    }
}

// 3. Tratamento de Evento: Intercepta o botão "Pesquisar"
formBusca.addEventListener('submit', function(evento) {
    // Impede o recarregamento da página
    evento.preventDefault();

    const termoBuscado = inputBusca.value.trim();

    // Validação de formulário: impede busca vazia
    if (termoBuscado === '') {
        divResultados.innerHTML = '<p style="color: #ff5555; margin-top: 15px;">Por favor, digite o nome de uma carta.</p>';
        return;
    }

    // Chama a função da API passando o que o usuário digitou
    buscarCartaNoScryfall(termoBuscado);
});