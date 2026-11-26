const decksRepository = require("../repositories/decks.repository");

const validarId = (idParam) => {
    const id = Number(idParam);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const validarCartas = (cartas) => {
    if (!Array.isArray(cartas)) {
        return "O campo 'cartas' deve ser uma lista.";
    }

    for (const carta of cartas) {
        if (typeof carta === "string") {
            if (carta.trim() === "") {
                return "Cada carta deve ter um nome válido.";
            }
        } else if (typeof carta === "object" && carta !== null) {
            if (!carta.nome || typeof carta.nome !== "string" || carta.nome.trim() === "") {
                return "Cada carta deve ter um campo 'nome' válido.";
            }
            if (carta.quantidade !== undefined) {
                const qtd = Number(carta.quantidade);
                if (!Number.isInteger(qtd) || qtd <= 0) {
                    return "A quantidade de cada carta deve ser um número inteiro maior que zero.";
                }
            }
        } else {
            return "Formato de carta inválido.";
        }
    }

    return null;
};

const tratarErroPersistencia = (res, error) => {
    console.error("Erro de persistência:", error.message);

    if (error.code === "23514" || error.code === "23502" || error.code === "22P02") {
        return res.status(400).json({ erro: "Dados inválidos para persistência no banco de dados." });
    }

    return res.status(500).json({ erro: "Erro interno ao acessar o banco de dados." });
};

const listarDecks = async (req, res) => {
    try {
        const decks = await decksRepository.listarTodos();
        return res.status(200).json(decks);
    } catch (error) {
        return tratarErroPersistencia(res, error);
    }
};

const buscarDeckPorId = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) {
        return res.status(400).json({ erro: "O ID informado deve ser um número inteiro positivo." });
    }

    try {
        const deck = await decksRepository.buscarPorId(id);
        if (!deck) {
            return res.status(404).json({ erro: "Deck não encontrado." });
        }
        return res.status(200).json(deck);
    } catch (error) {
        return tratarErroPersistencia(res, error);
    }
};

const criarDeck = async (req, res) => {
    const { nome, comandante, formato, cartas } = req.body;

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O campo 'nome' é obrigatório e deve ser um texto válido." });
    }

    if (!comandante || typeof comandante !== "string" || comandante.trim() === "") {
        return res.status(400).json({ erro: "O campo 'comandante' é obrigatório e deve ser um texto válido." });
    }

    if (cartas !== undefined) {
        const erroCartas = validarCartas(cartas);
        if (erroCartas) {
            return res.status(400).json({ erro: erroCartas });
        }
    }

    try {
        const novoDeck = await decksRepository.criar({
            nome: nome.trim(),
            comandante: comandante.trim(),
            formato: formato && typeof formato === "string" && formato.trim() !== "" ? formato.trim() : "Commander",
            cartas: cartas || []
        });
        return res.status(201).json(novoDeck);
    } catch (error) {
        return tratarErroPersistencia(res, error);
    }
};

const atualizarDeck = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) {
        return res.status(400).json({ erro: "O ID informado deve ser um número inteiro positivo." });
    }

    const { nome, comandante, formato, cartas } = req.body;

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "O campo 'nome' é obrigatório e deve ser um texto válido." });
    }

    if (cartas !== undefined) {
        const erroCartas = validarCartas(cartas);
        if (erroCartas) {
            return res.status(400).json({ erro: erroCartas });
        }
    }

    try {
        const deckAtualizado = await decksRepository.atualizar(id, {
            nome: nome.trim(),
            comandante: comandante && typeof comandante === "string" ? comandante.trim() : null,
            formato: formato && typeof formato === "string" ? formato.trim() : null,
            cartas
        });

        if (!deckAtualizado) {
            return res.status(404).json({ erro: "Deck não encontrado." });
        }

        return res.status(200).json(deckAtualizado);
    } catch (error) {
        return tratarErroPersistencia(res, error);
    }
};

const removerDeck = async (req, res) => {
    const id = validarId(req.params.id);
    if (!id) {
        return res.status(400).json({ erro: "O ID informado deve ser um número inteiro positivo." });
    }

    try {
        const removido = await decksRepository.remover(id);
        if (!removido) {
            return res.status(404).json({ erro: "Deck não encontrado." });
        }
        return res.status(204).send();
    } catch (error) {
        return tratarErroPersistencia(res, error);
    }
};

module.exports = {
    listarDecks,
    buscarDeckPorId,
    criarDeck,
    atualizarDeck,
    removerDeck
};