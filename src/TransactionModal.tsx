import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

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

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  summary: Summary | null | undefined;
}

export function TransactionModal({ isOpen, onClose, transactions, summary }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mode: "cash" as "cash" | "online",
    application: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = useMutation(api.transactions.addTransaction);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mode: "cash",
        application: "",
        amount: "",
        type: "expense",
        category: "",
        description: "",
      });
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.application.trim() || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      await addTransaction({
        date: formData.date,
        mode: formData.mode,
        application: formData.application.trim(),
        amount,
        type: formData.type,
        category: formData.category.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      
      toast.success("Transaction added successfully!");
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mode: "cash",
        application: "",
        amount: "",
        type: "expense",
        category: "",
        description: "",
      });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-[#2D2D2D]/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4DB6AC] to-[#26A69A] px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Add Transaction</h2>
                <p className="text-white/80">Track your income and expenses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Add New Transaction</h3>
              <p className="text-gray-300">Enter your transaction details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-200 mb-2">
                    Date *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mode" className="block text-sm font-semibold text-gray-200 mb-2">
                    Payment Mode *
                  </label>
                  <select
                    id="mode"
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all text-white"
                    required
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="online">💳 Online</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="application" className="block text-sm font-semibold text-gray-200 mb-2">
                    Description *
                  </label>
                  <input
                    id="application"
                    name="application"
                    type="text"
                    value={formData.application}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="e.g., Grocery shopping, Salary, etc."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-200 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-200 mb-2">
                    Transaction Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all text-white"
                    required
                  >
                    <option value="expense">💸 Expense</option>
                    <option value="income">💰 Income</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-200 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all text-white placeholder-gray-400"
                    placeholder="e.g., Food, Transport, Entertainment"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-200 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-2 focus:ring-[#4DB6AC]/20 outline-none transition-all resize-none text-white placeholder-gray-400"
                  placeholder="Any additional details about this transaction..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-[#4DB6AC] text-white font-semibold rounded-lg hover:bg-[#4DB6AC]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Adding Transaction..." : "Add Transaction"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    date: new Date().toISOString().split('T')[0],
                    mode: "cash",
                    application: "",
                    amount: "",
                    type: "expense",
                    category: "",
                    description: "",
                  })}
                  className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
