import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Dashboard } from "./Dashboard";
import { UserSetup } from "./UserSetup";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <header className="sticky top-0 z-10 bg-[#1E1E1E]/90 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#4DB6AC] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">₹</span>
              </div>
              <h1 className="text-xl font-semibold text-white">FinanceTracker</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Content />
      </main>
      
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: '#2D2D2D',
            color: '#FFFFFF',
            border: '1px solid #4DB6AC',
          },
        }}
      />
    </div>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DB6AC]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!currentUser ? (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to FinanceTracker
            </h2>
            <p className="text-gray-300">
              Take control of your finances with our secure tracking platform
            </p>
          </div>
          <UserSetup />
        </div>
      ) : (
        <Dashboard user={currentUser} />
      )}
    </div>
  );
}
