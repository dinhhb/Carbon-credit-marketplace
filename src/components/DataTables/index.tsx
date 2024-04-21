"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DataTableOne from "@/components/DataTables/DataTableOne";
import DataTableTwo from "@/components/DataTables/DataTableTwo";
import React from "react";
import MarketplaceDataTable from "./MarketplaceDataTable";
import { useListedCredits } from "@/hooks/web3";
import { Credit } from  "@/types/credit";

interface DataTablesProps {
  type: "marketplace";
}

const DataTables: React.FC<DataTablesProps> = ({ type }) => {
  let dataTableComponent;

  const { credits } = useListedCredits();
  // console.log(credits.data);

  switch (type) {
    case "marketplace":
      dataTableComponent = <MarketplaceDataTable credits={credits.data as Credit[] } />; // Update the type of the credits prop
      break;
    default:
      dataTableComponent = (
        <>
          <DataTableOne /> <DataTableTwo />
        </>
      );
  }

  return (
    <>
      <Breadcrumb
        pageName={type === "marketplace" ? "Marketplace" : "Data Tables"}
      />
      <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
        {dataTableComponent}
      </div>
    </>
  );
};

export default DataTables;
