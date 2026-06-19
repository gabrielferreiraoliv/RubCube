# RubCube - API de países

API em Node/TypeScript com autenticação JWT, gestão de usuários, listagem de países a partir de uma fonte pública e registro de todas as requisições.

## Como rodar

Com Docker é o caminho mais curto. Ele sobe o banco e a API juntos e roda as migrations no boot:

```bash
docker compose up --build
```

A API fica em `http://localhost:3000`.

Sem Docker, precisa de Node 20+ e um Postgres acessível:

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed          # cria o admin admin@rubcube.com / admin123
npm run dev
```

Para rodar os testes:

```bash
npm test
```

Os testes de integração usam repositórios em memória, então rodam sem precisar de banco no ar.

## Stack

TypeScript com Express, Postgres pelo Prisma, JWT (`jsonwebtoken`) e bcrypt para as senhas, Zod na validação e Jest com Supertest nos testes. A documentação da API sai do Swagger, gerada a partir dos mesmos schemas Zod da validação.

O projeto está em Clean Architecture: o domínio e os casos de uso não importam Express, Prisma ou Axios. Tudo que é externo entra por uma interface e é montado em `src/container.ts`. É o que permite subir a suíte de integração com repositórios em memória.

```
src/
  domain/         entidades, erros e contratos (repositórios, providers)
  application/    casos de uso e ports (PasswordHasher, TokenService)
  infrastructure/ prisma, jwt, bcrypt, cache, provider HTTP, logger
  presentation/   express: rotas, controllers, middlewares, schemas
  container.ts    montagem das dependências
  main.ts         sobe o servidor
```

## A fonte de países

O enunciado sugere a [Rest Countries](https://restcountries.com/). No meio do teste a v3.1 foi descontinuada e a v5 passou a exigir API key. Para não depender disso na hora de avaliar, o provider trabalha em dois modos: havendo `COUNTRIES_API_KEY`, ele consome a v5 (header `Authorization: Bearer`) e guarda o resultado em cache; sem a chave, ou se a API cair, ele usa um snapshot local dos 250 países, que é a mesma base que alimenta a Rest Countries. O filtro e a paginação rodam igual nos dois casos, sobre os dados já normalizados.

## Documentação (Swagger)

Com a API no ar:

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs.json`

Clique em **Authorize**, cole o token e dá para testar as rotas protegidas pela própria interface.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP. |
| `DATABASE_URL` | obrigatória | Conexão do Postgres. |
| `JWT_SECRET` | obrigatória | Segredo de assinatura do JWT. |
| `JWT_EXPIRES_IN` | `1h` | Expiração do token. |
| `BCRYPT_SALT_ROUNDS` | `10` | Custo do hash. |
| `COUNTRIES_API_URL` | `https://restcountries.com/v5` | Base da API de países. |
| `COUNTRIES_API_KEY` | opcional | Chave da Rest Countries v5. Sem ela, usa o snapshot. |
| `COUNTRIES_CACHE_TTL_MS` | `600000` | TTL do cache de países. |

## Quem acessa o quê

`/users` e `/countries` exigem token. Criar e remover usuário, além de consultar `/logs`, são restritos a `ADMIN`. O `/auth/register` é público e sempre cria usuário comum (`USER`).

## Exemplos

Base `http://localhost:3000`. As listagens devolvem `{ data, total, page, pageSize, totalPages }`.

Cadastro e login:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@example.com","password":"password123"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rubcube.com","password":"admin123"}'
```

Guarde o token em `TOKEN=<token>` e use nas chamadas seguintes.

Países, combinando região e idioma, ordenado por população:

```bash
curl "http://localhost:3000/countries?region=Europe&language=french&sortBy=population&order=desc&page=1&pageSize=5" \
  -H "Authorization: Bearer $TOKEN"

curl "http://localhost:3000/countries?currency=BRL" -H "Authorization: Bearer $TOKEN"
```

Filtros: `name`, `region`, `subregion`, `language`, `currency`. Ordenação por `sortBy` (`name`, `population` ou `area`) e `order` (`asc`/`desc`).

Usuários:

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"password123","role":"USER"}'

curl "http://localhost:3000/users?role=USER&name=joa&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/users/<id> -H "Authorization: Bearer $TOKEN"

curl -X PATCH http://localhost:3000/users/<id> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"João Atualizado"}'

curl -X DELETE http://localhost:3000/users/<id> -H "Authorization: Bearer $TOKEN"
```

Logs (cada requisição é gravada com usuário, método, rota, status, duração, IP, user-agent e data):

```bash
curl "http://localhost:3000/logs?endpoint=/countries&method=GET&from=2026-01-01&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

Health check:

```bash
curl http://localhost:3000/health
```

## Erros

Toda resposta de erro tem o mesmo formato:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request payload", "details": [] } }
```

| Código | HTTP |
| --- | --- |
| `VALIDATION_ERROR` | 422 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `UPSTREAM_SERVICE_ERROR` | 502 |
| `INTERNAL_ERROR` | 500 |

## Evidências

Suíte de testes rodando sem banco:

```
Test Suites: 9 passed, 9 total
Tests:       26 passed, 26 total
```

Resposta de `GET /countries?region=Europe&language=french&sortBy=population&order=desc&page=1&pageSize=3`:

```json
{
  "data": [
    {
      "name": "France",
      "officialName": "French Republic",
      "cca2": "FR",
      "cca3": "FRA",
      "region": "Europe",
      "subregion": "Western Europe",
      "capital": ["Paris"],
      "population": 66977107,
      "area": 551695,
      "languages": ["French"],
      "currencies": ["EUR"],
      "flag": "🇫🇷"
    }
  ],
  "total": 7,
  "page": 1,
  "pageSize": 3,
  "totalPages": 3
}
```

Resposta de `GET /logs?endpoint=/countries&method=GET`:

```json
{
  "data": [
    {
      "method": "GET",
      "endpoint": "/countries",
      "statusCode": 200,
      "durationMs": 7,
      "userId": "07af3d40-8e5f-4f29-94a9-2738a2b7b90a",
      "createdAt": "2026-06-18T12:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

Rodei o fluxo inteiro com o `docker compose` contra um Postgres real: cadastro (201), e-mail repetido (409), payload inválido (422), chamada sem token (401), papel sem permissão (403), o CRUD de usuários e os logs gravando a duração de cada chamada.

## Dificuldades e aprendizados

A maior surpresa foi a Rest Countries mudar no meio do caminho: a v3.1 saiu do ar e a v5 passou a pedir API key. Como isso emperraria quem fosse só rodar o projeto, deixei o provider com fallback para um snapshot local. Resolveu o problema imediato e ainda deixou claro o ganho de manter a integração atrás de uma interface.

Outro ponto foi o Prisma no `node:22-alpine`, que quebra o engine por causa do OpenSSL/musl. Troquei para `node:22-slim` (Debian, com `openssl`) e o `migrate deploy` voltou a rodar no boot do container.

Manter o domínio sem conhecer o Prisma também valeu na hora de testar: os testes de integração sobem com repositórios em memória, então o `npm test` roda em qualquer máquina sem subir infraestrutura.
