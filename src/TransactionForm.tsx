import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
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
      onSuccess();
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#2D2D2D] rounded-lg p-8 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-6">Add New Transaction</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-300 mb-2">
                Payment Mode *
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white"
                required
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div>
              <label htmlFor="application" className="block text-sm font-medium text-gray-300 mb-2">
                Application/Description *
              </label>
              <input
                id="application"
                name="application"
                type="text"
                value={formData.application}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white placeholder-gray-400"
                placeholder="e.g., Grocery shopping, Salary, etc."
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white placeholder-gray-400"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white"
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category (Optional)
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white placeholder-gray-400"
                placeholder="e.g., Food, Transport, Entertainment"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white placeholder-gray-400 resize-none"
              placeholder="Any additional details about this transaction..."
            />
          </div>

          <div className="flex gap-4">
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
  );
}
