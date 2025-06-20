This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# Transaction System Setup

This project uses Supabase RPC (Remote Procedure Call) for handling money transfers between accounts.

## Setup Instructions

### 1. Create the Database Function

Run the SQL function found in `transfer_money.sql` in your Supabase SQL editor to create the database function. 

### 2. Verify the Function

You can test the function directly in Supabase:

```sql
-- Test the function
SELECT transfer_money(1, 2, 100.50, 'Test transfer');
```

