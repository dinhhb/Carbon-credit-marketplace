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
  const [isFormValid, setIsFormValid] = useState(false);
  const [creditURI, setCreditURI] = useState<string>("");
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

  const checkIfFormIsValid = () => {
    return Object.values(creditMeta).every(
      (value) => value !== "" && value !== null,
    );
  };

  useEffect(() => {
    setIsFormValid(checkIfFormIsValid());
  }, [creditMeta]);

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
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
      const { signedData, account } = await getSignedData();

      const res = await axios.post("/api/verify-file", {
        address: account,
        signature: signedData,
        bytes,
        contentType: file.type,
        fileName: file.name.replace(/\.[^/.]+$/, ""),
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
  };

  const uploadMetadata = async () => {
    try {
      const { signedData, account } = await getSignedData();

      const res = await axios.post("/api/verify", {
        address: account,
        signature: signedData,
        credit: creditMeta,
      });

      const data = res.data as PinataRes;
      setCreditURI(
        `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`,
      );
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const registerProject = async () => {
    try {
      const creditRes = await axios.get(creditURI, {
        headers: {"Accept": "text/plain"}
       });
      const content = creditRes.data;

      Object.keys(content).forEach((key) => {
        if (!ALLOW_FIELDS.includes(key)) {
          throw new Error("Invalid JSON structure");
        }
      });

      const tx = await projectContract?.registerProject(creditMeta["quantity-issue"]);
      const result = await tx?.wait();
 
      if (result && result.logs) {
        const carbonCreditCreatedLogEvent = result.events?.find(
          (ev: any) => ev.event === 'CarbonCreditCreated'
        );
        console.log(
          'Token ID: ',
          carbonCreditCreatedLogEvent?.args?.tokenId.toNumber()
        );
      };
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
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <SelectGroupStandard handleChange={handleChange} />

                  <CreditingPeriodStart />
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Registry reference link{" "}
                      <span className="text-meta-1">*</span>
                    </label>
                    <input
                      name="registry-reference-link"
                      value={creditMeta["registry-reference-link"]}
                      onChange={handleChange}
                      type="text"
                      placeholder="Enter registry reference link"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                    disabled={!isFormValid}
                    className={
                      isFormValid
                        ? "block w-full rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                        : "block w-full cursor-not-allowed rounded border border-bodydark bg-bodydark p-3 text-center font-medium text-white transition hover:bg-opacity-90"
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
