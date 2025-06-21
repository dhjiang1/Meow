import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DEFAULT_PAGE_SIZE } from "@/app/constants";
import { getInteger } from "@/app/helpers/parseQuery";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const page = getInteger(req.nextUrl.searchParams.get("page"), "page") || 1;

    const { count, error: countError } = await supabase.from("customers").select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(countError.message);
    }

    const totalPages = Math.ceil((count || 0) / DEFAULT_PAGE_SIZE);
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      throw new Error("Invalid page number");
    }

    const offset = (page - 1) * DEFAULT_PAGE_SIZE;

    const { data, error } = await supabase
      .from("customers")
      .select(`id, name, email`)
      .order("name", { ascending: true })
      .range(offset, offset + DEFAULT_PAGE_SIZE - 1);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      current_page: page,
      per_page: DEFAULT_PAGE_SIZE,
      total_pages: totalPages,
      total_items: count,
      customers: data,
    });
  } catch (err: unknown) {
    const status = err instanceof Error && err.message === "Invalid page number" ? 400 : 500;
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.from("customers").insert({ name, email }).select();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
