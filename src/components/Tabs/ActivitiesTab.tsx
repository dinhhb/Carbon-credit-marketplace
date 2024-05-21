import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import MySpinner from "../Spinners/MySpinner";
import { useWeb3 } from "../providers/web3";
import { BigNumber, ethers } from "ethers";
import CreditsCreationDataTable from "../DataTables/CreditsCreationDataTable";
import {
  CarbonCreditAuditedEvent,
  CarbonCreditCreatedEvent,
  CarbonCreditListedEvent,
  CarbonCreditPurchasedEvent,
  CarbonCreditRetiredEvent,
} from "@/types/events";
import CreditsApprovalDataTable from "../DataTables/CreditsApprovalDataTable";
import CreditsListingDataTable from "../DataTables/CreditsListingDataTable";
import CreditsPurchaseDataTable from "../DataTables/CreditsPurchaseDataTable";
import CreditsRetirementDataTable from "../DataTables/CreditsRetirementDataTable";

const ActivitiesTab: React.FC = () => {
  const [openTab, setOpenTab] = useState(1);
  const [eventsData, setEventsData] = useState({
    createdEvents: [] as CarbonCreditCreatedEvent[],
    auditedEvents: [] as CarbonCreditAuditedEvent[],
    listedEvents: [] as CarbonCreditListedEvent[],
    purchasedEvents: [] as CarbonCreditPurchasedEvent[],
    retiredEvents: [] as CarbonCreditRetiredEvent[],
  });
  const [isLoading, setIsLoading] = useState(true);

  const { projectContract, marketContract } = useWeb3();

  const fetchEvents = useCallback(async () => {
    if (!projectContract || !marketContract) return;

    const _projectContract = projectContract as any;
    const _marketContract = marketContract as any;

    const fetchEvent = async (contract: any, filter: any, parser: (event: any) => any) => {
      const results: any = await contract.queryFilter(filter, -10000);
      return results.map(parser).reverse(); // Reverse the order to have latest events first
    };

    const createdEvents = await fetchEvent(
      _projectContract,
      _projectContract.filters.CarbonCreditCreated(),
      (event) => ({
        tokenId: BigNumber.from(event.args.tokenId).toString(),
        initialOwner: event.args.initialOwner,
        amount: BigNumber.from(event.args.amount).toString(),
        creationTime: BigNumber.from(event.args.creationTime).toString(),
      })
    );

    const auditedEvents = await fetchEvent(
      _projectContract,
      _projectContract.filters.CarbonCreditAudited(),
      (event) => ({
        tokenId: BigNumber.from(event.args.tokenId).toString(),
        auditor: event.args.auditor,
        projectOwner: event.args.projectOwner,
        status: event.args.status,
        time: BigNumber.from(event.args.time).toString(),
      })
    );

    const listedEvents = await fetchEvent(
      _marketContract,
      _marketContract.filters.CarbonCreditListed(),
      (event) => ({
        tokenId: BigNumber.from(event.args.tokenId).toString(),
        initialOwner: event.args.initialOwner,
        amount: BigNumber.from(event.args.amount).toString(),
        pricePerCredit: ethers.utils.formatEther(BigNumber.from(event.args.pricePerCredit)), // Convert wei to ether
        time: BigNumber.from(event.args.time).toString(),
      })
    );

    const purchasedEvents = await fetchEvent(
      _marketContract,
      _marketContract.filters.CarbonCreditPurchased(),
      (event) => ({
        tokenId: BigNumber.from(event.args.tokenId).toString(),
        from: event.args.from,
        to: event.args.to,
        amount: BigNumber.from(event.args.amount).toString(),
        time: BigNumber.from(event.args.time).toString(),
      })
    );

    const retiredEvents = await fetchEvent(
      _marketContract,
      _marketContract.filters.CarbonCreditRetired(),
      (event) => ({
        tokenId: BigNumber.from(event.args.tokenId).toString(),
        owner: event.args.owner,
        amount: BigNumber.from(event.args.amount).toString(),
        time: BigNumber.from(event.args.time).toString(),
      })
    );

    setEventsData({
      createdEvents,
      auditedEvents,
      listedEvents,
      purchasedEvents,
      retiredEvents,
    });

    setIsLoading(false);
  }, [projectContract, marketContract]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const renderDataTable = () => {
    switch (openTab) {
      case 1:
        return <CreditsCreationDataTable events={eventsData.createdEvents} />;
      case 2:
        return <CreditsApprovalDataTable events={eventsData.auditedEvents} />;
      case 3:
        return <CreditsListingDataTable events={eventsData.listedEvents} />;
      case 4:
        return <CreditsPurchaseDataTable events={eventsData.purchasedEvents} />;
      case 5:
        return <CreditsRetirementDataTable events={eventsData.retiredEvents} />;
      default:
        return null;
    }
  };

  const tabLinks = [
    { id: 1, label: "Credits Creation" },
    { id: 2, label: "Credits Approval" },
    { id: 3, label: "Credits Listing" },
    { id: 4, label: "Credits Purchase" },
    { id: 5, label: "Credits Retirement" },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-7.5 flex flex-wrap gap-3 rounded-lg border border-stroke px-4 py-3 dark:border-strokedark">
        {tabLinks.map((tab) => (
          <Link
            key={tab.id}
            href="#"
            className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
              openTab === tab.id ? "bg-primary text-white" : "bg-gray dark:bg-meta-4 text-black dark:text-white"
            }`}
            onClick={() => setOpenTab(tab.id)}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div>
        {isLoading ? <MySpinner /> : renderDataTable()}
      </div>
    </div>
  );
};

export default ActivitiesTab;
