import { saveExpenses, loadExpenses, saveBudgets } from "./storage.js";
import {
  renderMonthlyExpenses,
  updateStatistics,
  budgets,
  initBudgetForm,
} from "./statistics.js";

import { renderExpenses, deleteExpense } from "./expenses.js";

let editingId = null;
let searchQuery = "";
let sortType = "default";
let expenses = loadExpenses();

const total = document.querySelector("#total");
const form = document.querySelector("#expense-form");
const titleInput = document.querySelector("#expense-title");
const amountInput = document.querySelector("#expense-amount");
const categoryInput = document.querySelector("#expense-category");
const titleError = document.querySelector("#title-error");
const amountError = document.querySelector("#amount-error");
const searchInput = document.querySelector("#search-input");
const selectType = document.querySelector("#sort-select");
const statistics = document.querySelector("#statistics-list");
const statisticsMonth = document.querySelector("#statistics-month");

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  renderExpenses(
    expenses,
    searchQuery,
    sortType,
    editExpense,
    handleDeleteExpense,
  );
});
selectType.addEventListener("change", () => {
  sortType = selectType.value;
  renderExpenses(
    expenses,
    searchQuery,
    sortType,
    editExpense,
    handleDeleteExpense,
  );
});

renderExpenses(
  expenses,
  searchQuery,
  sortType,
  editExpense,
  handleDeleteExpense,
);
updateTotal();
updateStatistics(expenses, statistics, budgets);
renderMonthlyExpenses(expenses, statisticsMonth);

initForm();

// Форма ввода расхода
function initForm() {
  form.addEventListener("submit", (event) => {
    titleError.textContent = "";
    amountError.textContent = "";
    event.preventDefault();
    if (titleInput.value.trim().length < 2) {
      titleError.textContent = "Название слишком короткое";
      return;
    }

    if (Number(amountInput.value) <= 0) {
      amountError.textContent = "Сумма должна быть больше 0";
      return;
    }
    const title = titleInput.value.trim();
    const newExpense = {
      id: Date.now(),
      title,
      amount: Number(amountInput.value),
      category: categoryInput.value,
      date: Date.now(),
    };
    if (editingId === null) {
      expenses.push(newExpense);
    } else {
      const expense = expenses.find((expense) => expense.id === editingId);
      expense.title = title;
      expense.amount = Number(amountInput.value);
      expense.category = categoryInput.value;
      editingId = null;
    }
    refreshUI();
    form.reset();
  });
}

// Изменение расхода
export function editExpense(id) {
  const expense = expenses.find((expense) => expense.id === id);
  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  editingId = id;
}

function updateTotal() {
  const sum = expenses.reduce(
    (accumulator, expense) => accumulator + expense.amount,
    0,
  );
  total.textContent = `${sum} ₽`;
}

export function refreshUI() {
  saveExpenses(expenses);
  renderExpenses(
    expenses,
    searchQuery,
    sortType,
    editExpense,
    handleDeleteExpense,
  );

  updateTotal();
  updateStatistics(expenses, statistics, budgets);
  renderMonthlyExpenses(expenses, statisticsMonth);
  
}

initBudgetForm(refreshUI);
function handleDeleteExpense(id) {
  expenses = deleteExpense(id, expenses);
  refreshUI();
}
