# Teste AeroScan

## Setup

Requisitos: Node.js 22 ou superior, pnpm 10 e Docker Desktop.

```bash
corepack enable
pnpm install
Copy-Item .env.example .env
docker compose up -d postgres
pnpm dev
```

O backend fica disponível em `http://localhost:3000` e o frontend em
`http://localhost:5173`. A rota temporária de verificação do backend é
`GET /health`.

Comandos úteis:

```bash
pnpm build
pnpm test
pnpm lint
docker compose down
```
