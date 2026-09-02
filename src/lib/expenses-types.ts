export type ExpenseCategory =
  | "Rent"
  | "Utilities"
  | "Ingredients"
  | "Packaging"
  | "Marketing"
  | "Equipment"
  | "Salaries"
  | "Other";

export type Expense = {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
};
