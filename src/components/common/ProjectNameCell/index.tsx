export const renderProjectNameCell = (value: string) => {
  return value.length > 40 ? `${value.substring(0, 40)}...` : value;
};
