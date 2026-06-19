# Roadmap

## Histórias atendidas

Cada item do enunciado e onde ficou:

- API pública: o provider da Rest Countries em `infrastructure/http`. Como a v3.1 saiu do ar e a v5 passou a exigir key, ele usa a API quando existe `COUNTRIES_API_KEY` e um snapshot local quando não existe.
- Auth JWT: registro e login em `/auth`, senha com bcrypt e dois middlewares, um valida o token e outro checa o papel.
- Listagem com filtros: `GET /countries` por região, sub-região, idioma, moeda e nome, com ordenação e paginação.
- Usuários: CRUD em `/users` mais a listagem com filtros e paginação.
- Logs: um middleware grava toda requisição e o `GET /logs` consulta por usuário, rota, método e período.

A base disso é a separação em camadas (o domínio não depende de framework), a validação com Zod e um handler de erro único.

## O que faria com mais tempo

Na ordem que eu pegaria:

1. Refresh token. O access token é curto e não dá pra renovar sem refazer login.
2. Rate limit no login, que é o ponto mais exposto a brute force.
3. Um Postgres de teste com Testcontainers pra cobrir as queries do Prisma, que hoje só os repositórios em memória exercitam.

## Melhorias que ficaram anotadas

Duas que considerei mas não entraram: tirar a escrita do log do caminho da requisição (hoje é fire-and-forget no evento `finish`, funciona mas prende a auditoria à resposta), e trocar a paginação dos logs por cursor quando a tabela crescer.
