import React, { useState } from "react";
import Link from "next/link";
import MySpinner from "../Spinners/MySpinner";
import { Retirement } from "@/types/retirement";
import { useOwnedRetirements } from "@/hooks/web3";
import PendingRetirementsDataTable from "../DataTables/PendingRetirementsDataTable";
import CertificatedRetirementsDataTable from "../DataTables/CertificatedRetirementsDataTable";

const RetirementsTab: React.FC = () => {
  const [openTab, setOpenTab] = useState(1);
  const activeClasses = "bg-primary text-white";
  const inactiveClasses = "bg-gray dark:bg-meta-4 text-black dark:text-white";

  const { retirements } = useOwnedRetirements();
  // console.log("Data:", retirements.data);

  const pendingCertifications = retirements.data?.filter(
    (retirement) => retirement.isCertificated === false,
  ) as Retirement[];
  const certifiedRetirements = retirements.data?.filter(
    (retirement) => retirement.isCertificated === true,
  ) as Retirement[];

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
            Pending Certification
          </Link>
          <Link
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === 2 ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(2)}
          >
            Certificated
          </Link>
        </div>
      </div>
      {retirements.isLoading ? (
        <MySpinner />
      ) : (
        <>
          <div>
            <div
              className={`leading-relaxed ${openTab === 1 ? "block" : "hidden"}`}
            >
              <PendingRetirementsDataTable retirements={pendingCertifications}/>
            </div>
            <div
              className={`leading-relaxed ${openTab === 2 ? "block" : "hidden"}`}
            >
              <CertificatedRetirementsDataTable retirements={certifiedRetirements}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RetirementsTab;
