import React from "react";

/**
 * Render a status button based on the value provided.
 *
 * @param {string} value - The approval status value.
 * @returns {JSX.Element} A button element representing the status.
 */
export const renderStatusButton = (value: any) => {
  switch (value) {
    case "0":
    case 0:
      return (
        <button className="inline-flex rounded-full bg-warning px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
          Pending
        </button>
      );
    case "1":
    case 1:
      return (
        <button className="inline-flex rounded-full bg-success px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
          Approved
        </button>
      );
    case "2":
    case 2:
      return (
        <button className="inline-flex rounded-full bg-danger px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
          Declined
        </button>
      );
    default:
      return (
        <button className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90">
          {value}
        </button>
      );
  }
};
