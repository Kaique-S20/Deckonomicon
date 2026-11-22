# Deckonomicon — API REST (Etapa 06)

API REST desenvolvida em **Node.js** com **Express** para gerenciar o recurso principal de **Decks** da aplicação Deckonomicon. Os dados são mantidos em memória durante a execução do servidor e todas as requisições e respostas utilizam o formato **JSON**.

---

## Estrutura do Projeto

```text
backend/
├── src/
│   ├── controllers/
│   │   └── decks.controller.js   # Lógica do CRUD, validações e status HTTP
│   └── routes/
│       └── decks.routes.js       # Definição das rotas do recurso /api/decks
├── server.js                     # Inicialização do Express, CORS e tratamento de rotas
├── package.json
└── README.md
```

---

## Instruções para Execução

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **npm**

### Passo a passo

1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências (`express` e `cors`):
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   node server.js
   ```

O servidor ficará disponível em: `http://localhost:3000`

---

## Documentação dos Endpoints

**URL Base:** `http://localhost:3000/api/decks`

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/decks` | Lista todos os decks cadastrados | `200 OK` |
| `GET` | `/api/decks/:id` | Busca um deck específico pelo ID | `200 OK` |
| `POST` | `/api/decks` | Cria um novo deck | `201 Created` |
| `PUT` | `/api/decks/:id` | Atualiza os dados de um deck existente | `200 OK` |
| `DELETE` | `/api/decks/:id` | Remove um deck pelo ID | `204 No Content` |

---

### 1. Listar todos os decks
- **Método:** `GET /api/decks`

**Exemplo de requisição (`curl`):**
```bash
curl -i http://localhost:3000/api/decks
```

**Exemplo de resposta (`200 OK`):**
```json
[
  {
    "id": 1,
    "nome": "Fome Insaciável",
    "comandante": "Ygra, Eater of All",
    "formato": "Commander",
    "cartas": ["Sol Ring", "Arcane Signet", "Swamp", "Forest"]
  }
]
```

---

### 2. Buscar deck por ID
- **Método:** `GET /api/decks/:id`

**Exemplo de requisição (`curl`):**
```bash
curl -i http://localhost:3000/api/decks/1
```

**Exemplo de resposta (`200 OK`):**
```json
{
  "id": 1,
  "nome": "Fome Insaciável",
  "comandante": "Ygra, Eater of All",
  "formato": "Commander",
  "cartas": ["Sol Ring", "Arcane Signet", "Swamp", "Forest"]
}
```

**Exemplo de resposta de erro (`404 Not Found`):**
```json
{
  "erro": "Deck não encontrado."
}
```

---

### 3. Criar novo deck
- **Método:** `POST /api/decks`
- **Campos obrigatórios:** `nome` (string), `comandante` (string)
- **Campos opcionais:** `formato` (padrão: `"Commander"`), `cartas` (array de strings, padrão: `[]`)

**Exemplo de requisição (`curl`):**
```bash
curl -i -X POST http://localhost:3000/api/decks \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Fúria de Korvold",
    "comandante": "Korvold, Fae-Cursed King",
    "formato": "Commander",
    "cartas": ["Sol Ring", "Cultivate"]
  }'
```

**Exemplo de resposta (`201 Created`):**
```json
{
  "id": 2,
  "nome": "Fúria de Korvold",
  "comandante": "Korvold, Fae-Cursed King",
  "formato": "Commander",
  "cartas": ["Sol Ring", "Cultivate"]
}
```

**Exemplo de resposta de erro (`400 Bad Request`):**
```json
{
  "erro": "O campo 'nome' é obrigatório e deve ser um texto válido."
}
```

---

### 4. Atualizar deck existente
- **Método:** `PUT /api/decks/:id`
- **Campo obrigatório:** `nome` (string)

**Exemplo de requisição (`curl`):**
```bash
curl -i -X PUT http://localhost:3000/api/decks/2 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Fúria de Korvold v2",
    "comandante": "Korvold, Fae-Cursed King",
    "formato": "Commander",
    "cartas": ["Sol Ring", "Cultivate", "Arcane Signet"]
  }'
```

**Exemplo de resposta (`200 OK`):**
```json
{
  "id": 2,
  "nome": "Fúria de Korvold v2",
  "comandante": "Korvold, Fae-Cursed King",
  "formato": "Commander",
  "cartas": ["Sol Ring", "Cultivate", "Arcane Signet"]
}
```

---

### 5. Remover deck
- **Método:** `DELETE /api/decks/:id`

**Exemplo de requisição (`curl`):**
```bash
curl -i -X DELETE http://localhost:3000/api/decks/2
```

**Exemplo de resposta (`204 No Content`):**
- Corpo vazio.

**Exemplo de resposta de erro (`404 Not Found`):**
```json
{
  "erro": "Deck não encontrado."
}
```

---

## Códigos HTTP Utilizados

- **`200 OK`**: Consulta ou atualização realizada com sucesso.
- **`201 Created`**: Novo recurso criado com sucesso.
- **`204 No Content`**: Recurso removido com sucesso (sem corpo na resposta).
- **`400 Bad Request`**: Erro de validação nos dados enviados pelo cliente.
- **`404 Not Found`**: Recurso ou rota não encontrados.

---

## Testes via Postman / Insomnia

A coleção pronta para importação está disponível em:

`docs/deckonomicon-api.postman_collection.json`

Para testar:
1. Inicie o servidor com `node server.js`.
2. Importe o arquivo `.json` no **Postman** ou **Insomnia**.
3. Execute as requisições em ordem (1 a 7) para validar o CRUD completo e os cenários de erro (`400` e `404`).