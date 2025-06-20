import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TransactionRequest } from '@/types/api';


// TODO:
// - add pagination

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .select()
        .order('created_at', { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// Using Supabase RPC for atomic transactions
// The transfer_money function handles all validation and updates atomically
export async function POST(req: NextRequest) {
  try {
    const { accountFromId, accountToId, amount, message } = await req.json();
  
    // Basic validation
    if (!accountFromId || !accountToId || !amount) {
      return NextResponse.json({ error: 'accountFromId, accountToId, and amount are required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Call the database function
    const { data, error } = await supabase.rpc('transfer_money', {
      p_account_from_id: accountFromId,
      p_account_to_id: accountToId,
      p_amount: amount,
      p_message: message || null
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if the function returned an error
    if (data && data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}