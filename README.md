# BeforePay

**Investigate before the money moves.**

An autonomous payment-exception investigation agent that gathers evidence across financial systems, identifies contradictions and missing evidence, performs quantitative analysis, asks for human approval before external/irreversible actions, and produces an evidence-backed payment decision.

Built for the **TrueForge Hackathon** using real TrueForge agent execution, MCP tools, and human-in-the-loop approval workflows.

## 🎯 Quick Start (1 Minute)

```bash
# Install dependencies
pnpm install

# Start Docker database
docker-compose up -d

# Initialize database with demo data
pnpm db:reset && pnpm db:seed

# Start all services
pnpm dev
```

**Then visit:**
- Frontend: http://localhost:3000
- Demo Flow: http://localhost:3000/demo
- API: http://localhost:3001
- [Setup Guide](./SETUP.md) for detailed instructions

## 🎬 The Demo (3 Minutes)

1. Click "Start Investigation" on `/demo` page
2. Watch Ledger, Counsel, and Signal agents work
3. See evidence correlate and contradictions appear
4. Review approval checkpoint
5. Approve the verification action
6. View final payment decision

NovaStack Case: ₹842K invoice vs ₹550K contract ceiling (+67% variance)

## 🏗️ Architecture

### Three-Layer Investigation System

```
PAYMENT EXCEPTION (₹842K invoice vs ₹550K ceiling)
    ↓
CONTROLLER AGENT (Orchestrates investigation)
    ├── Delegates to specialized agents
    ├── Correlates evidence
    └── Identifies contradictions
    ↓
SPECIALIZED AGENTS
    ├── Ledger Agent → Financial Analysis
    │   └── Historical variance, statistical outliers
    ├── Counsel Agent → Contract Compliance
    │   └── Ceiling checks, PO coverage
    └── Signal Agent → Vendor Verification
        └── Bank changes, contact verification
    ↓
EVIDENCE ENGINE
    ├── Correlates all findings
    ├── Detects contradictions
    ├── Identifies gaps
    └── Calculates confidence
    ↓
APPROVAL CHECKPOINT
    └── Human reviews and approves/rejects
    ↓
DECISION PACKAGE
    └── VERIFIED 🟢 | HOLD 🟡 | BLOCK 🔴
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + React 18 + Tailwind | Real-time investigation UI |
| **Backend** | Fastify + TypeScript | REST API for investigations |
| **Database** | PostgreSQL + Drizzle ORM | Persistent investigation data |
| **Agent** | TrueForge (Local) | Autonomous investigation orchestration |
| **Tools** | MCP Protocol | Deterministic data retrieval |
| **Sandbox** | TrueForge Native | Safe quantitative analysis |

### Key Components

#### **1. MCP Servers** (`services/mcp/`)
Real data retrieval tools for agents:

```typescript
// Finance tools
get_invoice_details(invoiceId)
analyze_invoice_variance(invoiceId, vendorId)  // Statistical analysis
get_payment_history(vendorId)

// Vendor tools
get_vendor_details(vendorId)
verify_vendor_contact(vendorId, email)
check_bank_change_authorization(vendorId, newAccount)

// Contract tools
get_active_contract(vendorId)
analyze_contract_compliance(vendorId, invoiceAmount)
check_po_coverage(vendorId, invoiceAmount)
```

#### **2. Agent Orchestration** (`agent/`)

**Controller Agent**
- Receives payment exception
- Delegates to specialized agents
- Correlates evidence
- Determines approval necessity
- Generates final decision

**Evidence Engine**
- Stores tool outputs as evidence
- Detects contradictions
- Identifies evidence gaps
- Calculates investigation confidence
- Generates detailed reports

**Approval System**
- Pauses at critical actions
- Requests human authorization
- Tracks approval chain
- Ensures audit trail

#### **3. Investigation Flow**

```
Investigation Started
    ↓
Build Context (Exception details)
    ↓
Call MCP Tools (Get evidence)
    ↓
Log Events (Create audit trail)
    ↓
Create Evidence Items (Structure findings)
    ↓
Correlate Evidence (Find patterns)
    ↓
Detect Contradictions (Find conflicts)
    ↓
Identify Gaps (Determine missing info)
    ↓
Calculate Confidence (Assess certainty)
    ↓
Require Approval? → Request Human Decision
    ↓
Generate Decision Package
    ↓
Investigation Complete
```

## 🗂️ Project Structure

```
beforepay/
│
├── apps/
│   └── web/                          # Next.js frontend application
│       ├── src/app/
│       │   ├── page.tsx             # Landing page
│       │   ├── dashboard/           # Investigation dashboard
│       │   ├── demo/                # Demo flow walkthrough
│       │   └── layout.tsx           # Root layout with styles
│       ├── tailwind.config.ts       # Design tokens
│       └── package.json
│
├── services/
│   ├── api/                          # Fastify backend
│   │   ├── src/
│   │   │   ├── index.ts             # Server setup
│   │   │   ├── lib/logger.ts        # Structured logging
│   │   │   └── routes/
│   │   │       ├── investigations.ts
│   │   │       ├── payments.ts
│   │   │       ├── vendors.ts
│   │   │       └── dashboard.ts
│   │   └── package.json
│   │
│   └── mcp/                          # MCP tool servers
│       ├── src/
│       │   ├── index.ts             # Tool registry
│       │   ├── finance.ts           # Financial analysis tools
│       │   ├── vendor.ts            # Vendor verification tools
│       │   └── contracts.ts         # Contract compliance tools
│       └── package.json
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── src/index.ts            # All domain types
│   │   └── package.json
│   │
│   ├── database/                     # Drizzle ORM + Schema
│   │   ├── src/
│   │   │   ├── schema.ts           # Complete table definitions
│   │   │   └── client.ts           # Database connection
│   │   ├── scripts/
│   │   │   ├── migrate.ts          # Run migrations
│   │   │   ├── seed.ts             # Seed demo data
│   │   │   └── reset.ts            # Reset database
│   │   └── package.json
│   │
│   ├── ui/                           # Shared React components
│   └── config/                       # Configuration constants
│
├── agent/                            # TrueForge agent orchestration
│   ├── src/
│   │   ├── controller.ts            # Main investigation orchestration
│   │   ├── evidence-engine.ts       # Evidence correlation & analysis
│   │   ├── approval.ts              # Approval checkpoint system
│   │   └── index.ts                 # Exports
│   └── package.json
│
├── docker-compose.yml                # PostgreSQL + Redis
├── package.json                      # Monorepo root
├── tsconfig.json                     # TypeScript configuration
├── .env.example                      # Environment template
├── README.md                          # This file
└── SETUP.md                           # Setup instructions
```

## 🔐 Security & Safety

### No Real Financial Transactions
- ✅ Demo environment only
- ✅ Safe to run locally
- ✅ All data in local PostgreSQL
- ✅ No external API dependencies

### Human Authorization Required
- ✅ Agent pauses at approval gates
- ✅ Explicit human approval needed
- ✅ No automatic payment release
- ✅ Full audit trail maintained

### Evidence-Based Decisions
- ✅ Never just a confidence score
- ✅ Contradictions explicitly noted
- ✅ Missing evidence identified
- ✅ Reasoning always provided

```
beforepay/
├── apps/
│   └── web/                    # Next.js frontend application
├── services/
│   ├── api/                    # Node.js/Fastify backend
│   └── mcp/                    # MCP servers (Finance, Vendor, Contracts, etc)
├── packages/
│   ├── database/               # Drizzle ORM & migrations
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared React components
│   └── config/                 # Configuration & constants
├── mcp/                        # MCP tool implementations
│   ├── finance/
│   ├── vendor/
│   ├── contracts/
│   ├── communications/
│   └── actions/
├── agent/                      # TrueForge agent controllers
│   ├── controller/
│   ├── ledger/
│   ├── counsel/
│   ├── signal/
│   └── auditor/
├── sandbox/                    # Sandbox execution environment
├── demo-data/                  # Demo fixtures (NovaStack)
├── tests/                      # E2E and integration tests
└── docs/                       # Documentation
```

## 🏗️ Architecture

### Agent Loop

```
PAYMENT EXCEPTION
    ↓
INVESTIGATE (Controller Agent)
    ├── Ledger Agent (Financial Analysis)
    ├── Counsel Agent (Contractual/Procurement)
    └── Signal Agent (Identity & Communications)
    ↓
COLLECT EVIDENCE
    ↓
RUN QUANTITATIVE ANALYSIS (Sandbox)
    ↓
CORRELATE EVIDENCE
    ↓
FIND CONTRADICTIONS
    ↓
IDENTIFY MISSING EVIDENCE
    ↓
REQUEST ADDITIONAL EVIDENCE
    ↓
HUMAN APPROVAL (Checkpoint)
    ↓
EXTERNAL ACTION (MCP Tool)
    ↓
INVESTIGATION RESUMES
    ↓
FINAL DECISION
    ↓
AUDIT TRAIL
```

### Decision Outcomes

- 🟢 **VERIFIED** - Sufficient supporting evidence
- 🟡 **HOLD** - Insufficient evidence, requires investigation
- 🔴 **BLOCK** - Strong evidence of unauthorized/fraudulent activity

## 🔧 Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Origin UI Components

### Backend
- Node.js
- TypeScript
- Fastify
- Zod
- Drizzle ORM

### Database
- PostgreSQL
- Docker Compose (local)

### Agent & MCP
- TrueForge (Agent Runtime)
- MCP (Model Context Protocol)

## 📚 Core Entities

- **Company** - Organization
- **Vendor** - Payment recipient
- **VendorContact** - Verified contacts
- **BankAccount** - Payment details
- **BankAccountChange** - Bank change audit
- **Contract** - Service agreements
- **ContractAmendment** - Contract modifications
- **PurchaseOrder** - Purchase authorization
- **Invoice** - Billing document
- **Payment** - Payment record
- **PaymentException** - Flagged payments
- **Investigation** - Exception analysis
- **Evidence** - Factual claims with sources
- **Approval** - Human decision points

## 🚀 Development

### Run Everything
```bash
pnpm dev
```

### Run Individual Services
```bash
pnpm -C services/api dev
pnpm -C apps/web dev
pnpm -C services/mcp dev
```

### Database Migrations
```bash
pnpm db:migrate
pnpm db:seed
```

### Testing
```bash
pnpm test
pnpm test:e2e
```

## 📊 Demo: NovaStack Case

**Company**: NovaStack  
**Vendor**: Acme Cloud Services  
**Invoice**: ₹842,000 (vs ₹550,000 contract ceiling)  
**Status**: Suspicious but not trivially fraudulent

### Demo Flow
1. Open payment exception
2. TrueForge investigates
3. Ledger analyzes financial variance
4. Counsel checks contract limits
5. Signal verifies vendor identity & bank change
6. Evidence contradictions appear
7. Approval checkpoint pauses execution
8. Human reviews and approves
9. Verification email sent to vendor
10. Final decision displayed

## 🔐 Security

- No secrets in code
- `.env.example` provided
- Input validation with Zod
- Authorization boundaries enforced
- Tool permissions scoped
- Demo mode for testing

## 📝 License

MIT

---

**Built for TrueForge Hackathon**

Powered by TrueForge Agent Runtime
