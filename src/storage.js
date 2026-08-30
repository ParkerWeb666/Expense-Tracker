export function saveExpenses(expenses) {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}
export function loadExpenses() {
  const data = localStorage.getItem("expenses");
  return data ? JSON.parse(data) : [];
}

export function saveBudgets(budgets) {
  localStorage.setItem("budgets", JSON.stringify(budgets));
}
export function loadBudgets() {
  return JSON.parse(localStorage.getItem("budgets")) || {
    food: 15000,
    transport: 5000,
    entertainment: 3000,
    other: 0,
  };
}
