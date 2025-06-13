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

interface ReportsSectionProps {
  summary: Summary | null | undefined;
  transactions: Transaction[];
}

export function ReportsSection({ summary, transactions }: ReportsSectionProps) {
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

  // Calculate chart data
  const getChartData = () => {
    const categoryData = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense' && transaction.category) {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (!acc[month]) acc[month] = { income: 0, expense: 0 };
      acc[month][transaction.type] += transaction.amount;
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    const modeData = {
      cash: transactions.filter(t => t.mode === 'cash').reduce((sum, t) => sum + t.amount, 0),
      online: transactions.filter(t => t.mode === 'online').reduce((sum, t) => sum + t.amount, 0),
    };

    return { categoryData, monthlyData, modeData };
  };

  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Financial Reports</h2>
        <p className="text-gray-300">Detailed insights into your spending patterns</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">Total Balance</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">💸</span>
            </div>
            <div>
              <p className="text-sm font-medium text-red-300">Total Spent</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.amountSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Transactions</p>
              <p className="text-2xl font-bold text-blue-400">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-300">Avg Transaction</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(transactions.length > 0 ? summary.amountSpent / transactions.length : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cash vs Online Chart */}
        <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <span>💳</span>
            <span>Payment Mode Distribution</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-[#FFC107] rounded-full"></div>
                <span className="text-gray-300">Cash</span>
              </div>
              <span className="text-white font-semibold">{formatCurrency(summary.totalCash)}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3">
              <div 
                className="bg-[#FFC107] h-3 rounded-full transition-all duration-1000"
                style={{ width: `${summary.totalAmount > 0 ? (summary.totalCash / summary.totalAmount) * 100 : 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-[#4DB6AC] rounded-full"></div>
                <span className="text-gray-300">Online</span>
              </div>
              <span className="text-white font-semibold">{formatCurrency(summary.totalOnline)}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3">
              <div 
                className="bg-[#4DB6AC] h-3 rounded-full transition-all duration-1000"
                style={{ width: `${summary.totalAmount > 0 ? (summary.totalOnline / summary.totalAmount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Income vs Expense Chart */}
        <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <span>📊</span>
            <span>Income vs Expenses</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Income</span>
              </div>
              <span className="text-white font-semibold">
                {formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
            <div className="bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${summary.totalAmount > 0 ? 
                    (transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) / 
                     (summary.amountSpent + transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))) * 100 : 0}%` 
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">Expenses</span>
              </div>
              <span className="text-white font-semibold">{formatCurrency(summary.amountSpent)}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${summary.amountSpent > 0 ? 
                    (summary.amountSpent / 
                     (summary.amountSpent + transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(chartData.categoryData).length > 0 && (
        <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <span>🏷️</span>
            <span>Spending by Category</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(chartData.categoryData)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([category, amount], index) => {
                const colors = [
                  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
                  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
                ];
                return (
                  <div key={category} className="bg-[#1E1E1E] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                        <span className="text-sm font-medium text-gray-300">{category}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{formatCurrency(amount)}</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${summary.amountSpent > 0 ? (amount / summary.amountSpent) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {summary.amountSpent > 0 ? ((amount / summary.amountSpent) * 100).toFixed(1) : 0}% of total
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {Object.keys(chartData.monthlyData).length > 0 && (
        <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <span>📈</span>
            <span>Monthly Trends</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(chartData.monthlyData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, data]) => {
                const maxAmount = Math.max(data.income, data.expense);
                return (
                  <div key={month} className="bg-[#1E1E1E] p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-white">{month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-400">+{formatCurrency(data.income)}</span>
                        <span className="text-red-400">-{formatCurrency(data.expense)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-400 w-12">Income</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${maxAmount > 0 ? (data.income / maxAmount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-red-400 w-12">Expense</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${maxAmount > 0 ? (data.expense / maxAmount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Transaction Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🎯</span>
            <span>Quick Stats</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Largest Expense</span>
              <span className="text-red-400 font-semibold">
                {formatCurrency(Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Largest Income</span>
              <span className="text-green-400 font-semibold">
                {formatCurrency(Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Most Used Mode</span>
              <span className="text-[#4DB6AC] font-semibold">
                {chartData.modeData.cash > chartData.modeData.online ? 'Cash' : 'Online'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#2D2D2D] rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>💡</span>
            <span>Insights</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-[#1E1E1E] rounded-lg">
              <p className="text-gray-300">
                You've made <span className="text-[#4DB6AC] font-semibold">{transactions.length}</span> transactions this period.
              </p>
            </div>
            <div className="p-3 bg-[#1E1E1E] rounded-lg">
              <p className="text-gray-300">
                Your {summary.totalCash > summary.totalOnline ? 'cash' : 'online'} balance is higher by{' '}
                <span className="text-[#4DB6AC] font-semibold">
                  {formatCurrency(Math.abs(summary.totalCash - summary.totalOnline))}
                </span>
              </p>
            </div>
            {Object.keys(chartData.categoryData).length > 0 && (
              <div className="p-3 bg-[#1E1E1E] rounded-lg">
                <p className="text-gray-300">
                  Top spending category:{' '}
                  <span className="text-[#4DB6AC] font-semibold">
                    {Object.entries(chartData.categoryData).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
