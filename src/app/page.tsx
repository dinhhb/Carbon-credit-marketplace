import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTables from "@/components/DataTables";

export const metadata: Metadata = {
  title: "Carbon credit marketplace",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <DataTables type="marketplace" />
      </DefaultLayout>
    </>
  );
}
