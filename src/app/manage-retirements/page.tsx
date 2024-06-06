;import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tabs from "@/components/Tabs";

export const metadata: Metadata = {
  title: "Manage Retirements"
};

const MarketplacePage = () => {
  return (
    <DefaultLayout>
      <Tabs type="manage-retirements"/>
    </DefaultLayout>
  );
};

export default MarketplacePage;