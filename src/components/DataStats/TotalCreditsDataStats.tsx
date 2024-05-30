import { FunctionComponent } from "react";

interface CreditsProps {
  totalCredits: number;
  totalRetire: number;
}

const TotalCreditsDataStats: FunctionComponent<CreditsProps> = ({
  totalCredits,
  totalRetire,
}) => {
  return (
    <div className="pb-5">
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 xl:gap-0">
          <div className="flex items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
            <div>
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {totalCredits}
              </h4>
              <p className="text-sm font-medium">Total Owned Credits</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border-b border-stroke pb-5 dark:border-strokedark xl:border-b-0 xl:border-r xl:pb-0">
            <div>
              <h4 className="mb-0.5 text-xl font-semibold text-black dark:text-white md:text-title-lg">
                {totalRetire}
              </h4>
              <p className="text-sm font-medium">Total Retired Credits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCreditsDataStats;
