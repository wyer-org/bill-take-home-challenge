# Take-Home Assessment – Access-Controlled SaaS Prototype

Welcome! This assessment is designed to evaluate your ability to design and implement a small-scale SaaS-style application with **granular access control**.

You will have **5 business days** to complete the assessment. You don’t need to build a production-ready application — the main focus is **authorization, data modeling, and granular permissions**.

---

## 🧑‍💻 Problem Statement

You are tasked with building a prototype application for a multi-tenant SaaS product.

* The **frontend** must be built with **React + TypeScript**.
* The **backend** must be built with **ElysiaJS**.
* The **database** must be **Postgres**.

The application manages **users, tenants, teams, groups, and roles**.
The core challenge is implementing **granular, role-based access control** across three modules:

1. **Vault**
2. **Financials**
3. **Reporting**

Each module must support basic **CRUD operations** (create, read, update, delete) for a simple resource type of your choice (see below).

---

## 🔑 Core Entities

### Tenant

* Represents a company or organization.
* A user always belongs to exactly one tenant.

### User

* Belongs to a **tenant**.
* Assigned to a **team**.
* Cannot directly hold roles — permissions are inherited from **groups**.
* Authentication: **Passwordless login** via OTP or magic link.

### Team

* A container for users within a tenant.
* Has no direct permissions.
* Permissions for users depend on the **groups** they belong to.

### Role

* Defines **permissions per module**.
* Permissions are defined as a subset of `[create, read, update, delete]`.
* Example:

  ```json
  {
    "vault": ["create", "update"],
    "financials": ["read"],
    "reporting": []
  }
  ```

### Group

* Binds **roles** to a specific **team**.
* A group can contain **multiple roles**.
* Users inherit permissions from the groups they are assigned to.
* Example:

  * Group X = { role: VaultEditor, teamId: A }
  * Users in Group X get VaultEditor permissions **only for Team A**.

---

## 🔐 Authentication & Authorization

* Implement **session-based authentication** with **HTTP-only cookies**.
* Users can **register**, but only an **admin** can verify them.

  * Unverified users cannot log in.
* Every API request must check whether the **current user has the required permissions** before executing the action.

👉 Example:

* If a user tries to `POST /vault` (create), the backend must check whether they have `vault:create` permissions in a group for the given team.

You may use libraries like **Better-auth** if helpful.

---

## 📦 Modules & Example Resources

Each module must support **CRUD endpoints and UI**.
You can keep resources simple; the important part is access control.

* **Vault**: Example resource → `Secret { id, name, value }`
* **Financials**: Example resource → `Transaction { id, amount, description }`
* **Reporting**: Example resource → `Report { id, title, content }`

---

## 🖥️ Frontend Requirements

* Built with **React + TypeScript**.
* Simple UI with navigation:

  * Users
  * Teams
  * Groups
  * Roles
  * Vault
  * Financials
  * Reporting
* Support login via **magic link / OTP**.
* Allow **admins to verify users**.
* Show/hide navigation items or actions depending on the user’s permissions.
* Each module must have basic CRUD UI.

---

## ⚙️ Backend Requirements

* Built with **ElysiaJS** + **Postgres**.
* Define database schema with migrations (you may use Drizzle ORM, Prisma, or SQL).
* Implement:

  * User registration & verification flow
  * Session-based authentication (HTTP-only cookies)
  * Authorization middleware checking group/role permissions
  * CRUD endpoints for:

    * Users, Teams, Groups, Roles
    * Vault, Financials, Reporting resources

---

## 📊 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    TENANT ||--o{ USER : "has"
    TEAM ||--o{ USER : "contains"
    USER ||--o{ GROUP : "assigned to"
    GROUP ||--o{ ROLE : "has"
    ROLE ||--o{ PERMISSION : "defines"

    TENANT {
        uuid id PK
        string name
    }

    USER {
        uuid id PK
        string email
        string name
        boolean verified
        uuid tenantId FK
        uuid teamId FK
    }

    TEAM {
        uuid id PK
        string name
        uuid tenantId FK
    }

    GROUP {
        uuid id PK
        string name
        uuid teamId FK
    }

    ROLE {
        uuid id PK
        string name
    }

    PERMISSION {
        uuid id PK
        string module  "vault | financials | reporting"
        string action  "create | read | update | delete"
        uuid roleId FK
    }
```

### Notes on Relationships

* A **Tenant** can have multiple **Users** and **Teams**.
* A **Team** contains multiple **Users**.
* A **User** can be assigned to one or more **Groups**.
* A **Group** is linked to one **Team** and can have multiple **Roles**.
* A **Role** defines permissions (CRUD per module).
* Permissions are inherited **only through groups** → no direct role-to-user or role-to-team assignments.

---

## ✅ What We’re Looking For

* **Correctness**: Does access control work as specified?
* **Code quality**: Is the code concise, modular, and easy to understand?
* **Data modeling**: Is the schema structured logically for tenants, users, groups, and roles?
* **Frontend UX**: Does the UI respect permissions and provide a clear experience?
* **Documentation**: Is it easy to set up and run?

---

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS)
* Postgres

### Setup

1. Clone this repo
2. Install dependencies (`npm install` / `bun install`)
3. Set up your Postgres database and configure environment variables in `.env`

   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/app
   SESSION_SECRET=your-session-secret
   ```
4. Run migrations
5. Start backend server
6. Start frontend app

---

## 📝 Deliverables

* A working project with both frontend and backend.
* Instructions in a short **README** for how to run it locally.
* Any assumptions, tradeoffs, or notes in a separate **NOTES.md**.

---

## ⚡ Bonus (Optional)

* Unit tests for permission checks
* Docker setup
* Clean UI styling

---

