import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  users: defineTable({
    name: v.string(),
    totalCash: v.number(),
    totalOnline: v.number(),
  }),
  
  transactions: defineTable({
    userId: v.id("users"),
    date: v.string(),
    mode: v.union(v.literal("cash"), v.literal("online")),
    application: v.string(),
    amount: v.number(),
    type: v.union(v.literal("income"), v.literal("expense")),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_mode", ["userId", "mode"]),
};

export default defineSchema({
  ...applicationTables,
});
