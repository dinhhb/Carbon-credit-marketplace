"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React from "react";
import MarketplaceDataTable from "./MarketplaceDataTable";

interface DataTablesProps {
  type: "marketplace";
}

const DataTables: React.FC<DataTablesProps> = ({ type }) => {
  let dataTableComponent;

  switch (type) {
    case "marketplace":
      dataTableComponent = (
        <MarketplaceDataTable />
      );
      break;
    // default:
    //   dataTableComponent = (
    //     <>
    //       <DataTableOne /> <DataTableTwo />
    //     </>
    //   );
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
