export const renderTimeCell = (value: number) => {
  return new Date(value * 1000).toLocaleString(); // Convert Unix timestamp to a readable date
};
