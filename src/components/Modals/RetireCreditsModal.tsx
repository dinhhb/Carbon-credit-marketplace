import { Credit } from "@/types/credit";
import React, { useState, useEffect, useRef } from "react";

interface CreditProps {
  credit: Credit;
  retireCredits: (tokenId: number, amount: number) => Promise<void>;
}

const RetireCreditsModal: React.FC<CreditProps> = ({ retireCredits, credit }) => {
  const [retireCreditModalOpen, setRetireCreditModalOpen] = useState(false);
  const [amountRetire, setAmountRetire] = useState("");

  const trigger = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDivElement>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (!retireCreditModalOpen || modal.current.contains(target as Node) || trigger.current?.contains(target as Node))
        return;
      setRetireCreditModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [retireCreditModalOpen]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!retireCreditModalOpen || keyCode !== 27) return;
      setRetireCreditModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [retireCreditModalOpen]);

  const handleRetireCredits = async () => {
    const amount = parseInt(amountRetire, 10);
    if (amount > credit.quantityOwned) {
      alert("Retire amount exceeds owned credits");
      return;
    }
    if (retireCredits) {
      console.log("Retire credits ID: ", credit.tokenId);
      await retireCredits(credit.tokenId, amount);
      console.log(`Retiring ${amountRetire} credits`);
      setRetireCreditModalOpen(false);
    } else {
      alert("Retire credit function not available");
    }
  };

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setRetireCreditModalOpen(!retireCreditModalOpen)}
        className="mr-1 rounded-md bg-danger px-2 py-1 font-medium text-white"
      >
        Retire
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          retireCreditModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          className="w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
        >
          <span className="mx-auto inline-block">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                opacity="0.1"
                width="60"
                height="60"
                rx="30"
                fill="#DC2626"
              />
              <path
                d="M30 27.2498V29.9998V27.2498ZM30 35.4999H30.0134H30ZM20.6914 41H39.3086C41.3778 41 42.6704 38.7078 41.6358 36.8749L32.3272 20.3747C31.2926 18.5418 28.7074 18.5418 27.6728 20.3747L18.3642 36.8749C17.3296 38.7078 18.6222 41 20.6914 41Z"
                stroke="#DC2626"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="mt-5.5 pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            Retire Your Credits
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-full rounded bg-danger"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Max amount:</p>
            <p className="flex-1">{credit.quantityOwned}</p>
          </div>
          <div className="flex flex-col py-6.5">
            <div>
              <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
                Enter the amount of credits you want to retire:
              </label>
              <input
                type="number"
                placeholder="Credits Amount"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={amountRetire}
                onChange={(e) => setAmountRetire(e.target.value)}
              />
            </div>
          </div>
          <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => setRetireCreditModalOpen(false)}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={handleRetireCredits}
                disabled={!amountRetire}
                className={
                  amountRetire
                    ? "block w-full rounded border border-danger bg-danger p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                    : "block w-full cursor-not-allowed rounded border border-bodydark bg-bodydark p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                }
              >
                Retire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetireCreditsModal;
