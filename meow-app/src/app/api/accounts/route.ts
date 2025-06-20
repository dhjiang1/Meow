import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// TODO:
// - add pagination for all
// - generic error handling (using next?)
// parse query helper

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action');

    if (action === 'one') {
      return ONE(req);
    } else {
      return ALL(req);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { customerId, balance, type } = await req.json();
    // const body = await req.json();
    // const customerId = getInteger(body.customerId, 'customerId', true);

    const customer = await getCustomerById(customerId);
    if (customer) {
      checkValidBalance(balance);
      for (let i = 0; i < 10; i++) {
        const accountNumber = generateAccountNumber();
        const { data, error } = await supabase
          .from('accounts')
          .insert({
            account_number: accountNumber,
            balance: balance,
            customer_id: customerId,
            type: type
          })
          .select();

        if (error) {
          if (error.code === '23505') {
            continue;
          } else {
            throw new Error(error.message);
          }
        }
        if (data) {
          return NextResponse.json(data);
        }
      }

      return NextResponse.json({ error: 'Failed to create account number after 10 attempts' }, { status: 400 }); 
    } else {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

async function ALL(req: NextRequest) {
  const supabase = await createClient();
  const customerId = req.nextUrl.searchParams.get('customerId');
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('accounts')
    .select(
        `
        id,
        account_number,
        type,
        balance,
        customer_id
        `,
    )
    .eq('customer_id', customerId)
    .order('type', { ascending: false })

  if (error) {
    throw new Error(error.message);
  }
  return NextResponse.json(data);
}
 
async function ONE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const accountId = req.nextUrl.searchParams.get('accountId');
    const customerId = req.nextUrl.searchParams.get('customerId');
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }
    if(!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('accounts')
      .select(
        `
        id,
        account_number,
        type,
        balance,
        customer_id
        `
      )
      .eq('id', accountId)
      .eq('customer_id', customerId)
      .single();

    // handle when no account is found with customer id and account id (not entity found error)

    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

function generateAccountNumber() {
  const digits = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
  ).join(' ');

  return digits;
}

async function getCustomerById(id: number){
  if (id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .single();

    return data;
  } 
  return null;
}

function checkValidBalance(balance: any) {
  if (typeof balance !== 'number') {
    throw new Error('Balance must be a number');
  }
  if (!balance || balance < 0) {
    throw new Error('Balance must be greater than 0');
  }
  if (balance.toString().split('.')[1]?.length > 2) {
    throw new Error('Balance must have at most 2 decimal places');
  }
}