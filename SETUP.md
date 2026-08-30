# BeforePay - Development Setup Guide

## Prerequisites

- **Node.js** 18+ (npm or pnpm)
- **PostgreSQL** 14+ (or Docker)
- **Docker & Docker Compose** (for local PostgreSQL)
- **Git**

## Quick Start

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Setup Database

```bash
# Copy environment file
cp .env.example .env

# Start PostgreSQL in Docker
docker-compose up -d

# Wait for PostgreSQL to be ready
sleep 5

# Initialize database and seed demo data
pnpm db:reset
pnpm db:seed
```

### 3. Run Development Servers

```bash
# Start all services in parallel
pnpm dev

# Or start individual services:
# Terminal 1: Frontend
pnpm -C apps/web dev

# Terminal 2: Backend API
pnpm -C services/api dev

# Terminal 3: MCP Server
pnpm -C services/mcp dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **MCP Server**: http://localhost:8000

## Database Commands

```bash
# Reset database (drops all tables and recreates)
pnpm db:reset

# Seed demo data (creates NovaStack case)
pnpm db:seed

# Run migrations
pnpm db:migrate
```

## Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://beforepay:beforepay@localhost:5432/beforepay

# Backend
API_PORT=3001
API_HOST=localhost

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# TrueForge
TRUEFORGE_API_URL=http://localhost:7000

# MCP
MCP_PORT=8000
MCP_HOST=localhost

# Demo
DEMO_MODE=true
LOG_LEVEL=debug
```

## Project Structure

```
beforepay/
├── apps/web/                    # Next.js frontend
├── services/
│   ├── api/                     # Fastify backend API
│   └── mcp/                     # MCP tool servers
├── packages/
│   ├── types/                   # Shared TypeScript types
│   ├── database/                # Drizzle ORM & schema
│   ├── ui/                      # Shared React components
│   └── config/                  # Configuration & constants
├── agent/                       # TrueForge agent logic
│   ├── controller.ts            # Main orchestration
│   ├── evidence-engine.ts       # Evidence correlation
│   └── approval.ts              # Human-in-loop system
├── docker-compose.yml           # PostgreSQL + Redis
└── README.md
```

## Available Scripts

### Root Level
```bash
pnpm dev                 # Start all services
pnpm build              # Build all packages
pnpm lint               # Lint all packages
pnpm type-check         # TypeScript check
pnpm test               # Run tests
pnpm demo:reset         # Reset database for demo
```

### Individual Services
```bash
pnpm -C apps/web dev           # Frontend only
pnpm -C services/api dev       # Backend only
pnpm -C services/mcp dev       # MCP server only
pnpm -C packages/database dev  # Database schemas
```

## Database Schema

### Core Entities
- **Company** - Organization (NovaStack)
- **Vendor** - Payment recipient (Acme Cloud Services)
- **BankAccount** - Vendor bank details
- **BankAccountChange** - Bank change history
- **Contract** - Service agreement
- **PurchaseOrder** - Purchase authorization
- **Invoice** - Billing document
- **Payment** - Payment record

### Investigation Entities
- **PaymentException** - Flagged payment
- **Investigation** - Exception analysis
- **Evidence** - Factual claims with sources
- **InvestigationEvent** - Audit log
- **Approval** - Human decision point

## Demo Case: NovaStack

The database is seeded with a complete payment exception case:

**Company**: NovaStack  
**Vendor**: Acme Cloud Services  
**Invoice**: INV-48291  
**Amount**: ₹842,000  
**Contract Ceiling**: ₹550,000  
**Variance**: +₹292,000 (+67.4%)  
**Bank Change**: 3 days ago (HDFC → ICICI)  
**Status**: Ready for investigation

## MCP Tools Available

### Finance Tools
- `get_invoice_details(invoiceId)` - Retrieve invoice data
- `analyze_invoice_variance(invoiceId, vendorId)` - Statistical analysis
- `get_payment_history(vendorId)` - Payment history and trends

### Vendor Tools
- `get_vendor_details(vendorId)` - Vendor information
- `get_vendor_bank_history(vendorId)` - Bank account history
- `verify_vendor_contact(vendorId, email)` - Contact verification
- `check_bank_change_authorization(vendorId, newBankAccount)` - Bank change validation

### Contract Tools
- `get_active_contract(vendorId)` - Active contract details
- `analyze_contract_compliance(vendorId, invoiceAmount)` - Compliance check
- `get_purchase_order_details(poId)` - PO information
- `check_po_coverage(vendorId, invoiceAmount)` - PO coverage analysis

## Development Workflow

### 1. Make Changes
Edit files in `src/` directories

### 2. Test Locally
```bash
pnpm dev
# Navigate to http://localhost:3000
```

### 3. Type Check
```bash
pnpm type-check
```

### 4. Commit
```bash
git add .
git commit -m "feat: description of changes"
```

### 5. Push
```bash
git push origin main
```

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps

# Start Docker container
docker-compose up -d

# Verify connection
psql postgresql://beforepay:beforepay@localhost:5432/beforepay
```

### Port Already in Use
```bash
# Change ports in .env file
API_PORT=3002          # Change from 3001
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database Reset
```bash
# Complete database reset
docker-compose down -v    # Remove volume
docker-compose up -d       # Start fresh
pnpm db:reset
pnpm db:seed
```

## Performance Tips

- Use `pnpm` instead of `npm` (faster, better monorepo support)
- Enable caching: `NODE_ENV=development`
- Use TypeScript strict mode during development
- Watch mode automatically recompiles changes

## Next Steps

1. **Explore the Code**:
   - Start with `apps/web/src/app/page.tsx` (landing page)
   - Check `agent/src/controller.ts` (investigation logic)
   - Review `services/mcp/src/*.ts` (MCP tools)

2. **Run the Demo**:
   - Navigate to `/demo` page
   - Click "Start Investigation"
   - Explore the investigation detail page

3. **Extend Functionality**:
   - Add new MCP tools in `services/mcp/src/`
   - Create subagents in `agent/src/`
   - Implement new approval types

## Support

For issues or questions:
1. Check this guide
2. Review source code comments
3. Check git commit history for examples
4. Refer to framework docs:
   - [Next.js](https://nextjs.org/docs)
   - [Fastify](https://www.fastify.io/docs/latest/)
   - [Drizzle ORM](https://orm.drizzle.team/)
   - [TrueForge](https://github.com/truefoundry/trueforge)
