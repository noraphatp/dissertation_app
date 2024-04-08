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
      document.getElementById(field + "Display").textContent = '£' + budget[field].toFixed(2);
    });
  }

  function updateCategoryColor() {
    const positiveColor = "#31572c"; // Replace with your chosen color for positive values
    const negativeColor = "#9e2a2b"; // Replace with your chosen color for negative values

    budgetFields.forEach((field) => {
      const value = parseFloat(document.getElementById(field).value) || 0;
      const displayElement = document.getElementById(field + "Display");

      if (value > 0) {
        displayElement.style.color = positiveColor;
      } else if (value < 0) {
        displayElement.style.color = negativeColor;
      } 
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
    updateCategoryColor();

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
    updateCategoryColor();
  }
});
