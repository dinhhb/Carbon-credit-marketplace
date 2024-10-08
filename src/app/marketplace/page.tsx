;import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTables from "@/components/DataTables";

export const metadata: Metadata = {
  title: "Marketplace"
};

const MarketplacePage = () => {
  return (
    <DefaultLayout>
      <DataTables type="marketplace"/>
    </DefaultLayout>
  );
};

export default MarketplacePage;