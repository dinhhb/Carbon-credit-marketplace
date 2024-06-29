"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SelectGroupIsAuditor from "./FormElements/SelectGroup/SelectGroupIsAuditor";
import { Account } from "@/types/account";

const CLASSESS = {
  SUCCESS:
    "w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary",
  ERROR:
    "w-full rounded border-[1.5px] border-danger bg-transparent px-5 py-3 text-black outline-none transition focus:border-danger active:border-danger disabled:cursor-default disabled:bg-whiter dark:border-form-danger dark:bg-form-input dark:text-white dark:focus:border-danger",
};

const ALLOW_FIELDS = ["address"];

interface AccountProps {
  registerAuditor: (address: string) => Promise<void>;
  registerUser: (address: string, totalCredits: number) => Promise<void>;
  onSuccess: () => void; // Callback for successful registration
  onBack: () => void; // Callback for back button
}

// Utility function to validate Ethereum address
const isValidEthereumAddress = (address: string): boolean => {
  // Check if the address starts with '0x' and is 42 characters long
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }

  return true;
};

const RegisterProjectForm: React.FC<AccountProps> = ({
  registerAuditor,
  registerUser,
  onSuccess,
  onBack,
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [accountType, setAccountType] = useState<string>("");
  const [account, setAccount] = useState<Account>({
    address: "",
    totalCredits: 0,
    totalRetire: 0,
    isAuditor: false,
    registerdAt: 0,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setAccount({ ...account, [name]: value });

    if (name === "standard" && value) {
      setAccountType(value);
    }

    // Update field error status based on whether the input is empty
    setFieldErrors((prev) => ({
      ...prev,
      [name]: !value, // Set to true if value is empty, false otherwise
    }));
  };

  const registerAccount = async () => {
    // Validate fields before proceeding
    const errors: { [key: string]: boolean } = {};
    Object.keys(account).forEach((key) => {
      // Check if the field is allowed and if it's empty
      if (
        accountType === "User" &&
        ALLOW_FIELDS.includes(key) &&
        !account[key as keyof Account]
      ) {
        errors[key] = true;
      }
    });

    if (!isValidEthereumAddress(account.address)) {
      errors["address"] = true;
      alert("Invalid Ethereum address.");
    }

    // Update state to reflect which fields are in error
    setFieldErrors(errors);
    // Only proceed if there are no errors
    if (Object.keys(errors).length === 0) {
      try {
        if (accountType === "User") {
          console.log("Registering user account...");
          await registerUser(account.address, account.totalCredits);
        } else {
          console.log("Registering auditor account...");
          await registerAuditor(account.address);
        }
        onSuccess();
      } catch (e: any) {
        console.error(e.message);
      }
    }
  };
  return (
    <>
      <div className="grid grid-cols-1 gap-16">
        <div className="flex flex-col items-center gap-16">
          {/* <!-- Contact Form --> */}
          <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Register New Account
              </h3>
            </div>
            <form action="#">
              <div className="p-6.5">
                <SelectGroupIsAuditor
                  handleChange={handleChange}
                  hasError={!!fieldErrors["standard"]}
                />
              </div>
              {accountType && (
                <div className="p-6.5">
                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Address <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="address"
                      value={account.address}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter account address"
                      className={
                        fieldErrors.address ? CLASSESS.ERROR : CLASSESS.SUCCESS
                      }
                    />
                  </div>
                  {accountType === "User" && (
                    <>
                      <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                        <div className="w-full xl:w-1/2">
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Total owned credits{" "}
                            <span className="text-meta-1">*</span>
                          </label>
                          <input
                            name="totalCredits"
                            value={account.totalCredits}
                            onChange={handleChange}
                            type="number"
                            placeholder="Enter total owned credits"
                            className={
                              fieldErrors.totalCredits
                                ? CLASSESS.ERROR
                                : CLASSESS.SUCCESS
                            }
                          />
                        </div>

                        <div className="w-full xl:w-1/2">
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Total retired credits{" "}
                            <span className="text-meta-1">*</span>
                          </label>
                          <input
                            name="totalRetire"
                            value={0}
                            // onChange={handleChange}
                            type="number"
                            placeholder="Enter total retired credits"
                            className={
                              fieldErrors.totalRetire 
                                ? `${CLASSESS.ERROR} cursor-not-allowed` 
                                : `${CLASSESS.SUCCESS} cursor-not-allowed`
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mb-4.5 flex flex-col items-center justify-center gap-6 pt-10 xl:flex-row">
                    <div className="w-full xl:w-auto">
                      <button
                        type="button"
                        onClick={onBack}
                        className="w-32 rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="w-full xl:w-auto">
                      <button
                        type="button"
                        onClick={registerAccount}
                        className="w-32 rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterProjectForm;
