let decks = [
    {
        id: 1,
        nome: "Fome Insaciável",
        comandante: "Ygra, Eater of All",
        formato: "Commander",
        cartas: ["Sol Ring", "Arcane Signet", "Swamp", "Forest"]
    }
];
let proximoId = 2;

const listarDecks = (req, res) => {
    return res.status(200).json(decks);
};

const buscarDeckPorId = (req, res) => {
    const id = Number(req.params.id);
    const deck = decks.find(d => d.id === id);

    if (!deck) {
        return res.status(404).json({ erro: "Deck não encontrado." });
    }

    return res.status(200).json(deck);
};

const criarDeck = (req, res) => {
    const { nome, comandante, formato, cartas } = req.body;

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O campo 'nome' é obrigatório e deve ser um texto válido." });
    }

    if (!comandante || typeof comandante !== "string" || comandante.trim() === "") {
        return res.status(400).json({ erro: "O campo 'comandante' é obrigatório." });
    }

    const novoDeck = {
        id: proximoId++,
        nome: nome.trim(),
        comandante: comandante.trim(),
        formato: formato ? String(formato).trim() : "Commander",
        cartas: Array.isArray(cartas) ? cartas : []
    };

    decks.push(novoDeck);
    return res.status(201).json(novoDeck);
};

const atualizarDeck = (req, res) => {
    const id = Number(req.params.id);
    const index = decks.findIndex(d => d.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Deck não encontrado." });
    }

    const { nome, comandante, formato, cartas } = req.body;

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O campo 'nome' é obrigatório para atualização." });
    }

    decks[index] = {
        ...decks[index],
        nome: nome.trim(),
        comandante: comandante ? String(comandante).trim() : decks[index].comandante,
        formato: formato ? String(formato).trim() : decks[index].formato,
        cartas: Array.isArray(cartas) ? cartas : decks[index].cartas
    };

    return res.status(200).json(decks[index]);
};

const removerDeck = (req, res) => {
    const id = Number(req.params.id);
    const index = decks.findIndex(d => d.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Deck não encontrado." });
    }

    decks.splice(index, 1);
    return res.status(204).send();
};

module.exports = {
    listarDecks,
    buscarDeckPorId,
    criarDeck,
    atualizarDeck,
    removerDeck
};