"use client";
import React, { ChangeEvent, useState } from "react";

interface CreditMetaProps {
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  hasError: boolean;
}

const SelectGroupRetirement: React.FC<CreditMetaProps> = ({
  handleChange,
  hasError,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className="mb-4.5">
      <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
        Retirement reason <span className="text-meta-1">*</span>
      </label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={selectedOption}
          name="retirementReason"
          onChange={(e) => {
            handleChange(e); // Using the passed handleChange which needs to handle select elements
            setSelectedOption(e.target.value);
            changeTextColor();
          }}
          className={`relative z-20 w-full appearance-none rounded border ${
            hasError
              ? "dark:border-form-danger border-danger focus:border-danger active:border-danger dark:focus:border-danger"
              : "border-stroke focus:border-primary active:border-primary dark:border-form-strokedark dark:focus:border-primary"
          } bg-transparent px-5 py-3 outline-none transition dark:bg-form-input`}
        >
          <option value="" disabled className="text-body dark:text-bodydark">
            Select retirement reason
          </option>
          <option
            value="Environmental Benefit"
            className="text-body dark:text-bodydark"
          >
            Environmental Benefit
          </option>
          <option
            value="Retirement for Person or Organisation"
            className="text-body dark:text-bodydark"
          >
            Retirement for Person or Organisation
          </option>
          <option
            value="Retail Programme Requirements"
            className="text-body dark:text-bodydark"
          >
            Retail Programme Requirements
          </option>
          <option
            value="Compliance Requirements"
            className="text-body dark:text-bodydark"
          >
            Compliance Requirements
          </option>
          <option
            value="Green-e Climate Certification"
            className="text-body dark:text-bodydark"
          >
            Green-e Climate Certification
          </option>
          <option
            value="NCOS Programme"
            className="text-body dark:text-bodydark"
          >
            NCOS Programme
          </option>
          <option
            value="Section 13 of the South African Carbon Tax Act"
            className="text-body dark:text-bodydark"
          >
            Section 13 of the South African Carbon Tax Act
          </option>
          <option value="Other" className="text-body dark:text-bodydark">
            Other
          </option>
        </select>

        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default SelectGroupRetirement;
