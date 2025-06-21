import { Account } from '@/types/api';

interface AccountCardProps {
  account: Account;
  customerName: string;
  onClick?: () => void;
}

export default function AccountCard({ account, customerName, onClick }: AccountCardProps) {
  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'savings':
        return 'from-green-400 to-green-500';
      case 'personal':
        return 'from-blue-400 to-blue-500';
      case 'credit':
        return 'from-purple-400 to-purple-500';
      case 'business':
        return 'from-gray-800 to-gray-900';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getAccountTypeTextColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'savings':
        return 'text-green-50';
      case 'personal':
        return 'text-blue-50';
      case 'credit':
        return 'text-purple-50';
      case 'business':
        return 'text-gray-50';
      default:
        return 'text-gray-50';
    }
  };

  const formatAccountNumber = (accountNumber: string) => {
    // Format as XXXX XXXX XXXX XXXX
    const cleaned = accountNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${getAccountTypeColor(account.type)} rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
    >
      {/* Chip Section */}
      <div className="mb-6">
        <div className="w-12 h-10 bg-white rounded-md flex items-center justify-center">
          <div className="w-8 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-6 h-4 bg-white rounded flex items-center justify-center">
              <div className="w-4 h-2 bg-white rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Number - Full Width */}
      <div className="mb-8">
        <p className="text-white text-2xl font-mono font-bold tracking-wider text-center">
          {formatAccountNumber(account.account_number)}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-xs uppercase tracking-wider mb-1">
            Cardholder
          </p>
          <p className="text-white font-semibold">
            {customerName}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${getAccountTypeTextColor(account.type)}`}>
            {account.type.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
} 