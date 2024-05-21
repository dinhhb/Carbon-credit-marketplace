"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MyCreditsTab from "./MyCreditsTab";
import ManageProjectsTab from "./ManageProjectsTab";
import ActivitiesTab from "./ActivitiesTab";

interface TabsProps {
  type: "my-credits" | "manage-projects" | "activities";
}

const Tabs: React.FC<TabsProps> = ({ type }) => {
  let tabComponent;
  switch (type) {
    case "my-credits":
      tabComponent = <MyCreditsTab />;
      break;
    case "manage-projects":
      tabComponent = <ManageProjectsTab />;
      break;
    case "activities":
      tabComponent = <ActivitiesTab />;
      break;
  }

  return (
    <>
      <Breadcrumb pageName={type === "my-credits" ? "My Credits" : type === "manage-projects" ? "Manage Projects" : "Activities"} />
      <div className="flex flex-col gap-9">
        {tabComponent}
      </div>
    </>
  );
};

export default Tabs;
