;import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tabs from "@/components/Tabs";

export const metadata: Metadata = {
  title: "Manage Projects"
};

const MarketplacePage = () => {
  return (
    <DefaultLayout>
      <Tabs type="manage-projects"/>
    </DefaultLayout>
  );
};

export default MarketplacePage;