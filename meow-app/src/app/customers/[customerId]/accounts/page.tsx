"use client";
import React, { useEffect, useState, use } from 'react';
import axios from 'axios';
import { Account } from '@/types/api';
import Link from 'next/link';

export default function AccountsPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = use(params);
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/accounts`, {
          params: {
            customerId: customerId
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
  }, [customerId]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <main>
      <div className="flex flex-col gap-4">
        {data.map((account) => (
					<Link key={account.id} href={`/customers/${customerId}/accounts/${account.id}`}>
						<div className="flex gap-4">
							<div>{account.account_number}</div>
							<div>{account.type}</div>
          	</div>
					</Link>
        ))}
      </div>
    </main>
  );
}
