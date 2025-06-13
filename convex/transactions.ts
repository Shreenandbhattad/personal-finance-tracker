import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const addTransaction = mutation({
  args: {
    date: v.string(),
    mode: v.union(v.literal("cash"), v.literal("online")),
    application: v.string(),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    
    if (!user) {
      throw new Error("User profile not found");
    }

    const transactionId = await ctx.db.insert("transactions", {
      userId: user._id,
      date: args.date,
      mode: args.mode,
      application: args.application,
      amount: args.amount,
      type: args.type,
      category: args.category,
      description: args.description,
    });

    // Update user balance
    const balanceChange = args.type === "income" ? args.amount : -args.amount;
    
    if (args.mode === "cash") {
      await ctx.db.patch(user._id, {
        totalCash: user.totalCash + balanceChange,
      });
    } else {
      await ctx.db.patch(user._id, {
        totalOnline: user.totalOnline + balanceChange,
      });
    }

    return transactionId;
  },
});

export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    
    if (!user) {
      throw new Error("User profile not found");
    }

    const transaction = await ctx.db.get(args.transactionId);
    
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.userId !== user._id) {
      throw new Error("Unauthorized to delete this transaction");
    }

    // Reverse the balance change
    const balanceChange = transaction.type === "income" ? -transaction.amount : transaction.amount;
    
    if (transaction.mode === "cash") {
      await ctx.db.patch(user._id, {
        totalCash: user.totalCash + balanceChange,
      });
    } else {
      await ctx.db.patch(user._id, {
        totalOnline: user.totalOnline + balanceChange,
      });
    }

    await ctx.db.delete(args.transactionId);
  },
});

export const clearAllTransactions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    
    if (!user) {
      throw new Error("User profile not found");
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Delete all transactions
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Reset user balances to 0
    await ctx.db.patch(user._id, {
      totalCash: 0,
      totalOnline: 0,
    });

    return transactions.length;
  },
});

export const getFinancialSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    
    if (!user) {
      return null;
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalAmount = user.totalCash + user.totalOnline;
    
    const cashSpent = transactions
      .filter(t => t.mode === "cash" && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const onlineSpent = transactions
      .filter(t => t.mode === "online" && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = cashSpent + onlineSpent;
    
    const onlineMoneyIn = transactions
      .filter(t => t.mode === "online" && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalAmount,
      totalCash: user.totalCash,
      totalOnline: user.totalOnline,
      amountSpent: totalSpent,
      cashSpent,
      onlineSpent,
      amountLeft: totalAmount,
      cashLeft: user.totalCash,
      onlineLeft: user.totalOnline,
      onlineMoneyIn,
    };
  },
});
