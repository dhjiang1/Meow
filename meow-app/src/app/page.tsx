'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HelloResponse } from '@/types/api';

export default function Home() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/hello');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result: HelloResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={30}
            priority
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Next.js Full-Stack App
        </h1>
        
        <div className="flex justify-center mb-6">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Fetch Data from API'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-100">
            Error: {error}
          </div>
        )}
        
        {data && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">API Response:</h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              <p className="mb-2 text-gray-800 dark:text-gray-200">
                <span className="font-medium">Message:</span> {data.message}
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">Timestamp:</span> {formatTimestamp(data.timestamp)}
              </p>
            </div>
          </div>
        )}
        
        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          This example demonstrates a Next.js app with both frontend and backend in TypeScript.
        </p>
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built with Next.js and TypeScript</p>
      </footer>
    </div>
  );
}
