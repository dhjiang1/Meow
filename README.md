# Meow Banking App

A modern banking web application built with Next.js, TypeScript, and Supabase. This application provides an MVP look at how admins can create and manage accounts, transfer money between accounts, and view transaction history of accounts.

## Features

- **Account Management**: Create accounts for bank customers
- **Money Transfers**: Rransfers between any accounts across customers
- **Transaction History**: Complete transaction tracking with pagination
- **Real-time Updates**: Live balance updates and transaction processing

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## Database Schema

### Tables

#### `customers`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `created_at` (TIMESTAMP)

#### `accounts`
- `id` (SERIAL PRIMARY KEY)
- `account_number` (VARCHAR UNIQUE)
- `type` (VARCHAR)
- `balance` (FLOAT)
- `customer_id` (FOREIGN KEY)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `transactions`
- `id` (SERIAL PRIMARY KEY)
- `account_from` (FOREIGN KEY)
- `account_to` (FOREIGN KEY)
- `amount` (FLOAT)
- `message` (TEXT, OPTIONAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## API Endpoints

### Customers

#### `GET /api/customers`
Retrieves all customers with pagination support.

**Query Parameters:**
- `page` (optional): Page number for pagination

**All Response:**
```json
{
  "current_page": 1,
  "per_page": 25,
  "total_pages": 1,
  "total_items": 1,
  "customers": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
}
```

### Accounts

#### `GET /api/accounts`
Retrieves accounts for a specific customer.

**Query Parameters:**
- `customerId` (required): Customer ID
- `page` (optional): Page number for pagination
- `action` (optional): 'one' for single account retrieval
- `accountId` (required if action='one'): Account ID

**All Response:**
```json
{
  "current_page": 1,
  "per_page": 25,
  "total_pages": 1,
  "total_items": 1,
  "accounts": [
    {
      "id": 1,
      "account_number": "1234 5678 9012 3456",
      "type": "checking",
      "balance": 1000.00,
      "customer_id": 1
    }
  ]
}
```

**One Response:**
```json
{
  "id": 1,
  "account_number": "1234 5678 9012 3456",
  "type": "business",
  "balance": 1000.00,
  "customer_id": 1
}
```

#### `POST /api/accounts`
Creates a new account for a customer.

**Request Body:**
```json
{
  "customerId": 1,
  "balance": 100.50,
  "type": "business"
}
```

**Response:**
```json
[
  {
    "id": 1,
    "account_number": "1234 5678 9012 3456",
    "type": "business",
    "balance": 100.50,
    "customer_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
  }
]
```

### Transactions

#### `GET /api/transactions`
Retrieves transaction history for a specific account.

**Query Parameters:**
- `accountId` (required): Account ID
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "current_page": 1,
  "per_page": 25,
  "total_pages": 1,
  "total_items": 1,
  "transactions": [
    {
      "id": 1,
      "account_from": 1,
      "account_to": 2,
      "amount": 100.00,
      "message": "Transfer",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "account_from_details": {
        "id": 1,
        "customer_id": 1
      },
      "account_to_details": {
        "id": 2,
        "customer_id": 2
      }
    }
  ]
}
```

#### `POST /api/transactions`
Executes a money transfer between accounts.

**Request Body:**
```json
{
  "accountFromId": 1,
  "accountToId": 2,
  "amount": 100.00,
  "message": "Optional - Transfer description"
}
```

**Response:**
```json
{
    "success": true,
    "transaction_id": 1,
    "amount": 1000,
    "account_from": {
        "id": 1,
        "account_number": "0000 0000 0000 0000",
        "type": "personal",
        "balance": 10000,
        "customer_id": 1
    },
    "account_to": {
        "id": 2,
        "account_number": "0000 1111 2222 3333",
        "type": "business",
        "balance": 10000,
        "customer_id": 2
    }
}
```

## Database Functions

### `transfer_money.sql`
A PostgreSQL function that handles money transfers with proper transaction handling and balance validation.

## License

This project is licensed under the MIT License.
