# BeforePay

**Investigate before the money moves.**

An autonomous payment-exception investigation agent that gathers evidence across financial systems, identifies contradictions and missing evidence, performs quantitative analysis in a sandbox, asks for human approval before external/irreversible actions, and produces an evidence-backed payment decision.

## 🎯 Quick Start

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:reset
pnpm db:seed

# Run demo
pnpm demo
```

## 📋 Project Structure

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
