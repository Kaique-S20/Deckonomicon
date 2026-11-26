const pool = require("../database/connection");

const listarTodos = async () => {
    const query = `
        SELECT
            d.id,
            d.nome,
            d.comandante,
            d.formato,
            d.criado_em,
            COALESCE(
                json_agg(
                    json_build_object('id', c.id, 'nome', c.nome, 'quantidade', c.quantidade)
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
            ) AS cartas
        FROM decks d
        LEFT JOIN cartas c ON d.id = c.deck_id
        GROUP BY d.id
        ORDER BY d.id;
    `;
    const result = await pool.query(query);
    return result.rows;
};

const buscarPorId = async (id) => {
    const query = `
        SELECT
            d.id,
            d.nome,
            d.comandante,
            d.formato,
            d.criado_em,
            COALESCE(
                json_agg(
                    json_build_object('id', c.id, 'nome', c.nome, 'quantidade', c.quantidade)
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
            ) AS cartas
        FROM decks d
        LEFT JOIN cartas c ON d.id = c.deck_id
        WHERE d.id = $1
        GROUP BY d.id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

const criar = async ({ nome, comandante, formato, cartas = [] }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const deckResult = await client.query(
            "INSERT INTO decks (nome, comandante, formato) VALUES ($1, $2, $3) RETURNING id",
            [nome, comandante, formato]
        );
        const deckId = deckResult.rows[0].id;

        for (const carta of cartas) {
            const nomeCarta = typeof carta === "string" ? carta : carta.nome;
            const quantidade = typeof carta === "object" && carta.quantidade ? Number(carta.quantidade) : 1;

            await client.query(
                "INSERT INTO cartas (deck_id, nome, quantidade) VALUES ($1, $2, $3)",
                [deckId, nomeCarta.trim(), quantidade]
            );
        }

        await client.query("COMMIT");
        return await buscarPorId(deckId);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const atualizar = async (id, { nome, comandante, formato, cartas }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const deckResult = await client.query(
            `UPDATE decks
             SET nome = $1,
                 comandante = COALESCE($2, comandante),
                 formato = COALESCE($3, formato)
             WHERE id = $4
             RETURNING id`,
            [nome, comandante || null, formato || null, id]
        );

        if (deckResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        if (Array.isArray(cartas)) {
            await client.query("DELETE FROM cartas WHERE deck_id = $1", [id]);

            for (const carta of cartas) {
                const nomeCarta = typeof carta === "string" ? carta : carta.nome;
                const quantidade = typeof carta === "object" && carta.quantidade ? Number(carta.quantidade) : 1;

                await client.query(
                    "INSERT INTO cartas (deck_id, nome, quantidade) VALUES ($1, $2, $3)",
                    [id, nomeCarta.trim(), quantidade]
                );
            }
        }

        await client.query("COMMIT");
        return await buscarPorId(id);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const remover = async (id) => {
    const result = await pool.query("DELETE FROM decks WHERE id = $1 RETURNING id", [id]);
    return result.rowCount > 0;
};

module.exports = {
    listarTodos,
    buscarPorId,
    criar,
    atualizar,
    remover
};