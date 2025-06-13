import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // For simplicity, we'll just get the first user
    // In a real app, you'd use sessions or some other identifier
    const user = await ctx.db.query("users").first();
    return user;
  },
});

export const createUserProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a user already exists
    const existingUser = await ctx.db.query("users").first();
    
    if (existingUser) {
      throw new Error("A user profile already exists");
    }

    return await ctx.db.insert("users", {
      name: args.name,
      totalCash: 0,
      totalOnline: 0,
    });
  },
});

export const updateUserBalance = mutation({
  args: {
    cashAmount: v.number(),
    onlineAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    
    if (!user) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(user._id, {
      totalCash: args.cashAmount,
      totalOnline: args.onlineAmount,
    });
  },
});
