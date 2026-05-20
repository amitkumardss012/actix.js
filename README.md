# Actix

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/actix.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/actix)
[![License](https://img.shields.io/npm/l/actix.svg?style=flat-square&color=green)](https://github.com/amitkumardss012/sora.js/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/actix.svg?style=flat-square&color=orange)](https://www.npmjs.com/package/actix)
[![Node Version](https://img.shields.io/node/v/actix.svg?style=flat-square&color=red)](https://nodejs.org)
[![Types](https://img.shields.io/npm/types/actix.svg?style=flat-square&color=brightgreen)](https://www.typescriptlang.org/)

**A lightweight, zero-dependency, type-safe web server framework for Node.js.**  
*Build performant HTTP services with a modern, Express-like routing interface, dynamic path routing, and modular nested routers.*

</div>

---

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Request Lifecycle](#request-lifecycle)
  - [Body Parsing](#1-body-parsing)
  - [Query Parsing](#2-query-parsing)
  - [Dynamic Path Parameters](#3-dynamic-path-parameters)
- [Middlewares](#middlewares)
  - [Global Middlewares](#1-global-middlewares)
  - [Prefix/Path Middlewares](#2-prefixpath-middlewares)
  - [Route-Specific Middlewares](#3-route-specific-middlewares)
- [Modular Routing (Sub-Routers)](#modular-routing-sub-routers)
- [API Reference](#api-reference)
  - [Actix Application](#actix-application)
  - [Request Object](#request-object)
  - [Response Object](#response-object)
- [Full Example](#full-example)
- [License](#license)

---

## Key Features

*   🚀 **Zero External Dependencies** — Built directly on Node.js's native `http` module.
*   🛡️ **Fully Type-Safe** — First-class TypeScript support with out-of-the-box declarations.
*   🔗 **Dynamic Routing** — Native support for segment-based routing using modern `{param}` syntax (e.g. `/api/users/{id}`).
*   📦 **Built-in Body & Query Parsing** — Automatically parses JSON, URL-encoded request bodies, and query parameter objects.
*   🧱 **Modular Nested Routers** — Group related handlers into isolated sub-routers and mount them dynamically onto prefixes.
*   🍪 **Cookie & Header Management** — Simple, declarative helpers for headers and cookie management.

---

## Installation

Ensure you have Node.js (v18+) installed. `actix` is distributed as an ES Module.

```bash
npm install actix
```

> [!IMPORTANT]
> Since Actix uses modern ES modules (`import/export`), you must set `"type": "module"` in your project's `package.json`.

---

## Quick Start

Creating a server is simple and highly intuitive:

```typescript
import Actix from "actix";

const app = new Actix();

// Simple GET endpoint
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Actix!" });
});

// Start the server
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
```

---

## Request Lifecycle

The incoming request is parsed asynchronously before passing control to the middleware and handler stack.

### 1. Body Parsing
`req.body` is populated automatically. Actix supports `application/json` and `application/x-www-form-urlencoded` payloads:

```typescript
app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;
  res.status(201).json({ success: true, data: { title, content } });
});
```

### 2. Query Parsing
Url-encoded search queries are automatically parsed into `req.query`:

```typescript
// Request: GET /api/search?q=typescript&limit=10
app.get("/api/search", (req, res) => {
  const { q, limit } = req.query; // { q: "typescript", limit: "10" }
  res.json({ results: [], query: q, limit: parseInt(limit || "10", 10) });
});
```

### 3. Dynamic Path Parameters
Path variables are declared using `{parameterName}` placeholders. Extracted variables are populated in `req.params`:

```typescript
// Request: GET /api/users/1023/orders/9482
app.get("/api/users/{userId}/orders/{orderId}", (req, res) => {
  const { userId, orderId } = req.params; // { userId: "1023", orderId: "9482" }
  res.json({ userId, orderId });
});
```

---

## Middlewares

Middlewares are async functions executing sequentially. Each middleware receives `req`, `res`, and `next` (a function to continue the chain).

### 1. Global Middlewares
Runs for every incoming request:

```typescript
app.use(async (req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  await next()
});
```

### 2. Prefix/Path Middlewares
Runs on any request where the path starts with the specified prefix:

```typescript
app.use("/api", async (req, res, next) => {
  const apiKey = req.raw.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  await next();
});
```

### 3. Route-Specific Middlewares
Pass inline middlewares directly inside route declarations:

```typescript
const requireAdmin = async (req, res, next) => {
  if (req.body.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  await next();
};

app.post("/admin/settings", requireAdmin, (req, res) => {
  res.send("Admin settings updated!");
});
```

---

## Modular Routing (Sub-Routers)

Isolate routes in nested controllers using `Router` and mount them with optional path-specific middlewares.

```typescript
// routes/users.js
import { Router } from "actix";

const userRouter = new Router();

// Routes are relative to where the router is mounted
userRouter.get("/{id}", (req, res) => {
  const { id } = req.params;
  res.json({ id, name: "Amit Kumar" });
});

userRouter.post("/create", (req, res) => {
  res.json({ created: true });
});

export default userRouter;
```

Mounting the router in the main application:

```typescript
import Actix from "actix";
import userRouter from "./routes/users.js";

const app = new Actix();

// Protect user endpoints with custom auth middleware
const auth = async (req, res, next) => {
  // Authentication logic...
  await next();
};

// Mount the userRouter. All routes inside userRouter will automatically 
// run after 'auth' and be prefixed with /api/users
app.use("/api/users", auth, userRouter);

app.listen(3000);
```

---

## API Reference

### Actix Application

| Method / Property | Signature | Description |
| :--- | :--- | :--- |
| `use` | `use([path,] ...handlers)` | Mounts global, path-specific middlewares, or sub-routers. |
| `get` | `get(path, ...handlers)` | Registers a GET handler. |
| `post` | `post(path, ...handlers)` | Registers a POST handler. |
| `put` | `put(path, ...handlers)` | Registers a PUT handler. |
| `delete` | `delete(path, ...handlers)` | Registers a DELETE handler. |
| `patch` | `patch(path, ...handlers)` | Registers a PATCH handler. |
| `listen` | `listen(port, [callback])` | Starts the server listening on the specified port. |

### Request Object

| Property / Method | Type / Signature | Description |
| :--- | :--- | :--- |
| `raw` | `IncomingMessage` | Raw Node.js incoming request object. |
| `method` | `"GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE"` | The HTTP request method. |
| `url` | `string` | The complete request URL. |
| `path` | `string` | The path part of the URL (excluding query string). |
| `query` | `Record<string, string>` | Parsed query parameters. |
| `params` | `Record<string, string>` | Parsed dynamic route parameters. |
| `body` | `any` | Parsed request body object. |
| `getCookie` | `getCookie(name: string)` | Retrieves the raw cookie string value for the given cookie name. |

### Response Object

| Method | Signature | Description |
| :--- | :--- | :--- |
| `status` | `status(code: number)` | Sets the HTTP status code (returns `this` for chaining). |
| `send` | `send(data: string)` | Sends a plain text response and ends the connection. |
| `json` | `json(data: any)` | Sends a JSON payload, sets headers, and ends the connection. |
| `redirect` | `redirect(url: string)` | Sends a 302 redirect to the client. |
| `setHeader`| `setHeader(name: string, value: string)` | Sets a custom response header. |
| `removeHeader`| `removeHeader(name: string)` | Removes a response header. |
| `setCookie`| `setCookie(name, value, [options])` | Sets a cookie with `CookieOptions`. |

#### `CookieOptions`
```typescript
type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  sameSite?: "strict" | "lax" | "none";
};
```

---

## Full Example

Here is a full integration demonstrating how everything ties together:

```typescript
import Actix, { Router } from "actix";

const app = new Actix();
const apiRouter = new Router();

// Global request logger
app.use(async (req, res, next) => {
  console.log(`-> Received ${req.method} request to ${req.path}`);
  await next();
});

// Nested Router endpoints
apiRouter.get("/info", (req, res) => {
  res.json({ name: "Actix Engine", version: "0.0.1" });
});

apiRouter.post("/data/{id}", (req, res) => {
  const { id } = req.params;
  const { filter } = req.query;
  const body = req.body;

  res.json({
    id,
    filter,
    receivedBody: body,
    timestamp: new Date().toISOString()
  });
});

// Mount modular sub-router under /api
app.use("/api", apiRouter);

// Fallback 404 handler (automatically triggered if no handler/middleware sends a response)
app.listen(3000, () => {
  console.log("🚀 Production server live on port 3000");
});
```

---

## License

This project is licensed under the [MIT License](LICENSE).
