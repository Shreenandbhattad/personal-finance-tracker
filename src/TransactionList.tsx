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

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"transactions"> | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  const clearAllTransactions = useMutation(api.transactions.clearAllTransactions);

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

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const deletedCount = await clearAllTransactions();
      toast.success(`${deletedCount} transactions cleared successfully!`);
      setShowClearConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear transactions");
    } finally {
      setIsClearing(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-[#2D2D2D] rounded-lg border border-gray-700 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#4DB6AC]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
          <p className="text-gray-400">Start tracking your finances by adding your first transaction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2D2D2D] rounded-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">All Transactions</h3>
            <p className="text-gray-400 text-sm mt-1">{transactions.length} total transactions</p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>🗑️</span>
            <span>Clear All</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1E1E1E]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Application</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-[#1E1E1E]/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(transaction.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.mode === 'cash' 
                      ? 'bg-[#FFC107]/20 text-[#FFC107]' 
                      : 'bg-[#4DB6AC]/20 text-[#4DB6AC]'
                  }`}>
                    {transaction.mode.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  <div>
                    <div className="font-medium">{transaction.application}</div>
                    {transaction.description && (
                      <div className="text-xs text-gray-500 mt-1">{transaction.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-red-400/20 text-red-400'
                  }`}>
                    {transaction.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {transaction.category || '-'}
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

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-[#2D2D2D] rounded-xl p-8 border border-gray-600 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Clear All Transactions?</h3>
              <p className="text-gray-300 mb-6">
                This will permanently delete all {transactions.length} transactions and reset your balances to zero. 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearing ? "Clearing..." : "Clear All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
