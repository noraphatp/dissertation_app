// This code will run when the page loads
document.addEventListener("DOMContentLoaded", (event) => {
  const budgetFields = ["essentials", "entertainment", "personalCare", "miscellaneous"];

  function calculateTotalBudget() {
    let total = 0;
    budgetFields.forEach((field) => {
      const value = parseFloat(document.getElementById(field).value) || 0;
      total += value;
    });
    return total;
  }

  // Update the total budget display
  function updateTotalBudgetDisplay(total) {
    document.getElementById("totalBudgetDisplay").textContent = total.toFixed(2);
  }

  // Update the category displays
  function updateCategoryDisplays(budget) {
    budgetFields.forEach((field) => {
      document.getElementById(field + "Display").textContent = "£" + budget[field].toFixed(2);
    });
  }

  // Add an event listener to the budget form
  document.getElementById("budgetForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const budget = budgetFields.reduce((acc, field) => {
      acc[field] = parseFloat(document.getElementById(field).value) || 0;
      return acc;
    }, {});

    const totalBudget = calculateTotalBudget();
    updateTotalBudgetDisplay(totalBudget);
    updateCategoryDisplays(budget);

    localStorage.setItem("budget", JSON.stringify(budget));
    // Optional: Display a confirmation message
    // alert("Your budget has been set!");
  });

  // Load budget from localStorage if it exists
  if (localStorage.getItem("budget")) {
    const budget = JSON.parse(localStorage.getItem("budget"));
    budgetFields.forEach((field) => {
      document.getElementById(field).value = budget[field];
    });
    const totalBudget = calculateTotalBudget();
    updateTotalBudgetDisplay(totalBudget);
    updateCategoryDisplays(budget);
    updateRemainingBudgetDisplay();
  }

  // Function to update the remaining budget for each category
  function updateRemainingBudgetDisplay() {
    const budget = JSON.parse(localStorage.getItem("budget")) || { essentials: 0, entertainment: 0, personalCare: 0, miscellaneous: 0 };
    budgetFields.forEach((field) => {
      const allocatedAmount = budget[field] || 0;
      const totalSpent = calculateTotalSpentForCategory(field);
      const remainingBudget = allocatedAmount - totalSpent;
      document.getElementById(field + "Display").textContent = "£" + remainingBudget.toFixed(2);
      updateCategoryColor(field, remainingBudget); // Update color based on remaining budget
    });
  }

  // Function to calculate the total spent for a given category
  function calculateTotalSpentForCategory(category) {
    let totalSpent = 0;
    const items = JSON.parse(localStorage.getItem("items")) || [];
    items.forEach((item) => {
      if (item.category === category) {
        totalSpent += parseFloat(item.price);
      }
    });
    return totalSpent;
  }

  // Modified updateCategoryColor to take a field and value
  function updateCategoryColor(field, value) {
    const positiveColor = "#31572c";
    const negativeColor = "#9e2a2b";
    const displayElement = document.getElementById(field + "Display");

    if (value > 0) {
      displayElement.style.color = positiveColor;
    } else if (value < 0) {
      displayElement.style.color = negativeColor;
    }
  }

  // Item form submission
  document.getElementById("itemForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const itemName = document.getElementById("itemName").value;
    const itemCategory = document.getElementById("itemCategory").value;
    const itemPrice = parseFloat(document.getElementById("itemPrice").value).toFixed(2);

    // Check if the item price exceeds the remaining budget
    const remainingBudget = calculateRemainingBudgetForCategory(itemCategory);
    if (itemPrice > remainingBudget) {
      const confirmation = window.confirm("This will exceed your budget for " + itemCategory + ", are you sure?");
      if (!confirmation) {
        return; // Cancel the addition of the new item
      }
    }

    addItemToTable(itemName, itemCategory, itemPrice);
    updateRemainingBudgetDisplay(); // This will also save to localStorage
  });

  // Function to calculate the remaining budget for a given category
  function calculateRemainingBudgetForCategory(category) {
    const budgetAllocations = JSON.parse(localStorage.getItem("budget")) || { essentials: 0, entertainment: 0, personalCare: 0, miscellaneous: 0 };
    const allocatedAmount = budgetAllocations[category] || 0;
    const totalSpent = calculateTotalSpentForCategory(category);
    return allocatedAmount - totalSpent;
  }

  // Add item to table and save to localStorage
  function addItemToTable(name, category, price) {
    const tableBody = document.getElementById("itemTable").getElementsByTagName("tbody")[0];
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${name}</td>
      <td>${category}</td>
      <td>£${price}</td>
      <td><button onclick="deleteItem(this)">Delete</button></td>
    `;

    saveItems(); // Save the new item list to localStorage
    updateRemainingBudgetDisplay(); // Update the display
  }

  // Delete item from table and update localStorage
  window.deleteItem = function (button) {
    const row = button.parentNode.parentNode;
    const itemCategory = row.cells[1].textContent;

    // Adjust the budget allocations
    const budgetAllocations = JSON.parse(localStorage.getItem("budget")) || { essentials: 0, entertainment: 0, personalCare: 0, miscellaneous: 0 };
    if (budgetAllocations[itemCategory] !== undefined) {
      localStorage.setItem("budget", JSON.stringify(budgetAllocations)); // Save the updated budget
    }

    // Remove the item from the table
    row.parentNode.removeChild(row);

    // Update the items array and localStorage
    updateItemsArray();

    // Update the remaining budget display
    updateRemainingBudgetDisplay();
  };

  // Ensure updateItemsArray is only responsible for updating the items in localStorage
  function updateItemsArray() {
    const items = [];
    // Get all the rows in the table body except the header row
    const rows = document.getElementById("itemTable").getElementsByTagName("tbody")[0].rows;

    for (let i = 0; i < rows.length; i++) {
      const item = {
        name: rows[i].cells[0].textContent,
        category: rows[i].cells[1].textContent,
        price: parseFloat(rows[i].cells[2].textContent.replace("£", "")),
      };
      items.push(item);
    }

    localStorage.setItem("items", JSON.stringify(items));
  }

  // Save items to localStorage
  function saveItems() {
    const items = [];
    const rows = document.getElementById("itemTable").getElementsByTagName("tbody")[0].rows;
    for (let i = 0; i < rows.length; i++) {
      items.push({
        name: rows[i].cells[0].textContent,
        category: rows[i].cells[1].textContent,
        price: parseFloat(rows[i].cells[2].textContent.replace("£", "")),
      });
    }
    localStorage.setItem("items", JSON.stringify(items));
  }

  // Load items from localStorage
  const storedItems = JSON.parse(localStorage.getItem("items")) || [];
  storedItems.forEach((item) => addItemToTable(item.name, item.category, item.price));

  // Initial update for the budget display
  updateRemainingBudgetDisplay();
});
