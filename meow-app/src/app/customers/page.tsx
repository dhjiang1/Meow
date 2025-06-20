"use client";

import { Customer } from '@/types/api';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/customers');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map((customer) => (
        <div key={customer.id} className="flex gap-4">
          <div>{customer.name}</div>
          <div>{customer.email}</div>
          <div>
            <a
              href={`/customers/${customer.id}/accounts`}
              className="text-blue-600 underline hover:text-blue-800"
            >
              View Accounts
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}