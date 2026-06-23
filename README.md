# Auto Planner

Aplicação web para gerenciamento de manutenções de veículos, desenvolvida como projeto integrador da disciplina de Desenvolvimento de Sistemas Móveis e Distribuídos — SENAI/SC 2026/1.

## Arquitetura

```
Frontend (React + Vite) → Backend (Node.js + Express) → SQLite
                                      ↕
                                  RabbitMQ
                              (mensageria assíncrona)
```

## Pré-requisitos

- [Node.js](https://nodejs.org) v18 ou superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd auto-planner
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Instalar dependências do frontend

```bash
cd frontend
npm install
```

---

## Executando o projeto

### Passo 1 — Iniciar o RabbitMQ (Docker)

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

> Nas próximas vezes, se o container já existir:
> ```bash
> docker start rabbitmq
> ```

### Passo 2 — Iniciar o backend

```bash
cd backend
npm run dev
```

Saída esperada:
```
[RabbitMQ] Conectado | fila: maintenance_events
[RabbitMQ] Consumidor aguardando eventos...
[Server] Rodando na porta 3000
```

### Passo 3 — Iniciar o frontend

```bash
cd frontend
npm run dev
```

O navegador abre automaticamente em `http://localhost:5173`

---

## Acessos

| Serviço             | URL                    | Credenciais   |
|---------------------|------------------------|---------------|
| Frontend            | http://localhost:5173  | —             |
| Backend (API)       | http://localhost:3000  | —             |
| RabbitMQ Management | http://localhost:15672 | guest / guest |

---

## Utilitários

### Resetar senha de um usuário

```bash
cd backend
node reset-password.js seu@email.com novaSenha123
```

### Recriar o banco de dados (apaga todos os dados)

```bash
# Windows
cd backend
del data.db

# Linux/Mac
cd backend
rm data.db
```

---

## Funcionalidades

- Cadastro e autenticação de usuários com JWT
- Cadastro, edição e remoção de veículos
- Registro de manutenções por veículo (tipo, data, quilometragem, custo, status)
- Histórico de manutenções com estatísticas por veículo
- Mensageria assíncrona com RabbitMQ a cada evento de manutenção

## Tecnologias

| Camada     | Tecnologia                            |
|------------|---------------------------------------|
| Frontend   | React, Vite, TypeScript, React Router |
| Backend    | Node.js, Express, JWT, bcryptjs       |
| Banco      | SQLite (better-sqlite3)               |
| Mensageria | RabbitMQ (amqplib)                    |
