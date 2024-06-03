import React from "react";
import Image from "next/image";

const UnregisteredAccountNotification: React.FC = () => {
  return (
    <div className="w-full p-4 sm:p-6 xl:p-10">
      <div className="w-full rounded-lg border border-[#F5C5BB] bg-[#FCEDEA] py-4 pl-4 pr-5.5 shadow-2 dark:border-[#EA4E2C] dark:bg-[#1B1B24]">
        <div className="flex items-center justify-between">
          <div className="flex flex-grow items-center gap-5">
            <div className="flex h-15 w-full max-w-15 items-center justify-center rounded-md bg-[#EA4E2C]">
              <Image
                src="/images/icon/warning.svg"
                alt="Warning Icon"
                width={32}
                height={32}
              />
            </div>
            <div>
              <h4 className="mb-0.5 text-title-xsm font-medium text-black dark:text-[#EA4E2C]">
                Account Not Registered
              </h4>
              <p className="text-sm font-medium">
                Please contact admin to register your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnregisteredAccountNotification;
