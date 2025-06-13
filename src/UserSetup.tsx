import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function UserSetup() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const createUserProfile = useMutation(api.users.createUserProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      await createUserProfile({
        name: name.trim(),
      });
      toast.success("Welcome! Your profile has been created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#2D2D2D] rounded-lg p-8 border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
        <p className="text-gray-300">Enter your name to start tracking your finances</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Your Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#1E1E1E] border border-gray-600 rounded-lg focus:border-[#4DB6AC] focus:ring-1 focus:ring-[#4DB6AC] outline-none transition-colors text-white placeholder-gray-400"
            placeholder="Enter your name"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[#4DB6AC] text-white font-semibold rounded-lg hover:bg-[#4DB6AC]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Getting Started..." : "Start Tracking"}
        </button>
      </form>
    </div>
  );
}
