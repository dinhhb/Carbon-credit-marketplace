;import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tabs from "@/components/Tabs";

export const metadata: Metadata = {
  title: "Manage Accounts"
};

const MarketplacePage = () => {
  return (
    <DefaultLayout>
      <Tabs type="manage-accounts"/>
    </DefaultLayout>
  );
};

export default MarketplacePage;