import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { FinancialSummary } from "./FinancialSummary";
import { TransactionModal } from "./TransactionModal";
import { ReportsSection } from "./ReportsSection";
import { Id } from "../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  totalCash: number;
  totalOnline: number;
}

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "reports">("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const transactions = useQuery(api.transactions.getTransactions);
  const financialSummary = useQuery(api.transactions.getFinancialSummary);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.name}!
        </h2>
        <p className="text-gray-300">Here's your financial overview</p>
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-[#26A69A] text-white font-semibold rounded-xl hover:bg-[#26A69A]/90 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="text-xl">➕</span>
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#2D2D2D] rounded-lg p-1 border border-gray-700">
          <div className="flex space-x-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "transactions", label: "Transactions" },
              { id: "reports", label: "Reports" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#4DB6AC] text-white"
                    : "text-gray-300 hover:text-white hover:bg-[#1E1E1E]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <FinancialSummary 
            summary={financialSummary} 
            transactions={transactions || []} 
          />
        )}
        
        {activeTab === "transactions" && (
          <TransactionList transactions={transactions || []} />
        )}
        
        {activeTab === "reports" && (
          <ReportsSection 
            summary={financialSummary} 
            transactions={transactions || []} 
          />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactions={transactions || []}
        summary={financialSummary}
      />
    </div>
  );
}
