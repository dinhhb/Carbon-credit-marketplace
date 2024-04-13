;import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tabs from "@/components/Tabs";


export const metadata: Metadata = {
  title: "My-credits"
};

const MyCreditsPage = () => {
  return (
    <DefaultLayout>
      <Tabs type="my-credits" />
    </DefaultLayout>
  );
};

export default MyCreditsPage;