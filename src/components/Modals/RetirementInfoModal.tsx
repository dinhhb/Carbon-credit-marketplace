import React, { useState, useEffect, useRef } from "react";
import { Retirement } from "@/types/retirement";
import { renderTimeCell } from "../common/TimeCell";

interface RetirementProps {
  retirement: Retirement;
}

const RetirementInfoModal: React.FC<RetirementProps> = ({ retirement }) => {
  const [retirementInfoModalOpen, setRetirementInfoModalOpen] = useState(false);

  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !retirementInfoModalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setRetirementInfoModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!retirementInfoModalOpen || keyCode !== 27) return;
      setRetirementInfoModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setRetirementInfoModalOpen(!retirementInfoModalOpen)}
        className="mr-1 rounded-md bg-body px-2 py-1 font-medium text-white"
      >
        <svg
          className="text-gray-800 h-6 w-6 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          retirementInfoModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          className="max-h-full w-full max-w-142.5 overflow-y-auto rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
          style={{ maxHeight: "90vh", maxWidth: "60vw" }}
        >
          <h3 className="pb-2 text-center text-xl font-bold text-black dark:text-white sm:text-2xl">
            Retirement Information
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Retirement ID:</p>
            <p className="flex-1">{retirement.retirementId}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Owner:</p>
            <p className="flex-1">{retirement.owner}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Time:</p>
            <p className="flex-1">{renderTimeCell(retirement.time)}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Amount:</p>
            <p className="flex-1">{retirement.metadata.amount}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Beneficial owner:</p>
            <p className="flex-1">{retirement.metadata.beneficialOwner}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Retirement reason:</p>
            <p className="flex-1">{retirement.metadata.retirementReason}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Retirement reason details:</p>
            <p className="flex-1">
              {retirement.metadata.retirementReasonDetails}
            </p>
          </div>
          <div className="py-6">
            <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
              VCU Retirement Certification{" "}
              <span className="text-meta-1">*</span>
            </label>
            <input
              type="file"
              className={`"border-stroke dark:focus:border-primary" } w-full cursor-pointer rounded-lg border-[1.5px] bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary focus:border-primary active:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark  dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white
              dark:focus:border-primary`}
            />
          </div>

          <div className="flex justify-center space-x-4">
            {/* <ConfirmBuyCreditsModal buyCredit={buyCredit} credit={credit} /> */}
            <button className="w-32 rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementInfoModal;
