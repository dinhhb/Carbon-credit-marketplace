import React, { useState } from "react";
import Link from "next/link";
import { useAccounts } from "@/hooks/web3";
import ManageAuditorsDataTable from "../DataTables/ManageAuditorsDataTable";
import MySpinner from "../Spinners/MySpinner";
import { Account } from "@/types/account";
import ManageUsersDataTable from "../DataTables/ManageUsersDataTable";
import RegisterAccountForm from "../Form/RegisterAccountForm";

const ManageAccountsTab: React.FC = () => {
  const [openTab, setOpenTab] = useState(1);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const activeClasses = "bg-primary text-white";
  const inactiveClasses = "bg-gray dark:bg-meta-4 text-black dark:text-white";

  const handleRegistrationSuccess = () => {
    setShowRegisterForm(false);
    setOpenTab(1); // Optionally, you can set it to the desired tab after registration
  };

  const { accounts } = useAccounts();
  // console.log(account.data);
  const registerAuditor = accounts.registerAuditor;
  const registerUser = accounts.registerUser;
  const removeAccount = accounts.removeAccount;

  const auditors = accounts.data?.filter(
    (account) => account.isAuditor,
  ) as Account[];
  const users = accounts.data?.filter(
    (account) => !account.isAuditor,
  ) as Account[];

  if (showRegisterForm) {
    return (
      <RegisterAccountForm
        registerAuditor={registerAuditor}
        registerUser={registerUser}
        onSuccess={handleRegistrationSuccess}
        onBack={() => setShowRegisterForm(false)}
      />
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-7.5 flex flex-wrap items-center justify-between rounded-lg border border-stroke px-4 py-3 dark:border-strokedark">
        <div className="flex gap-3">
          <Link
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === 1 ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(1)}
          >
            Auditor
          </Link>
          <Link
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === 2 ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(2)}
          >
            User
          </Link>
        </div>
        <Link
          href="#"
          className={`rounded-md bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-opacity-90 md:text-base lg:px-6`}
          onClick={() => setShowRegisterForm(true)}
        >
          Register New
        </Link>
      </div>
      {accounts.isLoading ? (
        <MySpinner />
      ) : (
        <>
          <div>
            <div
              className={`leading-relaxed ${openTab === 1 ? "block" : "hidden"}`}
            >
              <ManageAuditorsDataTable
                accounts={auditors}
                removeAccount={removeAccount}
              />
            </div>
            <div
              className={`leading-relaxed ${openTab === 2 ? "block" : "hidden"}`}
            >
              <ManageUsersDataTable
                accounts={users}
                removeAccount={removeAccount}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageAccountsTab;
