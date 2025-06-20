import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


// TODO:
// - add pagination

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('customers').select(`id, name, email`);
    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}