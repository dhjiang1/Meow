"use client";

import { Account } from "@/types/api";
import axios from "axios";
import { use, useEffect, useState } from "react";

export default function AccountPage({ params }: { params: Promise<{ customerId: string, accountId: string }> }) {
  const { customerId, accountId } = use(params);

  const [data, setData] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/accounts`, {
          params: {
            action: 'one',
            customerId: customerId,
            accountId: accountId
          }
        });
        setData(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, accountId]);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div>
        <div>Account Number: {data.account_number}</div>
        <div>Type: {data.type}</div>
        <div>Balance: {data.balance}</div>
      </div>
    </main>
  );
}
