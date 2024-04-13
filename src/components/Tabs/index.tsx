"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TabOne from "@/components/Tabs/TabOne";
import TabTwo from "@/components/Tabs/TabTwo";
import TabThree from "@/components/Tabs/TabThree";
import MyCreditsTab from "./MyCreditsTab";

interface TabsProps {
  type: "my-credits";
}

const Tabs: React.FC<TabsProps> = ({ type }) => {
  let tabComponent;
  switch (type) {
    case "my-credits":
      tabComponent = <MyCreditsTab />;
      break;
    default:
      tabComponent = (
        <>
          <TabOne /> <TabTwo /> <TabThree />
        </>
      );
  }

  return (
    <>
      <Breadcrumb pageName={type === "my-credits" ? "My credits" : "Tabs"} />
      <div className="flex flex-col gap-9">
        {tabComponent}
      </div>
    </>
  );
};

export default Tabs;
