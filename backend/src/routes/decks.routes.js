const express = require("express")
const router = express.Router()
const decksController = require("../controllers/decks.controller")

router.get("/", decksController.listarDecks);
router.get("/:id", decksController.buscarDeckPorId);
router.post("/", decksController.criarDeck);
router.put("/:id", decksController.atualizarDeck);
router.delete("/:id", decksController.removerDeck);

module.exports = router;