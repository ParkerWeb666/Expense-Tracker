import { categoryNames } from "./constants.js";
// Рендер
export function renderExpenses(
  expenses,
  searchQuery,
  sortType,
  editExpense,
  deleteExpense,
) {
  const expenseList = document.querySelector("#expense-list");
  expenseList.innerHTML = "";

  const filteredExpenses = expenses.filter((expense) => {
    return (
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryNames[expense.category]
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  switch (sortType) {
    case "price-asc":
      filteredExpenses.sort((a, b) => a.amount - b.amount);
      break;
    case "price-desc":
      filteredExpenses.sort((a, b) => b.amount - a.amount);
      break;
    case "new":
      filteredExpenses.sort((a, b) => b.date - a.date);
      break;
    case "old":
      filteredExpenses.sort((a, b) => a.date - b.date);
      break;
  }

  filteredExpenses.forEach((expense) => {
    const expenseItem = document.createElement("li");
    const formattedDate = new Date(expense.date).toLocaleString("ru-RU");
    expenseItem.textContent = `${formattedDate} - ${expense.title} - ${expense.amount} ₽`;
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.addEventListener("click", () => {
      deleteExpense(expense.id);
    });
    const editButton = document.createElement("button");
    editButton.textContent = "Редактировать";
    editButton.addEventListener("click", () => {
      editExpense(expense.id);
    });
    expenseItem.append(deleteButton);
    expenseItem.append(editButton);
    expenseList.append(expenseItem);
  });
}

// Удаление расхода
export function deleteExpense(id, expenses) {
  expenses = expenses.filter((expense) => expense.id !== id);

  return expenses;
}
