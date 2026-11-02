export const retainFailedItems = (items, failures) =>
  items.filter((_, index) => failures[index]);
