"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MyCreditsTab from "./MyCreditsTab";
import ManageProjectsTab from "./ManageProjectsTab";

interface TabsProps {
  type: "my-credits" | "manage-projects";
}

const Tabs: React.FC<TabsProps> = ({ type }) => {
  let tabComponent;
  switch (type) {
    case "my-credits":
      tabComponent = <MyCreditsTab />;
      break;
    case "manage-projects":
      tabComponent = <ManageProjectsTab />
      break;
    // default:
    //   tabComponent = (
    //     <>
    //       <TabOne /> <TabTwo /> <TabThree />
    //     </>
    //   );
  }

  return (
    <>
      <Breadcrumb pageName={type === "my-credits" ? "My credits" : "Manage Projects"} />
      <div className="flex flex-col gap-9">
        {tabComponent}
      </div>
    </>
  );
};

export default Tabs;
