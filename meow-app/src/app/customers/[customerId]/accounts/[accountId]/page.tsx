"use client";

import { Account, Transaction } from "@/types/api";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TransactionTable from "@/app/components/TransactionTable";

interface AccountResponse {
  id: number;
  account_number: string;
  type: string;
  balance: number;
  customer_id: number;
  error?: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
  error?: string;
}

export default function AccountPage({ params }: { params: Promise<{ customerId: string; accountId: string }> }) {
  const { customerId, accountId } = use(params);
  const router = useRouter();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchTransactions = useCallback(
    async (page: number = 1) => {
      try {
        const transactionsResponse = await fetch(`/api/transactions?accountId=${accountId}&page=${page}`);
        const transactionsData: TransactionsResponse = await transactionsResponse.json();

        if (transactionsResponse.ok) {
          setTransactions(transactionsData.transactions);
          setCurrentPage(transactionsData.current_page);
          setTotalPages(transactionsData.total_pages);
          setTotalItems(transactionsData.total_items);
        } else {
          console.error("Failed to load transactions:", transactionsData.error);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },
    [accountId],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch account details
        const accountResponse = await fetch(`/api/accounts?action=one&customerId=${customerId}&accountId=${accountId}`);
        const accountData: AccountResponse = await accountResponse.json();

        if (accountResponse.ok) {
          setAccount(accountData);
        } else {
          setError(accountData.error || "Failed to load account");
          return;
        }

        // Fetch initial transactions
        await fetchTransactions(1);
      } catch (error) {
        setError("Error loading account data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, accountId, fetchTransactions]);

  const handlePageChange = (page: number) => {
    fetchTransactions(page);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(balance);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "savings":
        return "bg-green-100 text-green-800";
      case "checking":
        return "bg-blue-100 text-blue-800";
      case "credit":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading account details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Account</h3>
            <p className="text-gray-600">{error || "Account not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Details</h1>
            <p className="text-gray-600">View account information and transaction history</p>
          </div>
          <button
            onClick={() => router.push(`/customers/${customerId}/accounts`)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Accounts
          </button>
        </header>

        {/* Account Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Balance - Takes up most space */}
            <div className="lg:col-span-2">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Balance</h2>
                <div className="text-6xl font-bold text-gray-900 mb-2">{formatBalance(account.balance)}</div>
                <p className="text-gray-600 mb-4">Available funds</p>
                <button
                  onClick={() => router.push("/transactions")}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg shadow-sm text-white hover:bg-blue-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Make Transfer
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Number</p>
                    <p className="text-lg font-semibold text-gray-900">{account.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Type</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(account.type)}`}
                    >
                      {account.type}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <p className="text-sm font-medium text-gray-500">Customer ID</p>
                      <button
                        onClick={() => router.push(`/customers/${account.customer_id}/accounts`)}
                        className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer ml-2"
                        title="View customer accounts"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{account.customer_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            <div className="text-sm text-gray-500">
              {totalItems} transaction{totalItems !== 1 ? "s" : ""} total
            </div>
          </div>

          <TransactionTable
            transactions={transactions}
            currentAccountId={account.id}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
