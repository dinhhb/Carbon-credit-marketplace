"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MyCreditsTab from "./MyCreditsTab";
import ManageProjectsTab from "./ManageProjectsTab";
import ActivitiesTab from "./ActivitiesTab";
import ManageAccountsTab from "./ManageAccountsTab";
import TotalCreditsDataStats from "../DataStats/TotalCreditsDataStats";
import { useAccount, useAccounts } from "@/hooks/web3";
import ManageRetirementsTab from "./ManageRetirementsTab";
import RetirementsTab from "./RetirementsTab";

interface TabsProps {
  type: "my-credits" | "manage-projects" | "manage-accounts" | "activities" | "manage-retirements" | "retirements";
}

const Tabs: React.FC<TabsProps> = ({ type }) => {
  const { account } = useAccount();
  const { accounts } = useAccounts();

  // Initialize the variables with default values
  let totalCredits: number = 0;
  let totalRetire: number = 0;

  for (let i = 0; i < accounts.data!.length; i++) {
    if (accounts.data![i].address === account.data) {
      totalCredits = accounts.data![i].totalCredits;
      totalRetire = accounts.data![i].totalRetire;
    }
  }

  let tabComponent;
  switch (type) {
    case "my-credits":
      tabComponent = <MyCreditsTab />;
      break;
    case "manage-projects":
      tabComponent = <ManageProjectsTab />;
      break;
    case "activities":
      tabComponent = <ActivitiesTab />;
      break;
    case "manage-accounts":
      tabComponent = <ManageAccountsTab />;
      break;
    case "manage-retirements":
      tabComponent = <ManageRetirementsTab />;
      break;
    case "retirements":
      tabComponent = <RetirementsTab />;
      break;
  }

  return (
    <>
      <Breadcrumb
        pageName={
          type === "my-credits"
            ? "My Credits"
            : type === "manage-projects"
              ? "Manage Projects"
              : type === "manage-accounts"
                ? "Manage Accounts"
                : type === "manage-retirements"
                  ? "Manage Retirements"
                  : type === "retirements"
                    ? "Retirements"
                : "Activities"
        }
      />
      {type === "my-credits" && (
        <TotalCreditsDataStats totalCredits={totalCredits} totalRetire={totalRetire} />
      )}
      <div className="flex flex-col gap-9">{tabComponent}</div>
    </>
  );
};

export default Tabs;
