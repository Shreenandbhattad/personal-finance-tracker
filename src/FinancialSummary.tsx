import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface Transaction {
  _id: Id<"transactions">;
  userId: Id<"users">;
  date: string;
  mode: "cash" | "online";
  application: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  description?: string;
  _creationTime: number;
}

interface Summary {
  totalAmount: number;
  totalCash: number;
  totalOnline: number;
  amountSpent: number;
  cashSpent: number;
  onlineSpent: number;
  amountLeft: number;
  cashLeft: number;
  onlineLeft: number;
  onlineMoneyIn: number;
}

interface FinancialSummaryProps {
  summary: Summary | null | undefined;
  transactions: Transaction[];
}

export function FinancialSummary({ summary, transactions }: FinancialSummaryProps) {
  const [deletingId, setDeletingId] = useState<Id<"transactions"> | null>(null);
  
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  if (!summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4DB6AC]"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleDeleteTransaction = async (transactionId: Id<"transactions">) => {
    setDeletingId(transactionId);
    try {
      await deleteTransaction({ transactionId });
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Main Financial Overview */}
      <div className="space-y-6">
        {/* Total Amount - Hero Section */}
        <div className="bg-gradient-to-r from-[#4DB6AC]/20 to-[#26A69A]/20 rounded-2xl p-8 border border-[#4DB6AC]/30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-[#4DB6AC] rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <h2 className="text-lg font-medium text-gray-300 mb-2">Total Balance</h2>
            <p className="text-5xl font-bold text-[#4DB6AC] mb-2">
              {formatCurrency(summary.totalAmount)}
            </p>
            <p className="text-sm text-gray-400">Available across all accounts</p>
          </div>
        </div>

        {/* Cash vs Online Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash Balance */}
          <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700 hover:border-[#FFC107]/50 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#FFC107]/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-300 mb-1">Cash Balance</h3>
                <p className="text-2xl font-bold text-[#FFC107]">
                  {formatCurrency(summary.totalCash)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Physical cash on hand</p>
              </div>
            </div>
          </div>

          {/* Online Balance */}
          <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700 hover:border-[#4DB6AC]/50 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#4DB6AC]/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">💳</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-300 mb-1">Online Balance</h3>
                <p className="text-2xl font-bold text-[#4DB6AC]">
                  {formatCurrency(summary.totalOnline)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Digital accounts & cards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Spent Section */}
        <div className="bg-gradient-to-r from-red-500/10 to-red-400/10 rounded-xl p-6 border border-red-400/30">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Total Spent</h3>
              <p className="text-sm text-gray-400">Your expenses breakdown</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400 mb-1">
                {formatCurrency(summary.amountSpent)}
              </p>
              <p className="text-xs text-gray-500">Total Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-red-300 mb-1">
                {formatCurrency(summary.cashSpent)}
              </p>
              <p className="text-xs text-gray-500">Cash Spent</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-red-300 mb-1">
                {formatCurrency(summary.onlineSpent)}
              </p>
              <p className="text-xs text-gray-500">Online Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#2D2D2D] rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#4DB6AC]/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">📋</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
              <p className="text-sm text-gray-400">Your latest financial activity</p>
            </div>
          </div>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#4DB6AC]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No transactions yet</h4>
            <p className="text-gray-400 mb-4">Start tracking your finances by adding your first transaction</p>
            <div className="inline-flex items-center space-x-2 text-[#4DB6AC] text-sm">
              <span>💡</span>
              <span>Click "Add Transaction" to get started</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E1E1E]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-[#1E1E1E]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {transaction.mode === 'cash' ? '💵' : '💳'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.mode === 'cash' 
                            ? 'bg-[#FFC107]/20 text-[#FFC107]' 
                            : 'bg-[#4DB6AC]/20 text-[#4DB6AC]'
                        }`}>
                          {transaction.mode.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="font-medium">{transaction.application}</div>
                      {transaction.category && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-flex items-center space-x-1">
                            <span>🏷️</span>
                            <span>{transaction.category}</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span className={`flex items-center space-x-1 ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span>{transaction.type === 'income' ? '↗️' : '↘️'}</span>
                        <span>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-400/20 text-green-400' 
                          : 'bg-red-400/20 text-red-400'
                      }`}>
                        <span>{transaction.type === 'income' ? '💰' : '💸'}</span>
                        <span>{transaction.type.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        disabled={deletingId === transaction._id}
                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 hover:bg-red-400/10 rounded-lg"
                        title="Delete transaction"
                      >
                        {deletingId === transaction._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <span>🗑️</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
