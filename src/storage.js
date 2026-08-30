export function saveExpenses(expenses) {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}
export function loadExpenses() {
  const data = localStorage.getItem("expenses");
  return data ? JSON.parse(data) : [];
}
