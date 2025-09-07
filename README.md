# URL Shortener API

## 📖 Função da API

Esta API tem como objetivo principal **encurtar URLs** e gerenciar esses links.  
Ela oferece as seguintes funcionalidades:

-  **Encurtar URLs**: qualquer usuário pode gerar um link curto a partir de uma URL original.  
-  **Associação a usuários**: se o usuário estiver autenticado, o link gerado será vinculado à sua conta.  
-  **Gerenciamento de links**: usuários autenticados podem listar, atualizar e remover (deleção lógica) os links que criaram.  
-  **Redirecionamento**: acessar a URL curta redireciona automaticamente para o endereço original.  
-  **Autenticação JWT**: apenas usuários autenticados podem atualizar ou deletar suas próprias URLs.  

Em resumo, a API funciona como um **serviço de encurtamento de links seguro**, com suporte a usuários e autenticação.

---

## 📦 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/)  
- [TypeORM](https://typeorm.io/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [Docker & Docker Compose](https://www.docker.com/)  
- [JWT](https://jwt.io/)  
- [Jest](https://jestjs.io/)  

---

## ⚙️ Pré-requisitos

- [Node.js (>= 20.x recomendado)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

## 🔧 Configuração de Variáveis de Ambiente

Antes de rodar o projeto, crie um arquivo `.env` na raiz com as seguintes variáveis:

```env
NODE_ENV=development
APP_PORT=8000

DB_HOST=db
DB_PORT=5432
DB_USER=username
DB_PASSWORD=password
DB_DATABASE=urlshort

JWT_SECRET=super-secret-jwt
JWT_EXPIRES_IN=1d
APP_URL=http://localhost:8000
```
---

## 📝 Endpoints principais da API

| Método | Rota             | Descrição                                    |
|--------|------------------|----------------------------------------------|
| POST   | /auth/register   | Criação de usuário                           |
| POST   | /auth/login      | Login e token JWT                            |
| GET    | /users/me        | Listar o usuário logado                      |
| PATCH  | /users/:userId   | Edição de usuário                            |
| DELETE | /users/:userId   | Soft delete de usuário                       |
| POST   | /urls            | Criação de URL encurtada                     |
| GET    | /urls            | Listar URLs encurtadas                       |
| PATCH  | /urls/:urlId     | Edição da origem de um URL encurtado         |
| DELETE | /urls/:urlId     | Soft delete de URL                           |

---

## 🐳 Como Rodar com Docker Compose
### Passo 1: Clone o projeto

```bash
$ git clone git@github.com:RobsonMT/Code-Challenge-Teddy.git
$ cd Code-Challenge-Teddy
```

### Passo 2: Suba os containers

```bash
$ docker-compose up --build
```

### O comando acima irá:
 - Criar e iniciar o banco de dados PostgreSQL
 - Construir o backend Nest e expor na porta 8000
   
### Passo 3: Para Parar os Containers

```bash
$ docker-compose down
```
---

## 🧪 Como Rodar os testes

```bash
$ npm run test
```

## 🧪 Como Rodar os testes com coverage

```bash
$ npm run test:cov
```
