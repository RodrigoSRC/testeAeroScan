# Teste AeroScan

Aplicação de triagem de ocorrências detectadas por drones, composta por uma API NestJS com MongoDB e uma interface React/Vite.

## Tecnologias e arquitetura

- **Backend:** TypeScript, Node.js, NestJS, Mongoose e Swagger.
- **Banco:** MongoDB 7, executado por Docker Compose.
- **Frontend:** React, Vite, TanStack React Query, React Hook Form e Zod.
- `apps/api` contém os três endpoints e as regras de agrupamento, prioridade e transição de status.
- `apps/web` contém a tela de triagem e o cliente HTTP usado para consultar e atualizar ocorrências.
- O frontend compilado é gerado em `apps/web/dist`.

## Pré-requisitos

- Node.js 22 ou superior.
- Docker Desktop em execução.
- Corepack habilitado (incluído nas versões atuais do Node.js).

## Configuração inicial

Na raiz do projeto:

```powershell
corepack enable
corepack pnpm install
Copy-Item .env.example .env
"VITE_API_URL=http://localhost:3000" | Set-Content apps\web\.env.local
```

O arquivo `apps/web/.env.local` é local e não deve ser commitado. Ele informa ao Vite que a API está na porta `3000`.

## Executar localmente

Suba o MongoDB e aguarde o status `healthy`:

```powershell
docker compose up -d mongodb
docker compose ps
```

Para restaurar dados de demonstração, execute o seed depois que o MongoDB estiver saudável:

```powershell
corepack pnpm --filter api seed
```

Inicie backend e frontend juntos:

```powershell
corepack pnpm dev
```

Endereços locais:

- Frontend: <http://localhost:5173>
- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>
- Health check: <http://localhost:3000/health>

Para parar os processos, pressione `Ctrl+C`. Para parar o MongoDB:

```powershell
docker compose down
```

## Endpoints

### Criar ou agrupar uma ocorrência

`POST /occurrences`

Corpo:

```json
{
  "siteId": "site-a",
  "droneId": "drone-01",
  "type": "intrusion",
  "severity": 4,
  "detectedAt": "2026-09-30T13:00:00.000Z"
}
```

Uma ocorrência aberta do mesmo site e tipo nos dez minutos anteriores é agrupada. Nesse caso, `count` aumenta e `severity` é incrementada até o limite 5.

### Listar ocorrências

`GET /occurrences`

Filtros opcionais:

```text
GET /occurrences?status=open
GET /occurrences?siteId=site-a
```

A resposta é ordenada por `severity × peso do tipo`; em caso de empate, a ocorrência mais recente vem primeiro. Os pesos são `intrusion: 3`, `perimeter_breach: 2`, `low_battery: 1` e `signal_loss: 1`.

### Atualizar status

`PATCH /occurrences/:id/status`

Corpos válidos:

```json
{ "status": "acknowledged" }
```

```json
{ "status": "resolved", "note": "Área verificada pela equipe" }
```

As transições permitidas são `open → acknowledged → resolved`. Resolver exige uma nota e transições inválidas retornam `409`. Não existe `GET /occurrences/:id/status`; depois do `PATCH`, consulte `GET /occurrences` para conferir o estado.

## Roteiro de validação manual

O Swagger em <http://localhost:3000/docs> permite executar todos os endpoints. O roteiro abaixo também funciona no PowerShell.

1. Confirme `GET /health` e `GET /occurrences`.
2. Execute `POST /occurrences` com uma ocorrência nova e guarde o campo `id`.
3. Envie o mesmo corpo novamente até confirmar que `count` aumenta e `severity` para em 5.
4. Teste `GET /occurrences?status=open` e `GET /occurrences?siteId=...`.
5. Execute `PATCH` para `acknowledged`.
6. Tente `resolved` sem `note` e confirme o `409`.
7. Execute `resolved` com uma nota e consulte a lista novamente.
8. No frontend, confirme a listagem, o filtro, o botão **Reconhecer**, o botão **Resolver**, a validação da nota e a exibição de ocorrências agrupadas.

Exemplo mínimo em PowerShell:

```powershell
$time = (Get-Date).ToUniversalTime().ToString("o")
$body = @{ siteId = "site-manual"; droneId = "drone-manual"; type = "intrusion"; severity = 3; detectedAt = $time } | ConvertTo-Json
$created = Invoke-RestMethod http://localhost:3000/occurrences -Method Post -ContentType "application/json" -Body $body
$id = $created.id

Invoke-RestMethod "http://localhost:3000/occurrences/$id/status" -Method Patch -ContentType "application/json" -Body (@{ status = "acknowledged" } | ConvertTo-Json)
Invoke-RestMethod "http://localhost:3000/occurrences/$id/status" -Method Patch -ContentType "application/json" -Body (@{ status = "resolved"; note = "Área verificada" } | ConvertTo-Json)
Invoke-RestMethod http://localhost:3000/occurrences
```

## Qualidade e build

```powershell
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

O build estático do frontend fica em `apps/web/dist`.

## Como usei IA

Ferramentas utilizadas: Codex para leitura do enunciado, desenho da arquitetura, implementação, revisão e elaboração dos testes. A IA foi usada como apoio, com validação local dos fluxos e correção manual dos problemas encontrados durante a integração.

## Premissas

- `detectedAt` define a janela de dez minutos usada no agrupamento.
- A ocorrência agrupada mantém os dados da primeira ocorrência e atualiza `count` e `severity`.
- `priority` é calculada na resposta para tornar a ordenação explícita.
- O seed é apenas para ambiente local e limpa as ocorrências existentes antes de inserir exemplos.
- A criação de ocorrências é exercitada pelo Swagger/API; a tela concentra os fluxos de triagem pedidos no PDF.
