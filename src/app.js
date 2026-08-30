import { saveExpenses, loadExpenses } from "./storage.js";
import { categoryNames, categoryColors } from "./constants.js";

let editingId = null;
let searchQuery = "";
let sortType = "default";
let expenses = loadExpenses();

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
  renderExpenses();
});
selectType.addEventListener("change", () => {
  sortType = selectType.value;
  renderExpenses();
});

renderExpenses();
initForm();

function renderExpenses() {
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

  updateTotal();
  updateStatistics();
}

// Форма ввода расхода
function initForm() {
  form.addEventListener("submit", (event) => {
    titleError.textContent = "";
    amountError.textContent = "";
    event.preventDefault();
    if (titleInput.value.trim().length < 2) {
      const titleError = document.querySelector("#title-error");
      titleError.textContent = "Название слишком короткое";
      return;
    }

    if (Number(amountInput.value) <= 0) {
      const amountError = document.querySelector("#amount-error");
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
    saveExpenses(expenses);
    renderExpenses();
    form.reset();
  });
}

function updateTotal() {
  const total = document.querySelector("#total");
  const sum = expenses.reduce(
    (accumulator, expense) => accumulator + expense.amount,
    0,
  );
  total.textContent = `${sum} ₽`;
}

// Обновление статистики
function updateStatistics() {
  const stats = expenses.reduce((accumulator, expense) => {
    if (!accumulator[expense.category]) {
      accumulator[expense.category] = 0;
    }
    accumulator[expense.category] += expense.amount;
    return accumulator;
  }, {});

  statistics.innerHTML = "";
  const amounts = Object.values(stats);
  const maxAmount = Math.max(...amounts);
  if (Object.keys(stats).length === 0) {
    statistics.innerHTML = "Расходов пока нет";
    return;
  }
  Object.entries(stats).forEach(([category, amount]) => {
    const statsItem = document.createElement("p");

    statsItem.textContent = `${categoryNames[category]} - ${amount} ₽`;
    const percent = (amount / maxAmount) * 100;
    const card = document.createElement("div");
    card.classList.add("stat-card");
    const bar = document.createElement("div");
    bar.classList.add("stat-bar");
    const fill = document.createElement("div");
    fill.classList.add("stat-fill");
    fill.style.width = `${percent}%`;
    fill.style.backgroundColor = categoryColors[category];

    statistics.append(card);
    card.append(statsItem);
    card.append(bar);
    bar.append(fill);
  });
}

// Удаление расхода
function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses(expenses);

  renderExpenses();
}

// Изменение расхода
function editExpense(id) {
  const expense = expenses.find((expense) => expense.id === id);
  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  editingId = id;
}

// Статистика категорий по месяцам
function groupExpensesByMonth() {
  return expenses.reduce((accumulator, expense) => {
    const month = new Date(expense.date).toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    });
    if (!accumulator[month]) {
      accumulator[month] = {};
    }
    if (!accumulator[month][expense.category]) {
      accumulator[month][expense.category] = 0;
    }
    accumulator[month][expense.category] += expense.amount;
    return accumulator;
  }, {});
}

function renderMonthlyExpenses() {
  statisticsMonth.innerHTML = "";

  const monthlyExpenses = groupExpensesByMonth();
  Object.entries(monthlyExpenses).forEach(([month, expense]) => {
    const monthItem = document.createElement("div");
    monthItem.textContent = month;
    
    const monthAmount = Object.values(expense).reduce((accumulator, amount) => {
      ((accumulator += amount), 0);
      return accumulator;
    });
    const monthAmountItem = document.createElement("p");
    monthAmountItem.textContent = monthAmount;
    monthItem.append(monthAmountItem);

    Object.entries(expense).forEach(([category, amount]) => {
      const categoryItem = document.createElement("p");
      categoryItem.textContent = `${categoryNames[category]} - ${amount} p`;
      monthItem.append(categoryItem);
    });

    statisticsMonth.append(monthItem);
  });
}
renderMonthlyExpenses();
