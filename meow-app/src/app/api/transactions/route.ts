import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getInteger } from "@/app/helpers/parseQuery";
import { DEFAULT_PAGE_SIZE } from "@/app/constants";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const accountId = getInteger(req.nextUrl.searchParams.get("accountId"), "accountId", true);
    const page = getInteger(req.nextUrl.searchParams.get("page"), "page") || 1;

    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .or(`account_to.eq.${accountId}, account_from.eq.${accountId}`);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / DEFAULT_PAGE_SIZE);
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
    }

    const offset = (page - 1) * DEFAULT_PAGE_SIZE;

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
          *,
          account_from_details:accounts!account_from(
            id,
            customer_id
          ),
          account_to_details:accounts!account_to(
            id,
            customer_id
          )
        `,
      )
      .or(`account_to.eq.${accountId}, account_from.eq.${accountId}`)
      .order("created_at", { ascending: false })
      .range(offset, offset + DEFAULT_PAGE_SIZE - 1);
    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json({
      current_page: page,
      per_page: DEFAULT_PAGE_SIZE,
      total_pages: totalPages,
      total_items: count,
      transactions: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accountFromId, accountToId, amount, message } = await req.json();

    if (!accountFromId || !accountToId || !amount) {
      return NextResponse.json({ error: "accountFromId, accountToId, and amount are required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    if (amount.toString().split(".")[1]?.length > 2) {
      throw new Error("Amount must have at most 2 decimal places");
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("transfer_money", {
      p_account_from_id: accountFromId,
      p_account_to_id: accountToId,
      p_amount: amount,
      p_message: message || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
