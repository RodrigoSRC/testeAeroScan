# Teste AeroScan

## Setup

Requisitos: Node.js 22 ou superior, pnpm 10 e Docker Desktop.

```bash
corepack enable
pnpm install
Copy-Item .env.example .env
docker compose up -d mongodb
pnpm dev
```

O backend fica disponível em `http://localhost:3000` e o frontend em
`http://localhost:5173`. A rota temporária de verificação do backend é
`GET /health`.

## Backend

A API usa MongoDB e expõe a documentação OpenAPI em `http://localhost:3000/docs`.

- `POST /occurrences`: registra uma ocorrência com `siteId`, `droneId`, `type`, `severity` e `detectedAt`. Uma ocorrência aberta do mesmo site e tipo nos dez minutos anteriores é agrupada, incrementando `count` e a severidade até 5.
- `GET /occurrences?status=&siteId=`: lista ocorrências por `severity × peso do tipo`, desempate pela detecção mais recente.
- `PATCH /occurrences/:id/status`: avança `open → acknowledged → resolved`; a transição para `resolved` exige `note` e transições inválidas retornam 409.

Para carregar dados de demonstração com o MongoDB em execução:

```bash
pnpm --filter api seed
```

## Como usei IA

Ferramentas utilizadas: Codex para leitura do enunciado, desenho da arquitetura, implementação e revisão; Jest para validar as regras de negócio.

Exemplo de prompt: “Implemente a regra de agrupamento de ocorrências abertas do mesmo site e tipo nos últimos dez minutos, incrementando `count` e limitando `severity` a 5.”

Um erro corrigido durante o desenvolvimento foi a escolha inicial de PostgreSQL no setup; o enunciado exige MongoDB, então a infraestrutura foi ajustada para MongoDB/Mongoose antes da API.

## Premissas

- `detectedAt` da nova ocorrência define a janela de dez minutos usada para agrupamento.
- A ocorrência agrupada mantém os dados da primeira ocorrência e atualiza apenas `count` e `severity`.
- A listagem retorna `priority` como campo calculado para tornar a ordenação explícita.
- O seed é destinado apenas ao ambiente local e limpa as ocorrências existentes antes de inserir exemplos.

Comandos úteis:

```bash
pnpm build
pnpm test
pnpm lint
docker compose down
```
