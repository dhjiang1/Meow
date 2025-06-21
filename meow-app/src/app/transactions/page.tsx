'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, Account } from '@/types/api';

interface TransactionForm {
  accountFromId: number | '';
  accountToId: number | '';
  amount: number | '';
  message: string;
}

interface CustomersResponse {
  customers?: Customer[];
  error?: string;
}

interface AccountsResponse {
  accounts?: Account[];
  error?: string;
}

interface AccountWithCustomer extends Account {
  customer_name: string;
  customer_email: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allAccounts, setAllAccounts] = useState<AccountWithCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCustomerFrom, setSelectedCustomerFrom] = useState<number | ''>('');
  const [selectedCustomerTo, setSelectedCustomerTo] = useState<number | ''>('');
  const [formData, setFormData] = useState<TransactionForm>({
    accountFromId: '',
    accountToId: '',
    amount: '',
    message: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      fetchAllAccounts();
    }
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data: CustomersResponse = await response.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setMessage('Error loading customers');
    }
  };

  const fetchAllAccounts = async () => {
    try {
      const allAccountsData: AccountWithCustomer[] = [];
      
      for (const customer of customers) {
        const response = await fetch(`/api/accounts?customerId=${customer.id}`);
        const data: AccountsResponse = await response.json();
        if (data.accounts) {
          const accountsWithCustomer = data.accounts.map(account => ({
            ...account,
            customer_name: customer.name,
            customer_email: customer.email
          }));
          allAccountsData.push(...accountsWithCustomer);
        }
      }
      
      setAllAccounts(allAccountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setMessage('Error loading accounts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.accountFromId || !formData.accountToId || !formData.amount) {
      setMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.accountFromId === formData.accountToId) {
      setMessage('Source and destination accounts must be different');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountFromId: Number(formData.accountFromId),
          accountToId: Number(formData.accountToId),
          amount: Number(formData.amount),
          message: formData.message || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Transaction completed successfully!');
        setFormData({
          accountFromId: '',
          accountToId: '',
          amount: '',
          message: ''
        });
        setSelectedCustomerFrom('');
        setSelectedCustomerTo('');
        
        fetchAllAccounts();
      } else {
        setMessage(data.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error executing transaction:', error);
      setMessage('Error executing transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TransactionForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerFromChange = (customerId: number | '') => {
    setSelectedCustomerFrom(customerId);
    // Reset account selection when customer changes
    handleInputChange('accountFromId', '');
  };

  const handleCustomerToChange = (customerId: number | '') => {
    setSelectedCustomerTo(customerId);
    // Reset account selection when customer changes
    handleInputChange('accountToId', '');
  };

  const getAccountDisplayName = (account: AccountWithCustomer) => {
    return `${account.account_number} (${account.type}) - $${account.balance.toFixed(2)}`;
  };

  const getAccountsByCustomer = (customerId: number) => {
    return allAccounts.filter(account => account.customer_id === customerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Money Transfer</h1>
            <p className="text-gray-600">Transfer funds between any accounts securely</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Transfer Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Transfer Money</h2>
                <p className="text-gray-600">Select customers and accounts for your transfer</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Account Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    From Account
                  </h3>
                  
                  <div>
                    <label htmlFor="customerFrom" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer *
                    </label>
                    <select
                      id="customerFrom"
                      value={selectedCustomerFrom}
                      onChange={(e) => handleCustomerFromChange(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                      required
                    >
                      <option value="">Choose customer...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="accountFrom" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Account *
                    </label>
                    <select
                      id="accountFrom"
                      value={formData.accountFromId}
                      onChange={(e) => handleInputChange('accountFromId', e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                      required
                      disabled={!selectedCustomerFrom}
                    >
                      <option value="">Choose account...</option>
                      {selectedCustomerFrom && getAccountsByCustomer(selectedCustomerFrom).map((account) => (
                        <option key={account.id} value={account.id}>
                          {getAccountDisplayName(account)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* To Account Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    To Account
                  </h3>
                  
                  <div>
                    <label htmlFor="customerTo" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer *
                    </label>
                    <select
                      id="customerTo"
                      value={selectedCustomerTo}
                      onChange={(e) => handleCustomerToChange(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                      required
                    >
                      <option value="">Choose customer...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="accountTo" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Account *
                    </label>
                    <select
                      id="accountTo"
                      value={formData.accountToId}
                      onChange={(e) => handleInputChange('accountToId', e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                      required
                      disabled={!selectedCustomerTo}
                    >
                      <option value="">Choose account...</option>
                      {selectedCustomerTo && getAccountsByCustomer(selectedCustomerTo).map((account) => (
                        <option key={account.id} value={account.id}>
                          {getAccountDisplayName(account)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Transfer Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value ? Number(e.target.value) : '')}
                    step="0.01"
                    min="0.01"
                    className="w-full p-4 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={3}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 resize-none"
                  placeholder="Add a note about this transfer..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Transfer...
                  </div>
                ) : (
                  'Complete Transfer'
                )}
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg border ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="flex items-center">
                  {message.includes('successfully') ? (
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {message}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
