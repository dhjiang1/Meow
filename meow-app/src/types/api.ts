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
  customer_id: number;
}

export interface Transaction {
  id: number;
  account_from: number;
  account_to: number;
  amount: number;
  message?: string;
  type: string;
  created_at: string;
  account_from_details?: {
    id: number;
    customer_id: number;
  };
  account_to_details?: {
    id: number;
    customer_id: number;
  };
}

export interface ApiError {
  error: string;
  status: number;
}
