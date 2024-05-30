import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTables from "@/components/DataTables";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon market",
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
