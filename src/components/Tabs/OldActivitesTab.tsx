// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import MySpinner from "../Spinners/MySpinner";
// import { useWeb3 } from "../providers/web3";
// import CreditsCreationDataTable from "../DataTables/CreditsCreationDataTable";
// import {
//   CarbonCreditAuditedEvent,
//   CarbonCreditCreatedEvent,
//   CarbonCreditListedEvent,
//   CarbonCreditPurchasedEvent,
//   CarbonCreditRetiredEvent,
// } from "@/types/events";
// import { BigNumber } from "ethers";
// import { log } from "console";
// import CreditsApprovalDataTable from "../DataTables/CreditsApprovalDataTable";
// import CreditsListingDataTable from "../DataTables/CreditsListingDataTable";
// import CreditsPurchaseDataTable from "../DataTables/CarditsPurchaseDataTable";
// import CreditsRetirementDataTable from "../DataTables/CreditsRetirementDataTable";

// const ActivitiesTab: React.FC = () => {
//   const [openTab, setOpenTab] = useState(1);

//   const activeClasses = "bg-primary text-white";
//   const inactiveClasses = "bg-gray dark:bg-meta-4 text-black dark:text-white";

//   const { projectContract, marketContract } = useWeb3();
//   const [createdEvents, setCreatedEvents] = useState<
//     CarbonCreditCreatedEvent[]
//   >([]);
//   const [auditedEvents, setAuditedEvents] = useState<
//     CarbonCreditAuditedEvent[]
//   >([]);
//   const [listedEvents, setListedEvents] = useState<CarbonCreditListedEvent[]>(
//     [],
//   );
//   const [purchasedEvents, setPurchasedEvents] = useState<
//     CarbonCreditPurchasedEvent[]
//   >([]);
//   const [retiredEvents, setRetiredEvents] = useState<
//     CarbonCreditRetiredEvent[]
//   >([]);

//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     async function fetchEvents() {
//       if (!projectContract) return;

//       const _projectContract = projectContract as any;
//       const _marketContract = marketContract as any;

//       const createdFilter = _projectContract.filters.CarbonCreditCreated();
//       // console.log("Filter: ", filter);
//       const createdResults: any = await _projectContract.queryFilter(
//         createdFilter,
//         -10000,
//       ); // Last 10000 blocks

//       const createdEvents = createdResults.map((event: any) => ({
//         tokenId: event.args.tokenId.toNumber(),
//         initialOwner: event.args.initialOwner,
//         amount: event.args.amount.toNumber(),
//         creationTime: event.args.creationTime.toNumber(),
//       }));

//       const auditedFilter = _projectContract.filters.CarbonCreditAudited();
//       const auditedResults: any = await _projectContract.queryFilter(
//         auditedFilter,
//         -10000,
//       ); // Last 10000 blocks

//       const auditedEvents = auditedResults.map((event: any) => ({
//         tokenId: event.args.tokenId.toNumber(),
//         auditor: event.args.auditor,
//         projectOwner: event.args.projectOwner,
//         status: event.args.status,
//         time: event.args.time.toNumber(),
//       }));

//       const listedFilter = _marketContract.filters.CarbonCreditListed();
//       const listedResults: any = await _marketContract.queryFilter(
//         listedFilter,
//         -10000,
//       ); // Last 10000 blocks

//       const listedEvents = listedResults.map((event: any) => ({
//         tokenId: event.args.tokenId.toNumber(),
//         initialOwner: event.args.initialOwner,
//         amount: event.args.amount.toNumber(),
//         pricePerCredit: event.args.pricePerCredit.toNumber(),
//         time: event.args.time.toNumber(),
//       }));

//       const purchasedFilter = _marketContract.filters.CarbonCreditPurchased();
//       const purchasedResults: any = await _marketContract.queryFilter(
//         purchasedFilter,
//         -10000,
//       ); // Last 10000 blocks

//       const purchasedEvents = purchasedResults.map((event: any) => ({
//         tokenId: event.args.tokenId.toNumber(),
//         from: event.args.from,
//         to: event.args.to,
//         amount: event.args.amount.toNumber(),
//         time: event.args.time.toNumber(),
//       }));

//       const retiredFilter = _marketContract.filters.CarbonCreditRetired();
//       const retiredResults: any = await _marketContract.queryFilter(
//         retiredFilter,
//         -10000,
//       ); // Last 10000 blocks

//       const retiredEvents = retiredResults.map((event: any) => ({
//         tokenId: event.args.tokenId.toNumber(),
//         owner: event.args.owner,
//         amount: event.args.amount.toNumber(),
//         time: event.args.time.toNumber(),
//       }));

//       // console.log("Events: ", createdEvents);
//       setCreatedEvents(createdEvents);
//       setAuditedEvents(auditedEvents);
//       setListedEvents(listedEvents);
//       setPurchasedEvents(purchasedEvents);
//       setRetiredEvents(retiredEvents);
//       setIsLoading(false);
//     }

//     fetchEvents();
//   }, []);

//   // console.log("Created Events: ", createdEvents);

//   createdEvents.sort((a, b) => a.creationTime - b.creationTime);
//   createdEvents.reverse();
//   auditedEvents.sort((a, b) => a.time - b.time);
//   auditedEvents.reverse();

//   return (
//     <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
//       <div className="mb-7.5 flex flex-wrap gap-3 rounded-lg border border-stroke px-4 py-3 dark:border-strokedark">
//         <Link
//           href="#"
//           className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
//             openTab === 1 ? activeClasses : inactiveClasses
//           }`}
//           onClick={() => setOpenTab(1)}
//         >
//           Credits Creation
//         </Link>
//         <Link
//           href="#"
//           className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
//             openTab === 2 ? activeClasses : inactiveClasses
//           }`}
//           onClick={() => setOpenTab(2)}
//         >
//           Credits Approval
//         </Link>
//         <Link
//           href="#"
//           className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
//             openTab === 3 ? activeClasses : inactiveClasses
//           }`}
//           onClick={() => setOpenTab(3)}
//         >
//           Credits Listing
//         </Link>
//         <Link
//           href="#"
//           className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
//             openTab === 4 ? activeClasses : inactiveClasses
//           }`}
//           onClick={() => setOpenTab(3)}
//         >
//           Credits Purchase
//         </Link>
//         <Link
//           href="#"
//           className={`rounded-md px-4 py-3 text-sm font-medium hover:bg-primary hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
//             openTab === 5 ? activeClasses : inactiveClasses
//           }`}
//           onClick={() => setOpenTab(3)}
//         >
//           Credits Retirement
//         </Link>
//       </div>

//       <div>
//         {isLoading ? (
//           <MySpinner />
//         ) : (
//           <>
//             <div
//               className={`leading-relaxed ${openTab === 1 ? "block" : "hidden"}`}
//             >
//               <CreditsCreationDataTable events={createdEvents} />
//             </div>
//             <div
//               className={`leading-relaxed ${openTab === 2 ? "block" : "hidden"}`}
//             >
//               <CreditsApprovalDataTable events={auditedEvents} />
//             </div>
//             <div
//               className={`leading-relaxed ${openTab === 3 ? "block" : "hidden"}`}
//             >
//               <CreditsListingDataTable events={listedEvents} />
//             </div>
//             <div
//               className={`leading-relaxed ${openTab === 4 ? "block" : "hidden"}`}
//             >
//               <CreditsPurchaseDataTable events={purchasedEvents} />
//             </div>
//             <div
//               className={`leading-relaxed ${openTab === 5 ? "block" : "hidden"}`}
//             >
//               <CreditsRetirementDataTable events={retiredEvents} />
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ActivitiesTab;
