# 🚀 Express TypeScript Boilerplate 2025

[![CI](https://github.com/edwinhern/express-typescript/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/ci.yml)

> **Hey There! 🙌  
> 🤾 Smash that ⭐️ button if you like this boilerplate!**

---

## 🌟 Introduction

Welcome to Express TypeScript Boilerplate 2025 – the robust, secure, and scalable starting point for backend web services using [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).

Designed for **production** and **rapid prototyping**, this boilerplate brings together best practices, modern tooling, and a full-featured API stack.

---

## 💡 Why Use This Boilerplate?

- **Fast project setup** – Get started with a ready-to-go architecture
- **Best practices** – Security, testing, validation, documentation, and more
- **Consistent code** – Linting, formatting, and short imports
- **Real-world features** – Auth, RBAC, validation, logging, OpenAPI, Docker, and more

---

## 🚀 Features & Functionality

### 📁 Folder Structure & Organization

- **Modular API structure** (`src/api`): Feature-based organization for scalability
- **Separation of concerns**: Models, services, controllers, routers, middlewares, and utilities are all cleanly separated
- **Short import paths** with path aliases (`@/`)

### ⚡ Modern Tooling

- **Node.js** (latest LTS) – Set via `.tool-versions`
- **TypeScript** strict mode
- **pnpm** for fast dependency management
- **Hot reload** with [`tsx`](https://www.npmjs.com/package/tsx)
- **Type checking** with `tsc`
- **Testing:** [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest)

### 🛡️ Security & Stability

- **Helmet** – Secure HTTP headers
- **CORS** – Configurable, strict cross-origin protection
- **Rate limiting** – Out-of-the-box rate limiting middleware
- **.env validation** – [Zod](https://zod.dev/) for environment safety

### 🧩 API & Validation

- **Unified service responses** – Consistent API via `ServiceResponse`
- **Input validation with [Zod](https://zod.dev/)** – Typed and runtime-checked
- **OpenAPI 3.1 docs** – Generated from Zod schemas (`zod-to-openapi`)
- **Swagger UI** – Interactive API docs at `/api-docs`
- **Error handling** – Centralized error middleware with detailed responses

### 🔑 Authentication & Authorization

- **JWT authentication** – Secure token-based access
- **Role-based access control (RBAC)** – Restrict endpoints by user roles (`ADMIN`, `USER`, etc.)
- **Ownership-based resource access** – Enforce data privacy per user

### 🛠️ Database & Models

- **Sequelize ORM** – Type-safe models for relational databases (MySQL, PostgreSQL, etc.)
- **Paranoid soft-delete** – Never lose your data by mistake
- **Relational integrity** – Foreign keys, associations, and constraints
- **Auto-migration ready** (optional)

### 📊 Logging & Monitoring

- **Pino HTTP logger** – Fast, JSON-based structured logs
- **Custom request/response logging** for debugging and audits

### 🐳 Deployment & DevOps

- **Dockerfile** – Out-of-the-box container support
- **Production-ready configs** – Security, performance, and error handling

### 🧪 Quality & Clean Code

- **Biomejs** – Linting and code formatting
- **Auto dependency updates** with Renovate
- **Extensive test coverage** – Unit and integration tests included
- **Type-safety everywhere** – No more `any` types or silent bugs

### ✨ Latest Features (2025)

- **Vehicle & Telemetry Module:**
  - CRUD for vehicles and telemetry logs with RBAC & ownership
  - Advanced stats endpoint: total, parked, moving, maintenance per user or admin
  - Get all/latest telemetry logs for each vehicle (grouped per user)
  - Pagination, filtering, date-range queries for logs
  - OpenAPI/Swagger UI for all endpoints and schemas
  - Strict Zod validation for all request/response bodies
  - Full debug logging for all major API flows
- **ServiceResponse** – Standardizes all API error/success output
- **API error codes** – Uniform and documented across the stack
- **Interactive API browser** – Try endpoints directly from your browser
- **Ready for multi-tenant SaaS** – User-based data isolation

---

## 🏁 Getting Started

### 🎬 Video Demo

Watch the [video demo](https://github.com/user-attachments/assets/b1698dac-d582-45a0-8d61-31131732b74e) for a hands-on walkthrough.

### 1. 🚀 Initial Setup

```bash
git clone https://github.com/edwinhern/express-typescript.git
cd express-typescript
pnpm install
```

### 2. ⚙️ Environment Configuration

```bash
cp .env.template .env
# Edit .env and fill in your secret keys, DB config, etc.
```

### 3. 🏃‍♂️ Running the Project

- Development:  
  `pnpm start:dev`
- Build:  
  `pnpm build`
- Production:  
  Set `NODE_ENV="production"` in `.env`  
  `pnpm build && pnpm start:prod`

---

## 📖 API Reference & Documentation

- **Swagger UI:** [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **OpenAPI spec:** `/api-docs/openapi.json`
- **API Examples:**
  - `GET /health` – Health check
  - `POST /auth/login` – Authenticate user
  - `GET /vehicles` – List vehicles (paginated, filter, search)
  - `POST /vehicles` – Create vehicle (ADMIN)
  - `PATCH /vehicles/:id` – Update vehicle (ADMIN)
  - `DELETE /vehicles/:id` – Soft delete vehicle (ADMIN)
  - `GET /vehicles/:id/telemetry` – List telemetry logs for vehicle
  - `GET /vehicles/:id/telemetry/latest` – Latest telemetry log for vehicle
  - `GET /latest/vehicles` – Latest telemetry for all vehicles owned by user
  - `GET /stats` – Vehicle status statistics (total, parked, moving, maintenance)
  - etc.

_All endpoints are fully documented and testable via Swagger UI._

---

## 📬 Postman Collection & Collaboration

- **📑 API Collection**:  
  Import the full Postman collection to try all endpoints easily!
  [Get the Postman Collection](https://app.getpostman.com/join-team?invite_code=d121d6ee827d74f9ce98d203a2ac3e5a6b2671e201f7ae5eb5873a44f036f6c2&target_code=29bec209fb7943e841a7dceed8ae7ecd)
- **Team workspace**:  
  Collaborate, share, and test with others via the [Postman Team Workspace](https://app.getpostman.com/join-team?invite_code=d121d6ee827d74f9ce98d203a2ac3e5a6b2671e201f7ae5eb5873a44f036f6c2&target_code=29bec209fb7943e841a7dceed8ae7ecd)

---

## 🚀 Where Is It Deployed?

- **Production Backend:**  
  [https://srv901424.hstgr.cloud](https://srv901424.hstgr.cloud)  
  (All APIs, docs, and services are available here!)

---

## 🚀 Deployment

You can deploy this boilerplate anywhere that supports Node.js and Docker, including:

- **Vercel / Railway / Render / Fly.io**
- **Heroku / AWS ECS / Google Cloud Run / Azure Container Apps**
- **Traditional VPS / Bare metal** (just `pnpm build && pnpm start:prod`)
- **Docker Compose / Swarm / Kubernetes** (thanks to the included Dockerfile)

_**Tip:** For cloud deployment, be sure to update `.env` and database connectivity accordingly._

---

## 📁 Folder Structure

```code
├── biome.json
├── Dockerfile
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── src
│   ├── api
│   │   ├── healthCheck
│   │   │   ├── __tests__
│   │   │   │   └── healthCheckRouter.test.ts
│   │   │   └── healthCheckRouter.ts
│   │   ├── user
│   │   │   ├── __tests__
│   │   │   │   ├── userRouter.test.ts
│   │   │   │   └── userService.test.ts
│   │   │   ├── userController.ts
│   │   │   ├── userModel.ts
│   │   │   ├── userRepository.ts
│   │   │   ├── userRouter.ts
│   │   │   └── userService.ts
│   │   ├── vehicle
│   │   │   ├── vehicleController.ts
│   │   │   ├── vehicleModel.ts
│   │   │   ├── vehicleRepository.ts
│   │   │   ├── vehicleRouter.ts
│   │   │   └── vehicleService.ts
│   │   ├── telementryLog
│   │   │   ├── telementryLog.controller.ts
│   │   │   ├── telementryLog.model.ts
│   │   │   ├── telementryLog.repository.ts
│   │   │   ├── telementryLog.router.ts
│   │   │   └── telementryLog.service.ts
│   ├── api-docs
│   │   ├── __tests__
│   │   │   └── openAPIRouter.test.ts
│   │   ├── openAPIDocumentGenerator.ts
│   │   ├── openAPIResponseBuilders.ts
│   │   └── openAPIRouter.ts
│   ├── common
│   │   ├── __tests__
│   │   │   ├── errorHandler.test.ts
│   │   │   └── requestLogger.test.ts
│   │   ├── middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── requestLogger.ts
│   │   ├── models
│   │   │   └── serviceResponse.ts
│   │   └── utils
│   │       ├── commonValidation.ts
│   │       ├── envConfig.ts
│   │       └── httpHandlers.ts
│   ├── index.ts
│   └── server.ts
├── tsconfig.json
└── vite.config.mts
```

---

## 🤝 Feedback & Contributions

We welcome issues, feature requests, and PRs!  
Let’s make backend development cleaner, safer, and more productive together.

---

🎉 **Happy coding and building!** 🚀
