import { NextResponse } from 'next/server';
import { HelloResponse } from '@/types/api';

export async function GET() {
  const data: HelloResponse = {
    message: 'Hello from the API!',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
