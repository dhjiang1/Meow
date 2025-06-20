// Define API response types for type safety

export interface HelloResponse {
  message: string;
  timestamp: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface Account {
  id: number;
  account_number: string;
  type: string;
  balance: number;
  email: string;
}

export interface Transaction {
  id: number;
  account_from_id: number;
  account_to_id: number;
  amount: number;
  message?: string;
  type: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  status: number;
}
