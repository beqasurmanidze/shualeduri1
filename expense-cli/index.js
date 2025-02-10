const { Command } = require("commander");
const fs = require("fs");
const program = new Command();

const expensesFile = "expenses.json";

function loadExpenses() {
  if (fs.existsSync(expensesFile)) {
    return JSON.parse(fs.readFileSync(expensesFile));
  }
  return [];
}

function saveExpenses(expenses) {
  fs.writeFileSync(expensesFile, JSON.stringify(expenses, null, 2));
}

// 1)
program
  .command("add")
  .description("Add a new expense")
  .requiredOption("--category <category>", "Category of the expense")
  .requiredOption("--price <price>", "Price of the expense")
  .option("--description <description>", "Description of the expense")
  .action((options) => {
    const { category, price, description } = options;
    const parsedPrice = parseFloat(price);

    if (parsedPrice < 10) {
      console.error("Error: Minimum expense amount is 10 GEL.");
      return;
    }

    const expenses = loadExpenses();
    const newExpense = {
      id: Date.now(),
      category,
      price: parsedPrice,
      description: description || "",
      date: new Date().toISOString(),
    };

    expenses.push(newExpense);
    saveExpenses(expenses);
    console.log("Expense added successfully:", newExpense);
  });

// 2)
program
  .command("show")
  .description("Show all expenses")
  .option("--asc", "Sort by date ascending")
  .option("--desc", "Sort by date descending")
  .action((options) => {
    let expenses = loadExpenses();

    if (options.asc) {
      expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (options.desc) {
      expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (expenses.length === 0) {
      console.log("No expenses found.");
    } else {
      expenses.forEach((expense) => {
        console.log(
          `ID: ${expense.id}, Category: ${expense.category}, Price: ${expense.price} GEL, Date: ${expense.date}, Description: ${expense.description}`
        );
      });
    }
  });

// 3)
program
  .command("getById <id>")
  .description("Get expense by ID")
  .action((id) => {
    const expenses = loadExpenses();
    const expense = expenses.find((exp) => exp.id == id);

    if (expense) {
      console.log(expense);
    } else {
      console.error("Expense not found.");
    }
  });

// 4)
program
  .command("update <id>")
  .description("Update an expense by ID")
  .option("--category <category>", "Update category")
  .option("--price <price>", "Update price")
  .option("--description <description>", "Update description")
  .action((id, options) => {
    let expenses = loadExpenses();
    const index = expenses.findIndex((exp) => exp.id == id);

    if (index !== -1) {
      if (options.price && parseFloat(options.price) < 10) {
        console.error("Error: Minimum expense amount is 10 GEL.");
        return;
      }
      expenses[index] = {
        ...expenses[index],
        ...options,
        price: options.price
          ? parseFloat(options.price)
          : expenses[index].price,
      };
      saveExpenses(expenses);
      console.log("Expense updated successfully:", expenses[index]);
    } else {
      console.error("Expense not found.");
    }
  });

// 5)
program
  .command("delete <id>")
  .description("Delete an expense by ID")
  .action((id) => {
    let expenses = loadExpenses();
    expenses = expenses.filter((exp) => exp.id != id);
    saveExpenses(expenses);
    console.log("Expense deleted successfully.");
  });

// 6)
program
  .command("price")
  .description("Sort expenses by price")
  .option("--asc", "Sort by price ascending")
  .option("--desc", "Sort by price descending")
  .action((options) => {
    let expenses = loadExpenses();

    if (options.asc) {
      expenses.sort((a, b) => a.price - b.price);
    } else if (options.desc) {
      expenses.sort((a, b) => b.price - a.price);
    }

    expenses.forEach((expense) => {
      console.log(
        `ID: ${expense.id}, Category: ${expense.category}, Price: ${expense.price} GEL, Date: ${expense.date}, Description: ${expense.description}`
      );
    });
  });

program.parse(process.argv);
