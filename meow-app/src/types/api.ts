// Define API response types for type safety

export interface HelloResponse {
  message: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  status: number;
}
