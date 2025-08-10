import "./main.css";

/**
 * Filename and location of the JSON data to import.
 * @type {string}
 */
const jsonData = "/src/data.json";

/**
 * Maps activity titles from the data to the base class names used in the HTML.
 * @type {Map<string, string>}
 */
const titleToClassBaseMap = new Map([
  // [title, baseClassName] /*
  ["Work", "work"],
  ["Study", "study"],
  ["Exercise", "exercise"],
  ["Play", "play"],
  ["Social", "social"],
  ["Self Care", "self-care"],
]);

/**
 * Updates the text content of a single data element in the DOM.
 * @param {object} item - The activity data object (e.g., { title: "Work", timeframes: {...} }).
 * @param {string} timeframeType - The selected timeframe ('daily', 'weekly', 'monthly').
 * @param {'current' | 'previous'} dataKey - The key for the data to display.
 */
const appendItem = (item, timeframeType, dataKey) => {
  /** Maps the timeframe to the corresponding "previous" period's label. */
  const previousTextMap = new Map([
    // [timeframeType, previousPeriodText]
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

/**
 * Populates the entire dashboard based on the selected timeframe.
 * It first hides all time-related elements, then selectively un-hides and
 * populates the ones for the chosen timeframe.
 * @param {Array<object>} data - The full array of activity data from data.json.
 * @param {string} selectedTimeframe - The timeframe to display ('daily', 'weekly', 'monthly').
 */
const populateDOM = (data, selectedTimeframe) => {
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

// Use the Fetch API to retrieve data from the JSON file.
fetch(jsonData)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    // Populate dashboard with weekly data on initial load.
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
