const express = require("express");
const cors = require("cors");
const decksRoutes = require("./src/routes/decks.routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/decks", decksRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
});

app.listen(PORT, () => {
    console.log(`Servidor Deckonomicon a correr em http://localhost:${PORT}`);
});