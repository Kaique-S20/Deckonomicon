# Etapa 07 — Persistência e CRUD com Banco de Dados

Documentação da implementação de persistência real no back-end do **Deckonomicon** (gerenciador de decks de *Magic: The Gathering*), substituindo o armazenamento temporário em memória por um banco de dados relacional.

---

## 1. Escolha do Banco de Dados e Justificativa

Para a persistência dos dados foi escolhido o **PostgreSQL** (Sistema Gerenciador de Banco de Dados Relacional), executado via **Docker Compose** com o driver oficial `pg` no Node.js.

### Por que PostgreSQL?
* **Integridade Referencial:** O domínio do projeto possui uma relação direta entre baralhos (`decks`) e suas cartas (`cartas`). O uso de chaves estrangeiras (`FOREIGN KEY`) com `ON DELETE CASCADE` garante consistência automática, impedindo que cartas fiquem órfãs ao excluir um deck.
* **Transações (ACID):** Operações de criação e atualização envolvem duas tabelas simultaneamente. O suporte nativo a transações (`BEGIN`, `COMMIT`, `ROLLBACK`) garante atomicidade: caso ocorra falha ao inserir uma carta, o cadastro do deck é revertido integralmente.
* **Validação no Nível de Dados:** Restrições estruturais como `NOT NULL`, `DEFAULT` e `CHECK (quantidade > 0)` protegem a integridade dos registros diretamente no banco, complementando as validações da API.
* **Reprodutibilidade:** A utilização da imagem oficial `postgres:16-alpine` via Docker permite subir o ambiente e inicializar o esquema de tabelas automaticamente com um único comando.

---

## 2. Arquitetura e Desacoplamento

Para evitar acoplamento direto entre a API HTTP e o banco de dados, o back-end foi organizado em camadas com responsabilidades bem definidas:

```text
routes  ──▶  controllers (HTTP, validações, status)  ──▶  repositories (SQL / queries)  ──▶  connection (Pool pg)  ──▶  PostgreSQL
```

* **`src/routes/decks.routes.js`**: Define os endpoints REST e os vincula aos métodos do controller.
* **`src/controllers/decks.controller.js`**: Recebe requisições HTTP, valida parâmetros/corpo da requisição, aciona o repositório e trata erros de persistência. Não possui nenhuma instrução SQL.
* **`src/repositories/decks.repository.js`**: Isola todo o acesso ao banco de dados, utilizando queries parametrizadas (prevenção contra SQL Injection) e transações.
* **`src/database/connection.js`**: Gerencia o `Pool` de conexões com o PostgreSQL a partir das variáveis de ambiente (`.env`).
* **`src/database/init.sql`**: Script DDL executado automaticamente na inicialização do container para criação das tabelas.

---

## 3. Modelo do Banco de Dados

### Diagrama Entidade-Relacionamento (DER)

```text
+-----------------------------------+            +-----------------------------------+
|               decks               |            |              cartas               |
+-----------------------------------+            +-----------------------------------+
| PK  id          SERIAL            | 1        N | PK  id          SERIAL            |
|     nome        VARCHAR(100) NN   |<-----------| FK  deck_id     INTEGER NN        |
|     comandante  VARCHAR(100) NN   |            |     nome        VARCHAR(100) NN   |
|     formato     VARCHAR(50)  NN   |            |     quantidade  INTEGER NN (> 0)  |
|     criado_em   TIMESTAMP         |            +-----------------------------------+
+-----------------------------------+
```

### Script SQL (`src/database/init.sql`)

```sql
CREATE TABLE IF NOT EXISTS decks (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    comandante VARCHAR(100) NOT NULL,
    formato VARCHAR(50) NOT NULL DEFAULT 'Commander',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cartas (
    id SERIAL PRIMARY KEY,
    deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0)
);
```

---

## 4. Descrição das Entidades e Relacionamentos

### Entidade `decks`
Armazena as informações principais de cada baralho cadastrado.

| Coluna       | Tipo           | Restrições / Padrão                      | Descrição                                    |
| :----------- | :------------- | :--------------------------------------- | :------------------------------------------- |
| `id`         | `SERIAL`       | `PRIMARY KEY`                            | Identificador único auto-incrementado.       |
| `nome`       | `VARCHAR(100)` | `NOT NULL`                               | Nome do deck.                                |
| `comandante` | `VARCHAR(100)` | `NOT NULL`                               | Nome da criatura comandante do deck.         |
| `formato`    | `VARCHAR(50)`  | `NOT NULL`, `DEFAULT 'Commander'`        | Formato de jogo (ex.: Commander, Standard).  |
| `criado_em`  | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP`              | Data e hora de criação do registro.          |

### Entidade `cartas`
Armazena as cartas pertencentes a cada baralho.

| Coluna       | Tipo           | Restrições / Padrão                                   | Descrição                                        |
| :----------- | :------------- | :---------------------------------------------------- | :----------------------------------------------- |
| `id`         | `SERIAL`       | `PRIMARY KEY`                                         | Identificador único auto-incrementado.           |
| `deck_id`    | `INTEGER`      | `NOT NULL`, `REFERENCES decks(id) ON DELETE CASCADE`  | Chave estrangeira vinculada ao deck proprietário.|
| `nome`       | `VARCHAR(100)` | `NOT NULL`                                            | Nome da carta.                                   |
| `quantidade` | `INTEGER`      | `NOT NULL`, `DEFAULT 1`, `CHECK (quantidade > 0)`     | Quantidade de cópias da carta no deck.           |

### Relacionamento
* **Cardinalidade `1:N` (Um para Muitos):** Um registro em `decks` pode estar associado a zero, uma ou várias linhas em `cartas`. Cada linha em `cartas` pertence obrigatoriamente a um único deck.
* **Integridade na Exclusão (`ON DELETE CASCADE`):** Ao remover um deck da tabela `decks`, o PostgreSQL remove automaticamente todas as cartas relacionadas na tabela `cartas`.

---

## 5. Instruções para Criação e Execução do Banco

### Pré-requisitos
* **Node.js** (v18+)
* **Docker** e **Docker Compose**

### Passo a passo

1. **Acesse a pasta do back-end e instale as dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   Crie o arquivo `.env` na pasta `backend/` (ou copie do `.env.example`):
   ```env
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=deckonomicon
   ```
   > *Nota:* A porta externa `5433` é utilizada por padrão para evitar conflitos com eventuais instâncias locais do PostgreSQL na porta `5432`.

3. **Suba o container do PostgreSQL:**
   ```bash
   docker compose up -d
   ```
   Na primeira inicialização, o volume persistente `postgres_data` é criado e o arquivo `src/database/init.sql` é executado automaticamente.

4. **Verifique se as tabelas foram criadas (opcional):**
   ```bash
   docker exec -it deckonomicon_db psql -U postgres -d deckonomicon -c "\dt"
   ```

5. **Inicie o servidor da API:**
   ```bash
   node server.js
   ```
   A API ficará disponível em `http://localhost:3000/api/decks`.

---

## 6. Validações e Tratamento de Erros

* **Validações na API:**
  * `id` de rota deve ser um número inteiro positivo (caso contrário retorna `400 Bad Request`).
  * `nome` e `comandante` são obrigatórios e devem ser strings não vazias.
  * `cartas` (quando enviado) deve ser um array válido, com nome preenchido e `quantidade` inteira maior que zero.
* **Tratamento de Erros de Persistência:**
  * Todas as operações assíncronas no controller são protegidas por blocos `try/catch`.
  * Violações de restrições do PostgreSQL (`23514` CHECK, `23502` NOT NULL, `22P02` tipo inválido) retornam `400 Bad Request`.
  * Falhas de conexão ou erros inesperados no banco retornam `500 Internal Server Error` sem interromper a execução do servidor.

---

## 7. Exemplos de Operações CRUD

### 7.1 Criar Deck (`POST /api/decks`)

**Requisição:**
```bash
curl -i -X POST http://localhost:3000/api/decks \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Fome Insaciável",
    "comandante": "Ygra, Eater of All",
    "formato": "Commander",
    "cartas": [
      {"nome": "Sol Ring", "quantidade": 1},
      {"nome": "Swamp", "quantidade": 15}
    ]
  }'
```

**Resposta (`201 Created`):**
```json
{
  "id": 1,
  "nome": "Fome Insaciável",
  "comandante": "Ygra, Eater of All",
  "formato": "Commander",
  "criado_em": "2026-11-27T01:49:49.833Z",
  "cartas": [
    { "id": 1, "nome": "Sol Ring", "quantidade": 1 },
    { "id": 2, "nome": "Swamp", "quantidade": 15 }
  ]
}
```

---

### 7.2 Listar Todos os Decks (`GET /api/decks`)

**Requisição:**
```bash
curl -i http://localhost:3000/api/decks
```

**Resposta (`200 OK`):**
```json
[
  {
    "id": 1,
    "nome": "Fome Insaciável",
    "comandante": "Ygra, Eater of All",
    "formato": "Commander",
    "criado_em": "2026-11-27T01:49:49.833Z",
    "cartas": [
      { "id": 1, "nome": "Sol Ring", "quantidade": 1 },
      { "id": 2, "nome": "Swamp", "quantidade": 15 }
    ]
  }
]
```

---

### 7.3 Buscar Deck por ID (`GET /api/decks/:id`)

**Requisição:**
```bash
curl -i http://localhost:3000/api/decks/1
```

**Resposta (`200 OK`):**
```json
{
  "id": 1,
  "nome": "Fome Insaciável",
  "comandante": "Ygra, Eater of All",
  "formato": "Commander",
  "criado_em": "2026-11-27T01:49:49.833Z",
  "cartas": [
    { "id": 1, "nome": "Sol Ring", "quantidade": 1 },
    { "id": 2, "nome": "Swamp", "quantidade": 15 }
  ]
}
```
*(Retorna `404 Not Found` caso o ID não exista).*

---

### 7.4 Atualizar Deck (`PUT /api/decks/:id`)

**Requisição:**
```bash
curl -i -X PUT http://localhost:3000/api/decks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Fome Insaciável v2",
    "comandante": "Ygra, Eater of All",
    "formato": "Commander",
    "cartas": [
      {"nome": "Sol Ring", "quantidade": 1},
      {"nome": "Arcane Signet", "quantidade": 1},
      {"nome": "Forest", "quantidade": 14}
    ]
  }'
```

**Resposta (`200 OK`):**
```json
{
  "id": 1,
  "nome": "Fome Insaciável v2",
  "comandante": "Ygra, Eater of All",
  "formato": "Commander",
  "criado_em": "2026-11-27T01:49:49.833Z",
  "cartas": [
    { "id": 3, "nome": "Sol Ring", "quantidade": 1 },
    { "id": 4, "nome": "Arcane Signet", "quantidade": 1 },
    { "id": 5, "nome": "Forest", "quantidade": 14 }
  ]
}
```

---

### 7.5 Remover Deck (`DELETE /api/decks/:id`)

**Requisição:**
```bash
curl -i -X DELETE http://localhost:3000/api/decks/1
```

**Resposta (`204 No Content`):**
Sem corpo na resposta. O deck e todas as suas cartas vinculadas são removidos permanentemente do PostgreSQL via `ON DELETE CASCADE`.