import React, { useState, useEffect, useRef } from "react";
import ConfirmBuyCreditsModal from "../Modals/ConfirmBuyCreditsModal";
import { Credit } from "@/types/credit";

interface CreditProps {
  credit: Credit;
}

const CreditInfoModal: React.FC<CreditProps> = ({ credit }) => {
  // console.log(credit);
  const [creditInfoModalOpen, setCreditInfoModalOpen] = useState(false);

  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !creditInfoModalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setCreditInfoModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!creditInfoModalOpen || keyCode !== 27) return;
      setCreditInfoModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setCreditInfoModalOpen(!creditInfoModalOpen)}
        className="mr-1 rounded-md bg-body px-2 py-1 font-medium text-white"
      >
        <svg
          className="text-gray-800 h-6 w-6 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          creditInfoModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          className="max-h-full w-full max-w-142.5 overflow-y-auto rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
          style={{ maxHeight: "90vh", maxWidth: "60vw" }}
        >
          <h3 className="pb-2 text-left text-xl font-bold text-black dark:text-white sm:text-2xl">
            {credit.metadata.projectName}
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-full rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Project ID:</p>
            <p className="flex-1">{credit.metadata.projectId}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Region:</p>
            <p className="flex-1">{credit.metadata.origin}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Project type:</p>
            <p className="flex-1">{credit.metadata.projectType}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Crediting period start:</p>
            <p className="flex-1">{credit.metadata.vintageFrom.toString()}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Crediting period end:</p>
            <p className="flex-1">{credit.metadata.vintageTo.toString()}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Quantity issued:</p>
            <p className="flex-1">{credit.metadata.quantity}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Quantity sold:</p>
            <p className="flex-1">{credit.quantitySold}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Offer price:</p>
            <p className="flex-1">{credit.pricePerCredit}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Registry reference:</p>
            <p className="flex-1">
              <a
                href="https://registry.verra.org/app/projectDetail/VCS/2595"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-dark overflow-hidden break-all text-primary"
              >
                {credit.metadata.registryLink}
              </a>
            </p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Seller&apos;s Verra registry account name:</p>
            <p className="flex-1">{credit.metadata.registryAccountName}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">
              Seller&apos;s Verra registry account number:
            </p>
            <p className="flex-1">{credit.metadata.registryAccountNo}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">VCS issuance document:</p>
            <p className="flex-1">
              <a
                href={credit.metadata.document}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-dark overflow-hidden break-all text-primary"
              >
                {credit.metadata.document}
              </a>
            </p>
          </div>

          <div className="mb-4 flex items-start pt-6 text-left">
            <p className="flex-1 font-bold text-primary dark:text-white">
              You own {credit.quantityOwned} credits of this project
            </p>
          </div>

          {/* <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => setCreditInfoModalOpen(false)}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <ConfirmBuyCreditsModal buyCredit={buyCredit} credit={credit} />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CreditInfoModal;
