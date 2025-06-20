import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ACCOUNT_CREATION_RETRY_LIMIT } from '@/app/constants';
import { DEFAULT_PAGE_SIZE } from '@/app/constants';
import crypto from 'crypto';
import { getInteger } from '@/app/helpers/parseQuery';

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
    const customerIdNum = getInteger(customerId, 'customerId', true);

    const customer = customerIdNum && (await getCustomerById(customerIdNum));
    if (customer) {
      checkValidBalance(balance);
      for (let i = 0; i < ACCOUNT_CREATION_RETRY_LIMIT; i++) {
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

      return NextResponse.json({ error: `Failed to create account number after ${ACCOUNT_CREATION_RETRY_LIMIT} attempts` }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

async function ALL(req: NextRequest) {
  try {
    const supabase = await createClient();
    const customerId = getInteger(req.nextUrl.searchParams.get('customerId'), 'customerId', true);
    const page = getInteger(req.nextUrl.searchParams.get('page'), 'page') || 1;
  
    const { count, error: countError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId);
  
    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
  
    const totalPages = Math.ceil((count || 0) / DEFAULT_PAGE_SIZE);
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }
    
    const offset = (page - 1) * DEFAULT_PAGE_SIZE;
  
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
      .eq('customer_id', customerId)
      .order('type', { ascending: false })
      .range(offset, offset + DEFAULT_PAGE_SIZE - 1);
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({
      current_page: page,
      per_page: DEFAULT_PAGE_SIZE,
      total_pages: totalPages,
      total_items: count,
      accounts: data
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
 
async function ONE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const accountId = getInteger(req.nextUrl.searchParams.get('accountId'), 'accountId', true);
    const customerId = getInteger(req.nextUrl.searchParams.get('customerId'), 'customerId', true);

    const { data } = await supabase
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

    if (!data) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

function generateAccountNumber(): string {
  const groups = Array.from({ length: 4 }, () => {
    const digits = Array.from({ length: 4 }, () => 
      crypto.randomInt(0, 10) 
    ).join('');
    return digits;
  });
  
  return groups.join(' ');
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

function checkValidBalance(balance: unknown) {
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