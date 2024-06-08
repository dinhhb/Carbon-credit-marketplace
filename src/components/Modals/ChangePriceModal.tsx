import { Credit } from "@/types/credit";
import React, { useState, useEffect, useRef } from "react";

interface CreditProps {
  credit: Credit;
  changePrice: (tokenId: number, price: number) => Promise<void>;
}

const ChangePriceModal: React.FC<CreditProps> = ({ changePrice, credit }) => {
  const [changePriceModalOpen, setChangePriceModalOpen] = useState(false);
  const [price, setPrice] = useState("");

  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !changePriceModalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setChangePriceModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!changePriceModalOpen || keyCode !== 27) return;
      setChangePriceModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setChangePriceModalOpen(!changePriceModalOpen)}
        className="mr-1 rounded-md bg-primary px-2 py-1 font-medium text-white"
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
            d="M13.6 16.733c.234.269.548.456.895.534a1.4 1.4 0 0 0 1.75-.762c.172-.615-.446-1.287-1.242-1.481-.796-.194-1.41-.861-1.241-1.481a1.4 1.4 0 0 1 1.75-.762c.343.077.654.26.888.524m-1.358 4.017v.617m0-5.939v.725M4 15v4m3-6v6M6 8.5 10.5 5 14 7.5 18 4m0 0h-3.5M18 4v3m2 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
          />
        </svg>
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          changePriceModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          // onFocus={() => setChangePriceModalOpen(true)}
          // onBlur={() => setChangePriceModalOpen(false)}
          className="w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
        >
          <h3 className="py-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            Change Credits Price
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="w-1/3">Project name:</p>
            <p className="w-2/3">{credit.metadata.projectName}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="w-1/3">Current price:</p>
            <p className="w-2/3">{credit.pricePerCredit} ETH</p>
          </div>
          <div className="flex flex-col pb-10 pt-6">
            <div>
              <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
                Enter new price (ETH):
              </label>
              <input
                type="number"
                step={0.001}
                placeholder="1 ETH"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => setChangePriceModalOpen(false)}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => {
                  if (price && changePrice) {
                    changePrice(credit.tokenId, parseFloat(price));
                  } else if (!changePrice) {
                    alert("Change price function not available");
                  }
                }}
                disabled={!price}
                className={
                  price
                    ? "block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                    : "block w-full cursor-not-allowed rounded border border-bodydark bg-bodydark p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                }
              >
                Change Price
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePriceModal;
