"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SelectGroupStandard from "@/components/SelectGroup/SelectGroupStandard";
import CreditingPeriodStart from "@/components/FormElements/DatePicker/CreditingPeriodStart";
import CreditingPeriodEnd from "@/components/FormElements/DatePicker/CreditingPeriodEnd";
import IssuanceDate from "@/components/FormElements/DatePicker/IssuanceDate";
import { CreditMetadata, PinataRes } from "@/types/credit";
import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { useWeb3 } from "../providers/web3";
import { toast } from "react-toastify";

const CLASSESS = {
  SUCCESS:
    "w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary",
  ERROR:
    "w-full rounded border-[1.5px] border-danger bg-transparent px-5 py-3 text-black outline-none transition focus:border-danger active:border-danger disabled:cursor-default disabled:bg-whiter dark:border-form-danger dark:bg-form-input dark:text-white dark:focus:border-danger",
};

const ALLOW_FIELDS = [
  "project-name",
  "project-id",
  "vintage",
  "project-developer",
  "methodology",
  "region",
  "project-type",
  "standard",
  "crediting-period-start",
  "crediting-period-end",
  "issuance-date",
  "credits-serial-number",
  "quantity-issue",
  "registry-reference-link",
  "document",
];

const RegisterProjectForm: React.FC = () => {
  const { ethereum, projectContract } = useWeb3();
  const [creditURI, setCreditURI] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [creditMeta, setCreditMeta] = useState<CreditMetadata>({
    "project-name": "",
    "project-id": "",
    vintage: "",
    "project-developer": "",
    methodology: "",
    region: "",
    "project-type": "",
    standard: "",
    "crediting-period-start": new Date(),
    "crediting-period-end": new Date(),
    "issuance-date": new Date(),
    "credits-serial-number": "",
    "quantity-issue": "",
    "registry-reference-link": "",
    document: "",
  });

  const getRandomString = (length = 6) =>
    Math.random().toString(20).substr(2, length);

  const getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min).toString();

  const autofillForm = () => {
    const randomCreditMeta = {
      "project-name": `Project ${getRandomString()}`,
      "project-id": `PID${getRandomNumber(10000, 99999)}`,
      vintage: getRandomNumber(1990, 2025),
      "project-developer": `Developer ${getRandomString()}`,
      methodology: `Method ${getRandomString()}`,
      region: `Region ${getRandomString()}`,
      "project-type": `Type ${getRandomString()}`,
      standard: "",
      "crediting-period-start": new Date(),
      "crediting-period-end": new Date(),
      "issuance-date": new Date(),
      "credits-serial-number": `CSN${getRandomNumber(100000, 999999)}`,
      "quantity-issue": getRandomNumber(1000, 5000),
      "registry-reference-link": `http://example.com/${getRandomString()}`,
      document: "", // Assuming this needs to be uploaded, leaving empty
    };

    setCreditMeta(randomCreditMeta);
  };

  const getSignedData = async () => {
    const messageToSign = await axios.get("/api/verify");

    const accounts = (await ethereum?.request({
      method: "eth_requestAccounts",
    })) as string[];

    const account = accounts[0];

    const signedData = await ethereum?.request({
      method: "personal_sign",
      params: [
        JSON.stringify(messageToSign.data),
        account,
        messageToSign.data.id,
      ],
    });

    return { signedData, account };
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.error("No file selected");
      return;
    }

    const file = e.target.files[0];

    if (file.size > 1000000) {
      toast.error("File size should not exceed 1 MB");
      return; // Exit the function if file is too large
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
      const { signedData, account } = await getSignedData();

      const promise = axios.post("/api/verify-file", {
        address: account,
        signature: signedData,
        bytes,
        contentType: file.type,
        fileName: file.name.replace(/\.[^/.]+$/, ""),
      });

      const res = await toast.promise(promise, {
        pending: "Uploading document...",
        success: "Document uploaded successfully",
        error: "Failed to upload document",
      });

      const data = res.data as PinataRes;

      setCreditMeta({
        ...creditMeta,
        document: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setCreditMeta({ ...creditMeta, [name]: value });

    // Update field error status based on whether the input is empty
    setFieldErrors((prev) => ({
      ...prev,
      [name]: !value, // Set to true if value is empty, false otherwise
    }));
  };

  const uploadMetadata = async () => {
    // Validate fields before proceeding
    const errors: { [key: string]: boolean } = {};
    Object.keys(creditMeta).forEach((key) => {
      // Check if the field is allowed and if it's empty
      if (
        ALLOW_FIELDS.includes(key) &&
        !creditMeta[key as keyof CreditMetadata]
      ) {
        errors[key] = true;
      }
    });

    // Update state to reflect which fields are in error
    setFieldErrors(errors);

    // Only proceed if there are no errors
    if (Object.keys(errors).length === 0) {
      try {
        const { signedData, account } = await getSignedData();

        const promise = axios.post("/api/verify", {
          address: account,
          signature: signedData,
          credit: creditMeta,
        });

        const res = await toast.promise(promise, {
          pending: "Uploading metadata...",
          success: "Metadata uploaded successfully",
          error: "Failed to upload metadata",
        });

        const data = res.data as PinataRes;
        setCreditURI(
          `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`,
        );
      } catch (e: any) {
        console.error(e.message);
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const registerProject = async () => {
    try {
      const creditRes = await axios.get(creditURI, {
        headers: { Accept: "text/plain" },
      });
      const content = creditRes.data;

      Object.keys(content).forEach((key) => {
        if (!ALLOW_FIELDS.includes(key)) {
          throw new Error("Invalid JSON structure");
        }
      });

      const tx = await projectContract?.registerProject(
        creditMeta["quantity-issue"],
        creditURI,
      );
      const promise = tx?.wait();

      const result = await toast.promise(promise!, {
        pending: "Registering project...",
        success: "Project registered successfully",
        error: "Failed to register project",
      });

      if (result && result.logs) {
        const carbonCreditCreatedLogEvent = result.events?.find(
          (ev: any) => ev.event === "CarbonCreditCreated",
        );
        console.log(
          "Token ID: ",
          carbonCreditCreatedLogEvent?.args?.tokenId.toNumber(),
        );
      }
      // alert("Project registered successfully");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Register project" />

      <div className="grid grid-cols-1 gap-16">
        <div className="flex flex-col items-center gap-16">
          {/* <!-- Contact Form --> */}
          {!creditURI ? (
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Project Information
                </h3>
              </div>
              <form action="#">
                <div className="p-6.5">
                  <button
                    type="button"
                    onClick={autofillForm}
                    className="mt-4 block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                  >
                    Auto-Fill Form
                  </button>
                </div>
                <div className="p-6.5">
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Project ID <span className="text-meta-1">*</span>
                      </label>
                      <input
                        name="project-id"
                        value={creditMeta["project-id"]}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter project ID"
                        className={
                          fieldErrors["project-id"]
                            ? CLASSESS.ERROR
                            : CLASSESS.SUCCESS
                        }
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Vintage <span className="text-meta-1">*</span>
                      </label>
                      <input
                        name="vintage"
                        value={creditMeta.vintage}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter vintage"
                        className={
                          fieldErrors.vintage
                            ? CLASSESS.ERROR
                            : CLASSESS.SUCCESS
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Project name <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="project-name"
                      value={creditMeta["project-name"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter project name"
                      className={
                        fieldErrors["project-name"]
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Project developer <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="project-developer"
                      value={creditMeta["project-developer"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter project developer"
                      className={
                        fieldErrors["project-developer"]
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Methodology <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="methodology"
                      value={creditMeta.methodology}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter methodology"
                      className={
                        fieldErrors.methodology
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Region <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="region"
                      value={creditMeta.region}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter region"
                      className={
                        fieldErrors.region ? CLASSESS.ERROR : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Project type <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="project-type"
                      value={creditMeta["project-type"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter project type"
                      className={
                        fieldErrors["project-type"]
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <SelectGroupStandard
                    handleChange={handleChange}
                    hasError={!!fieldErrors["standard"]}
                  />

                  <CreditingPeriodStart
                    hasError={!!fieldErrors["crediting-period-start"]}
                  />
                  <CreditingPeriodEnd />
                  <IssuanceDate />

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Credits serial number{" "}
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="credits-serial-number"
                      value={creditMeta["credits-serial-number"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter credits serial number"
                      className={
                        fieldErrors["credits-serial-number"]
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Quantity of credits issued{" "}
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="quantity-issue"
                      value={creditMeta["quantity-issue"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter quantity of credits issued"
                      className={
                        fieldErrors["quantity-issue"]
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Registry reference <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="registry-reference-link"
                      value={creditMeta["registry-reference-link"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter registry reference link"
                      className={
                        fieldErrors["registry-reference-link"]
                          ? CLASSESS.ERROR
                          : CLASSESS.SUCCESS
                      }
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Certification document{" "}
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      onChange={handleFile}
                      type="file"
                      src={creditMeta.document}
                      className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                    />
                  </div>

                  {/* <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your message"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div> */}

                  <button
                    type="button"
                    onClick={uploadMetadata}
                    className={
                      "block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                    }
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Project Information
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Your metadata:
                  </label>
                  <a
                    href={creditURI}
                    target="_blank" // Opens link in a new tab
                    rel="noopener noreferrer" // Security measure for opening links in a new tab
                    className="hover:text-primary-dark text-primary" // Styling classes for the link
                  >
                    {creditURI}
                  </a>
                  <div className="mb-4.5 flex flex-col items-center pt-7">
                    <button
                      type="button"
                      onClick={registerProject}
                      className={
                        "block rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                      }
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterProjectForm;
