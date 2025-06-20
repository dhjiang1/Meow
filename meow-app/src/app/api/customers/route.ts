import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DEFAULT_PAGE_SIZE } from '@/app/constants';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const pageParam = req.nextUrl.searchParams.get('page') || '1';
    const page = parseInt(pageParam);

    const { count, error: countError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(countError.message);
    }

    const totalPages = Math.ceil((count || 0) / DEFAULT_PAGE_SIZE);
    if (isNaN(page) || page < 1 || (totalPages > 0 && page > totalPages)) {
      throw new Error('Invalid page number');
    }
    
    const offset = (page - 1) * DEFAULT_PAGE_SIZE;

    const { data, error } = await supabase
      .from('customers')
      .select(`id, name, email`)
      .range(offset, offset + DEFAULT_PAGE_SIZE - 1);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return NextResponse.json({
      current_page: page,
      per_page: DEFAULT_PAGE_SIZE,
      total_pages: totalPages,
      total_items: count,
      customers: data
    });
  } catch (err: any) {
    const status = err.message === 'Invalid page number' ? 400 : 500;
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status });
  }
}