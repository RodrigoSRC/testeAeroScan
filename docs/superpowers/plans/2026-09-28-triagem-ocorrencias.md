# Triagem de Ocorrências Implementation Plan

> **For agentic workers:** Execute inline by default with superpowers:executing-plans. Use sub-agent workflows only when the user explicitly invokes a sub-agent skill. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o teste técnico de triagem de ocorrências com uma API documentada, persistência mínima, interface web para os fluxos pedidos e instruções reproduzíveis de execução.

**Architecture:** O projeto será um monorepo simples com `apps/api` e `apps/web`. A API concentra regras de negócio, validação e persistência; a interface web consome apenas os contratos HTTP publicados pela API. O banco roda localmente por Docker Compose para que o avaliador consiga iniciar o projeto com poucos comandos.

**Tech Stack:** TypeScript, NestJS, Mongoose, MongoDB, Jest/Supertest, React com Vite, React Query, React Hook Form, Zod, CSS Modules ou Tailwind CSS, Docker Compose e OpenAPI/Swagger.

## Global Constraints

- Os nomes, métodos HTTP, parâmetros, payloads e respostas devem ser copiados do PDF antes da implementação final; este plano não altera o contrato definido no enunciado.
- A API deve validar entrada e retornar códigos HTTP coerentes para sucesso, validação, recurso inexistente e erro interno.
- A regra de priorização/triagem deve ficar em um serviço de domínio testável, sem depender de HTTP ou banco.
- O frontend deve consumir a API por uma camada única de cliente, tratar carregamento/erro/vazio e permitir executar os fluxos solicitados no PDF.
- Segredos e URLs devem ser configuráveis por `.env.example`; nenhum segredo deve ser versionado.
- Cada branch deve terminar com testes e documentação suficientes para revisão independente.

---

### Task 1: Setup do repositório

**Branch:** `feat/setup`

**Files:**

- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`
- Create: `docker-compose.yml`, `.env.example`, `.gitignore`
- Modify: `README.md`

- [x] Definir Node.js LTS e pnpm como gerenciador único; adicionar scripts `dev`, `build`, `test`, `lint` e `format` no workspace.
- [x] Criar os dois aplicativos sem regra de negócio e verificar que API e frontend iniciam separadamente.
- [x] Adicionar MongoDB no `docker-compose.yml` com volume nomeado, healthcheck e variáveis lidas do ambiente.
- [x] Documentar instalação, cópia de `.env.example`, subida do banco e comandos de desenvolvimento.
- [x] Rodar `pnpm install`, `pnpm build` e `pnpm test` e registrar o resultado no commit.
- [x] Commitar como `chore: bootstrap monorepo and local infrastructure`.

### Task 2: Contrato e backend

**Branch:** `feat/backend` (criada a partir do commit de `feat/setup`)

**Files:**

- Create: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
- Create: `apps/api/src/occurrences/occurrences.module.ts`
- Create: `apps/api/src/occurrences/occurrences.controller.ts`
- Create: `apps/api/src/occurrences/occurrences.service.ts`
- Create: `apps/api/src/occurrences/domain/triage.service.ts`
- Create: `apps/api/src/occurrences/dto/*`
- Create: `apps/api/src/database/database.module.ts`, `apps/api/src/occurrences/schemas/occurrence.schema.ts`
- Create: `apps/api/src/occurrences/seed.ts`
- Create: `apps/api/test/occurrences.e2e-spec.ts`, `apps/api/test/triage.service.spec.ts`

- [x] Transcrever do PDF, no README da API, os três endpoints exatos: `POST /occurrences`, `GET /occurrences?status=&siteId=` e `PATCH /occurrences/:id/status`, com exemplos de request/response.
- [x] Modelar a entidade de ocorrência no Mongoose somente com os campos do enunciado (`siteId`, `droneId`, `type`, `severity`, `detectedAt`, `status`, `count`, `note`) e índices para agrupamento e filtros.
- [x] Escrever primeiro os testes unitários da regra de triagem para casos normais, limite e entrada inválida; confirmar falha inicial.
- [x] Implementar `TriageService` como função determinística para peso, prioridade, agrupamento e transições; depois conectar o serviço de aplicação ao MongoDB.
- [x] Implementar DTOs com `class-validator`, tratamento de `404` e respostas de erro consistentes.
- [x] Implementar os três endpoints do PDF, habilitar CORS configurável e publicar Swagger em `/docs`.
- [x] Criar seed pequeno e seguro para demonstração local; não usar dados pessoais reais.
- [x] Rodar `pnpm --filter api test`, `pnpm --filter api test:e2e` e `pnpm --filter api build`.
- [x] Commitar como `feat: implement occurrence triage api`.

### Task 3: Frontend

**Branch:** `feat/frontend` (criada a partir do commit de `feat/backend`)

**Files:**

- Create: `apps/web/src/App.tsx`, `apps/web/src/main.tsx`
- Create: `apps/web/src/api/occurrences.ts`
- Create: `apps/web/src/components/*`
- Create: `apps/web/src/pages/*`
- Create: `apps/web/src/styles/*`
- Create: `apps/web/src/types/*`

- [x] Definir tipos TypeScript a partir do contrato OpenAPI da API, sem duplicar regras de triagem no cliente.
- [x] Criar a tela principal com listagem, estado de carregamento, estado vazio, erro e indicação visual da prioridade/status.
- [x] Criar o formulário exigido pelo PDF com React Hook Form e validação Zod alinhada ao backend.
- [x] Encapsular chamadas em `src/api/occurrences.ts` e usar React Query para cache, refetch e invalidação após mutações.
- [x] Adicionar feedback de sucesso/erro e acessibilidade básica: labels, foco, navegação por teclado e contraste legível.
- [x] Rodar `pnpm --filter web build` e os testes automatizados da interface.
- [ ] Validar manualmente os fluxos contra a API local.
- [x] Commitar como `feat: add occurrence triage web interface`.

### Task 4: Integração e entrega

**Branch:** `main` após revisão dos três commits

- [ ] Subir MongoDB, executar seed, iniciar API e frontend e exercitar os três endpoints pelo Swagger e pela interface.
- [ ] Atualizar README com arquitetura, decisões, comandos, variáveis, exemplos e limitações conhecidas.
- [ ] Executar `pnpm lint`, `pnpm test`, `pnpm build` e uma verificação manual dos casos descritos no PDF.
- [ ] Revisar `git log --oneline --graph` para garantir histórico curto e compreensível; abrir PRs ou fazer merge na ordem setup → backend → frontend.

## Branch and commit sequence

```text
main
└── feat/setup      chore: bootstrap monorepo and local infrastructure
    └── feat/backend   feat: implement occurrence triage api
        └── feat/frontend  feat: add occurrence triage web interface
```

Se o processo exigir branches independentes, cada uma pode ser aberta a partir do commit anterior e integrada por PR. Para um teste de três endpoints, três branches tem valor como histórico e revisão; criar uma branch para cada endpoint aumentaria o custo sem melhorar a entrega.
