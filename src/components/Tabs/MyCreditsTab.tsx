import React, { useState } from "react";
import Link from "next/link";
import MyListedCreditsDataTable from "../DataTables/MyListedCreditsDataTable";
import MyUnlistedCreditsDataTable from "../DataTables/MyUnlistedCreditsDataTable";
import { useAccount, useOwnedCredits } from "@/hooks/web3";
import { Credit } from "@/types/credit";
import MyPurchasedCreditsDataTable from "../DataTables/MyPurchasedCreditsDataTable";
import MySpinner from "../Spinners/MySpinner";
import CheckUserRegistration from "../common/CheckUserRegistration";

const MyCreditsTab: React.FC = () => {
  const [openTab, setOpenTab] = useState(1);

  const activeClasses = "bg-primary text-white";
  const inactiveClasses = "bg-gray dark:bg-meta-4 text-black dark:text-white";

  const { credits } = useOwnedCredits();
  const { account } = useAccount();

  const listedCredits = credits.data?.filter(
    (credit) => credit.isListed && credit.initialOwner == account.data,
  ) as Credit[];
  const unlistedCredits = credits.data?.filter(
    (credit) => !credit.isListed && credit.initialOwner == account.data,
  ) as Credit[];
  const purchasedCredits = credits.data?.filter(
    (credit) => credit.initialOwner != account.data,
  ) as Credit[];

  const changePrice = credits.changePrice;
  const delistCredits = credits.delistCredits;
  const listCredits = credits.listCredits;

  return (
    <CheckUserRegistration>
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-7.5 flex flex-wrap gap-3 rounded-lg border border-stroke px-4 py-3 dark:border-strokedark">
          <Link
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === 1 ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(1)}
          >
            Listed credits
          </Link>
          <Link
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === 2 ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(2)}
          >
            Unlisted credits
          </Link>
          <Link
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === 3 ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(3)}
          >
            Purchased credits
          </Link>
        </div>

        <div>
          {credits.isLoading ? (
            <MySpinner />
          ) : (
            <>
              <div
                className={`leading-relaxed ${openTab === 1 ? "block" : "hidden"}`}
              >
                <MyListedCreditsDataTable
                  credits={listedCredits}
                  delistCredits={delistCredits}
                  changePrice={changePrice}
                />
              </div>
              <div
                className={`leading-relaxed ${openTab === 2 ? "block" : "hidden"}`}
              >
                <MyUnlistedCreditsDataTable
                  listCredit={listCredits}
                  credits={unlistedCredits}
                />
              </div>
              <div
                className={`leading-relaxed ${openTab === 3 ? "block" : "hidden"}`}
              >
                <MyPurchasedCreditsDataTable
                  credits={purchasedCredits}
                  retireCredits={credits.retireCredits}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </CheckUserRegistration>
  );
};

export default MyCreditsTab;
