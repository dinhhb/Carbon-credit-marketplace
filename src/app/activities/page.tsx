;import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tabs from "@/components/Tabs";


export const metadata: Metadata = {
  title: "Activities",
};

const Activities = () => {
  return (
    <DefaultLayout>
      <Tabs type="activities" />
    </DefaultLayout>
  );
};

export default Activities;