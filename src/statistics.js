import { categoryNames } from "./constants.js";
import { capitalize } from "./utils.js";
import { loadBudgets, saveBudgets } from "./storage.js";

const setLimitForm = document.querySelector("#set-limit-form");
const setLimitButton = document.querySelector("#set-limit");
const limitList = document.querySelector("#limit-list");

export const budgets = loadBudgets();

function getProgressColor(percent) {
      const safe = Math.min(percent, 100);
      const hue = 120 - safe * 1.2;
      return `hsl(${hue}, 80%, 50%)`;
    }

// Обновление статистики
export function updateStatistics(expenses, statistics, budgets) {
  const stats = expenses.reduce((accumulator, expense) => {
    if (!accumulator[expense.category]) {
      accumulator[expense.category] = 0;
    }
    accumulator[expense.category] += expense.amount;
    return accumulator;
  }, {});

  statistics.innerHTML = "";
  if (Object.keys(stats).length === 0) {
    statistics.innerHTML = "Расходов пока нет";
    return;
  }
  Object.entries(stats).forEach(([category, amount]) => {
    const statsItem = document.createElement("p");

    const budget = budgets[category];

    const remaining = budget - amount;

    statsItem.textContent = `${categoryNames[category]} ${amount}/${budget}₽`;
    const percent = (amount / budget) * 100;
    const card = document.createElement("div");
    card.classList.add("stat-card");
    const bar = document.createElement("div");
    bar.classList.add("stat-bar");
    const fill = document.createElement("div");
    fill.classList.add("stat-fill");
    fill.style.width = `${Math.min(percent, 100)}%`;
    
    fill.style.backgroundColor = getProgressColor(percent);

    const statRemaining = document.createElement("p");
    if (remaining >= 0) {
      statRemaining.textContent = `Осталось ${remaining}₽ (${Math.round(percent)}%)`;
    } else {
      statRemaining.textContent = `Перерасход на ${-remaining}₽`;
      statRemaining.style.color = "red";
    }

    statistics.append(card);
    card.append(statsItem);
    card.append(bar);
    bar.append(fill);
    card.append(statRemaining);
  });
}

// Статистика категорий по месяцам
export function groupExpensesByMonth(expenses) {
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

export function renderMonthlyExpenses(expenses, statisticsMonth) {
  statisticsMonth.innerHTML = "";

  const monthlyExpenses = groupExpensesByMonth(expenses);
  Object.entries(monthlyExpenses).forEach(([month, expense]) => {
    const monthItem = document.createElement("div");
    monthItem.classList.add("month-item");

    const monthHeader = document.createElement("div");
    monthHeader.classList.add("month-header");

    const categoriesContainer = document.createElement("div");
    categoriesContainer.classList.add("categories-container");

    monthHeader.addEventListener("click", () => {
      categoriesContainer.classList.toggle("hidden");
    });

    const monthAmount = Object.values(expense).reduce((accumulator, amount) => {
      accumulator += amount;
      return accumulator;
    }, 0);

    const monthHeaderTitle = document.createElement("span");
    const monthHeaderAmount = document.createElement("span");
    const monthUp = capitalize(month);

    monthHeaderTitle.textContent = monthUp;
    monthHeaderAmount.textContent = `${monthAmount} ₽`;

    monthHeader.append(monthHeaderTitle);
    monthHeader.append(monthHeaderAmount);

    Object.entries(expense).forEach(([category, amount]) => {
      const categoryItem = document.createElement("p");
      categoryItem.classList.add("category-item");

      const categoryItemTitle = document.createElement("span");
      categoryItemTitle.textContent = categoryNames[category];
      const categoryItemAmount = document.createElement("span");
      categoryItemAmount.textContent = ` ${amount} ₽`;
      categoryItem.append(categoryItemTitle);
      categoryItem.append(categoryItemAmount);

      categoriesContainer.append(categoryItem);
    });

    statisticsMonth.append(monthItem);
    monthItem.append(monthHeader);
    monthItem.append(categoriesContainer);
  });
}

setLimitButton.addEventListener("click", () => {
  setLimitForm.style.display = "block";
  setLimit();
});
function setLimit() {
  limitList.innerHTML = "";
  Object.entries(budgets).forEach(([category, amount]) => {
    const limitItem = document.createElement("li");
    limitItem.classList.add("limit-item");

    const limiItemTitle = document.createElement("span");
    limiItemTitle.textContent = categoryNames[category];

    const limitItemInput = document.createElement("input");
    limitItemInput.value = amount;
    limitItemInput.type = "number";
    limitItemInput.dataset.category = category;

    limitList.append(limitItem);
    limitItem.append(limiItemTitle);

    limitItem.append(limitItemInput);
  });
}
export function initBudgetForm(onSave)
{
  setLimitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const inputs = limitList.querySelectorAll("input");

  inputs.forEach((input) => {
    const category = input.dataset.category;
    const amount = Number(input.value);

    budgets[category] = amount;
  });

  setLimitForm.style.display = "none";
  saveBudgets(budgets);
  onSave();
});
}

