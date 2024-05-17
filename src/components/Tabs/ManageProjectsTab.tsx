import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useAllCredits } from "@/hooks/web3";
import { Credit } from "@/types/credit";
import ManagePendingProjectsDataTable from "../DataTables/ManagePendingProjectsDataTable";
import ManageApprovedProjectsDataTable from "../DataTables/ManageApprovedProjectsDataTable";
import ManageDeclinedProjectsDataTable from "../DataTables/ManageDeclinedProjectsDataTable";
import MySpinner from "../Spinners/MySpinner";

const ManageProjectsTab: React.FC = () => {
  const [openTab, setOpenTab] = useState(1);

  const activeClasses = "bg-primary text-white";
  const inactiveClasses = "bg-gray dark:bg-meta-4 text-black dark:text-white";

  const { credits } = useAllCredits();
  // console.log(credits.data);
  const { account } = useAccount();
  // console.log(account.data);
  const approveProject = credits.approveProject;
  const declineProject = credits.declineProject;

  const pendingCredits = credits.data?.filter(
    (credit) => credit.approvalStatus === "0",
  ) as Credit[];
  const approvedCredits = credits.data?.filter(
    (credit) => credit.approvalStatus === "1",
  ) as Credit[];
  const declinedCredits = credits.data?.filter(
    (credit) => credit.approvalStatus === "2",
  ) as Credit[];

  return (
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-7.5 flex flex-wrap gap-3 rounded-lg border border-stroke px-4 py-3 dark:border-strokedark">
        <Link
          href="#"
          className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
            openTab === 1 ? activeClasses : inactiveClasses
          }`}
          onClick={() => setOpenTab(1)}
        >
          Pending projects
        </Link>
        <Link
          href="#"
          className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
            openTab === 2 ? activeClasses : inactiveClasses
          }`}
          onClick={() => setOpenTab(2)}
        >
          Approved projects
        </Link>
        <Link
          href="#"
          className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
            openTab === 3 ? activeClasses : inactiveClasses
          }`}
          onClick={() => setOpenTab(3)}
        >
          Declined projects
        </Link>
      </div>
      {credits.isLoading ? (
        <MySpinner />
      ) : (
        <>
          <div>
            <div
              className={`leading-relaxed ${openTab === 1 ? "block" : "hidden"}`}
            >
              <ManagePendingProjectsDataTable
                credits={pendingCredits}
                approveProject={approveProject}
                declineProject={declineProject}
              />
            </div>
            <div
              className={`leading-relaxed ${openTab === 2 ? "block" : "hidden"}`}
            >
              <ManageApprovedProjectsDataTable credits={approvedCredits} />
            </div>
            <div
              className={`leading-relaxed ${openTab === 3 ? "block" : "hidden"}`}
            >
              <ManageDeclinedProjectsDataTable credits={declinedCredits} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageProjectsTab;
