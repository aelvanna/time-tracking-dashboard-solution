import "./main.css";

/* filename and location of .json data to import */
const jsonData = "./data.json";

// Map for activity titles to base class names
const titleToClassBaseMap = new Map([
  ["Work", "work"],
  ["Study", "study"],
  ["Exercise", "exercise"],
  ["Play", "play"],
  ["Social", "social"],
  ["Self Care", "self-care"],
]);

// Add markup for each item
const appendItem = (item, timeframeType, dataKey) => {
  const previousTextMap = new Map([
    ["daily", "Yesterday"],
    ["weekly", "Last Week"],
    ["monthly", "Last Month"],
  ]);

  const baseClassName = titleToClassBaseMap.get(item.title);
  if (baseClassName) {
    const fullClassName = `${timeframeType}-${baseClassName}-${dataKey}`;
    const element = document.querySelector(`.${fullClassName}`);
    if (element) {
      let textToDisplay = `${item.timeframes[timeframeType][dataKey]}hrs`;
      if (dataKey === "previous") {
        const prefix = previousTextMap.get(timeframeType);
        if (prefix) {
          textToDisplay = `${prefix} - ${textToDisplay}`;
        }
      }
      element.innerHTML = textToDisplay;
    }
  }
};

// Populate DOM Function
const populateDOM = (data, selectedTimeframe) => {
  // Hide all current and previous elements first
  document
    .querySelectorAll('[class*="-current"], [class*="-previous"]')
    .forEach((el) => {
      el.classList.add("hidden");
    });

  data.forEach((item) => {
    const baseClassName = titleToClassBaseMap.get(item.title);
    if (baseClassName) {
      // Show and populate current data for the selected timeframe
      const currentElement = document.querySelector(
        `.${selectedTimeframe}-${baseClassName}-current`
      );
      if (currentElement) {
        currentElement.classList.remove("hidden");
        appendItem(item, selectedTimeframe, "current");
      }

      // Show and populate previous data for the selected timeframe
      const previousElement = document.querySelector(
        `.${selectedTimeframe}-${baseClassName}-previous`
      );
      if (previousElement) {
        previousElement.classList.remove("hidden");
        appendItem(item, selectedTimeframe, "previous");
      }
    }
  });
};

/* Use fetch to retrieve data from .json */
fetch(jsonData)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    // Initial population with weekly data
    populateDOM(data, "weekly");

    // Add event listeners to navigation links
    const navLinks = document.querySelectorAll(".card__nav a");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const timeframe = e.target.textContent.toLowerCase();
        populateDOM(data, timeframe);

        // Update active link styling
        navLinks.forEach((navLink) => {
          navLink.classList.remove("font-light", "text-white");
          navLink.classList.add("text-purple-500"); // Add back default color
        });
        e.target.classList.remove("text-purple-500"); // Remove default color
        e.target.classList.add("font-light", "text-white");
      });
    });
  })
  .catch((e) => {
    console.error("There was a problem with the fetch operation:", e);
  });
