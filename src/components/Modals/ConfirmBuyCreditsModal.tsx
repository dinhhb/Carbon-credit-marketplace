import { useAccount } from "@/hooks/web3";
import { Credit } from "@/types/credit";
import React, { useState, useEffect, useRef } from "react";

interface CreditProps {
  credit: Credit;
  buyCredit: (tokenId: number, amount: number, value: number) => Promise<void>;
}

const ConfirmBuyCreditsModal: React.FC<CreditProps> = ({
  buyCredit,
  credit,
}) => {
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [amountBuy, setAmountBuy] = useState("");

  const trigger = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !buyCreditsModalOpen ||
        modal.current.contains(target as Node) ||
        trigger.current?.contains(target as Node)
      )
        return;
      setBuyCreditsModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [buyCreditsModalOpen]);

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!buyCreditsModalOpen || keyCode !== 27) return;
      setBuyCreditsModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [buyCreditsModalOpen]);

  const { account } = useAccount();

  const handleBuyCredits = async () => {
    const amount = parseInt(amountBuy, 10);

    if (amount > credit.quantity - credit.quantitySold) {
      alert("Buy amount exceeds listed credits");
      return;
    }

    if (credit.initialOwner === account.data) {
      alert("You can't buy your own credits");
      return;
    }

    if (buyCredit) {
      console.log("Buying credits ID: ", credit.tokenId);
      await buyCredit(credit.tokenId, amount, amount * credit.pricePerCredit);
      setBuyCreditsModalOpen(false);
    } else {
      alert("Buy credit function not available");
    }
  };

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setBuyCreditsModalOpen(!buyCreditsModalOpen)}
        className="block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
      >
        Buy Credits
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          buyCreditsModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          className="w-full max-w-142.5 rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
        >
          <h3 className="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            Buy Credits
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Max amount:</p>
            <p className="flex-1">{credit.quantity - credit.quantitySold}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Price per credit:</p>
            <p className="flex-1">{credit.pricePerCredit}</p>
          </div>
          <div className="flex flex-col py-6.5">
            <div>
              <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
                Enter the amount of credits you want to buy:
              </label>
              <input
                type="number"
                placeholder="Credits Amount"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={amountBuy}
                onChange={(e) => setAmountBuy(e.target.value)}
              />
            </div>
          </div>
          <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => setBuyCreditsModalOpen(false)}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={handleBuyCredits}
                disabled={!amountBuy}
                className={
                  amountBuy
                    ? "block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                    : "block w-full cursor-not-allowed rounded border border-bodydark bg-bodydark p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                }
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBuyCreditsModal;
