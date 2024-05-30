"use client";
import React, { ChangeEvent, useState } from "react";

interface CreditMetaProps {
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  hasError: boolean;
}

const SelectGroupStandard: React.FC<CreditMetaProps> = ({
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
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        Standard <span className="text-meta-1">*</span>
      </label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={selectedOption}
          name="standard"
          onChange={(e) => {
            handleChange(e); // Using the passed handleChange which needs to handle select elements
            setSelectedOption(e.target.value);
            changeTextColor();
          }}
          className={`relative z-20 w-full appearance-none rounded border  bg-transparent ${
            hasError ? "border-danger dark:border-form-danger focus:border-danger active:border-danger dark:focus:border-danger" : "border-stroke dark:border-form-strokedark focus:border-primary active:border-primary dark:focus:border-primary" 
          } px-5 py-3 outline-none transition  dark:bg-form-input`}
        >
          <option value="" disabled className="text-body dark:text-bodydark">
            Select standard
          </option>
          <option value="VCS" className="text-body dark:text-bodydark">
            Verified Carbon Standard (VCS)
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

export default SelectGroupStandard;
