/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

const STORAGE_PANES_KEY = "3c.tv.tempPanes";
const STORAGE_BARS_STYLE_KEY = "3c.tv.tempBarStyle";

/**
 * Returns the MainSeries object from panes array
 * @param {object[]} panes
 * @returns {object | null}
 */
const getMainSeriesObject = (panes) => {
  for (let pane of panes) {
    const index = pane.sources.findIndex((item) => item.type === "MainSeries");

    if (index !== -1) {
      return pane.sources[index];
    }
  }

  return null;
};

/**
 * Gets data from local storage and tries to parse the received data. Returns
 * parsed data or null in failure
 */
const getStoredObject = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {}

  return null;
};

/**
 * Gets saved data, puts it in current state, and returns a new state object
 * @param {object} currentState Current state to join with saved data
 * @returns {object} The state object
 */
export const getTempState = (currentState) => {
  const currentPanes = currentState?.charts?.[0]?.panes;

  if (!Array.isArray(currentPanes)) {
    return currentState;
  }

  const savedPanes = getStoredObject(STORAGE_PANES_KEY) ?? [];
  const savedBarsStyle = getStoredObject(STORAGE_BARS_STYLE_KEY);
  const currentMainSeries = getMainSeriesObject(currentPanes);

  const { symbol } = currentMainSeries.state;

  const nextMainSeries =
    savedBarsStyle != null
      ? {
          ...currentMainSeries,
          state: {
            ...currentMainSeries.state,
            style: parseInt(savedBarsStyle, 10),
          },
        }
      : currentMainSeries;

  // Removing objects matching only a certain symbol
  const [firstPane, ...restPanes] = savedPanes.map((pane) => ({
    ...pane,
    sources: pane.sources.filter((source) => source.state.symbol !== symbol),
  }));

  return {
    ...currentState,
    charts: [
      {
        ...currentState.charts?.[0],
        panes: [
          {
            ...firstPane,
            sources: [nextMainSeries, ...(firstPane ? firstPane.sources : [])],
          },
          ...(restPanes ?? []),
        ],
      },
    ],
  };
};

/**
 * Saves chart state for display in other charts
 * @param {object} state State to save
 */
export const saveTempState = (state) => {
  const panes = state?.charts?.[0]?.panes;

  if (!Array.isArray(panes)) {
    return;
  }

  const mainSeriesObject = getMainSeriesObject(panes);
  const barsStyle = mainSeriesObject?.state?.style;

  // Removing the `MainSeries` panel from data to be saved
  const panesToSave = panes.map((pane) => ({
    ...pane,
    sources: pane.sources.filter((obj) => obj !== mainSeriesObject),
  }));

  // Save bar styles
  if (barsStyle != null) {
    localStorage.setItem(STORAGE_BARS_STYLE_KEY, barsStyle);
  }

  // Save panes
  localStorage.setItem(STORAGE_PANES_KEY, JSON.stringify(panesToSave));
};
