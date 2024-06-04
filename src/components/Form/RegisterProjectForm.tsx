"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SelectGroupStandard from "@/components/Form/FormElements/SelectGroup/SelectGroupStandard";
import { CreditMeta, PinataRes } from "@/types/credit";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useWeb3 } from "../providers/web3";
import { toast } from "react-toastify";
import { Contract, ethers } from "ethers";
import CheckUserRegistration from "../common/CheckUserRegistration";
import VintageFrom from "@/components/Form/FormElements/DatePicker/VintageFrom";
import VintageTo from "@/components/Form/FormElements/DatePicker/VintageTo";
import { useRouter } from "next/navigation";
import MySpinner from "../Spinners/MySpinner";

const CLASSESS = {
  SUCCESS:
    "w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary",
  ERROR:
    "w-full rounded border-[1.5px] border-danger bg-transparent px-5 py-3 text-black outline-none transition focus:border-danger active:border-danger disabled:cursor-default disabled:bg-whiter dark:border-form-danger dark:bg-form-input dark:text-white dark:focus:border-danger",
};

const ALLOW_FIELDS = [
  "projectId",
  "projectName",
  "projectType",
  "vintageFrom",
  "vintageTo",
  "origin",
  "quantity",
  "price",
  "registryLink",
  "registryAccountName",
  "registryAccountNo",
  "document",
  "standard",
];

const RegisterProjectForm: React.FC = () => {
  const { ethereum, projectContract, tokenContract, marketContract } =
    useWeb3();
  const _tokenContract = tokenContract;
  const _projectContract = projectContract;
  const marketContractAddress = marketContract
    ? (marketContract as unknown as Contract).address
    : undefined;
  const [creditURI, setCreditURI] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const [creditMeta, setCreditMeta] = useState<CreditMeta>({
    projectId: "",
    projectName: "",
    projectType: "",
    vintageFrom: "",
    vintageTo: "",
    origin: "",
    quantity: 0,
    price: 0,
    registryLink: "",
    registryAccountName: "",
    registryAccountNo: "",
    document: "",
    standard: "",
  });

  const [isStandardSelected, setIsStandardSelected] = useState(false);
  const [metadata, setMetadata] = useState<CreditMeta | null>(null);

  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/test-data/projects.json");
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, []);

  const fillRandomFields = () => {
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    setCreditMeta({
      ...creditMeta,
      projectId: randomProject.projectId.toString(),
      projectName: randomProject.projectName,
      projectType: randomProject.projectType,
      vintageFrom: randomProject.vintageFrom,
      vintageTo: randomProject.vintageTo,
      origin: randomProject.origin,
      quantity: randomProject.quantity,
      price: randomProject.price,
      registryLink: randomProject.registryLink,
      registryAccountName: randomProject.registryAccountName,
      registryAccountNo: randomProject.registryAccountNo.toString(),
    });
  };

  const router = useRouter();

  const handleBack = () => {
    router.push("/register-project");
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

    if (name === "standard" && value) {
      setIsStandardSelected(true);
    }

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
      if (ALLOW_FIELDS.includes(key) && !creditMeta[key as keyof CreditMeta]) {
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
        const metadataUri = `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`;
        setCreditURI(metadataUri);

        // Fetch and display the uploaded metadata
        const metadataRes = await axios.get(metadataUri);
        setMetadata(metadataRes.data);
      } catch (e: any) {
        console.error(e.message);
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const registerProject = useCallback(async () => {
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

      const result1 = await _tokenContract!.setApprovalForAll(
        marketContractAddress || "",
        true,
      );
      await result1?.wait();
      alert("Approval granted");

      const tx = await _projectContract?.registerProject(
        creditMeta["quantity"],
        creditURI,
        ethers.utils.parseEther(creditMeta.price.toString()),
      );
      const promise = tx?.wait();

      const result = await toast.promise(promise!, {
        pending: "Registering project...",
        success: "Project registered successfully",
        error: "Failed to register project",
      });

      // if (result && result.logs) {
      //   const carbonCreditCreatedLogEvent = result.events?.find(
      //     (ev: any) => ev.event === "CarbonCreditCreated",
      //   );
      //   console.log(
      //     "Token ID: ",
      //     carbonCreditCreatedLogEvent?.args?.tokenId.toNumber(),
      //   );
      // }
      // alert("Project registered successfully");
    } catch (error: any) {
      console.error(error.message);
    }
  }, [
    creditURI,
    creditMeta,
    _tokenContract,
    _projectContract,
    marketContractAddress,
  ]);

  return (
    <>
      <Breadcrumb pageName="Register Project" />
      <CheckUserRegistration>
        <div className="grid grid-cols-1 gap-16">
          <div className="flex flex-col items-center gap-16">
            {/* <!-- Contact Form --> */}
            {!creditURI ? (
              <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Project Information
                  </h3>
                </div>
                <form action="#">
                  <div className="p-15">
                    <SelectGroupStandard
                      handleChange={handleChange}
                      hasError={!!fieldErrors["standard"]}
                    />

                    {isStandardSelected && (
                      <div>
                        <div className="py-5">
                          <button
                            type="button"
                            onClick={fillRandomFields}
                            className="block rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                          >
                            Random Fields
                          </button>
                        </div>
                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                          <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Project ID <span className="text-meta-1">*</span>
                            </label>
                            <input
                              name="projectId"
                              value={creditMeta.projectId}
                              onChange={handleChange}
                              type="text"
                              placeholder="Enter project ID"
                              className={
                                fieldErrors.projectId
                                  ? CLASSESS.ERROR
                                  : CLASSESS.SUCCESS
                              }
                            />
                          </div>
                          <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Origin (Country){" "}
                              <span className="text-meta-1">*</span>
                            </label>
                            <input
                              name="origin"
                              value={creditMeta.origin}
                              onChange={handleChange}
                              type="text"
                              placeholder="Enter origin (country)"
                              className={
                                fieldErrors.origin
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
                            name="projectName"
                            value={creditMeta.projectName}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter project name"
                            className={
                              fieldErrors.projectName
                                ? CLASSESS.ERROR
                                : CLASSESS.SUCCESS
                            }
                          />
                        </div>

                        <div className="mb-4.5">
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Project type <span className="text-meta-1">*</span>
                          </label>
                          <input
                            name="projectType"
                            value={creditMeta.projectType}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter project type"
                            className={
                              fieldErrors.projectType
                                ? CLASSESS.ERROR
                                : CLASSESS.SUCCESS
                            }
                          />
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                          <div className="w-full xl:w-1/2">
                            <VintageFrom
                              hasError={!!fieldErrors.vintageFrom}
                              value={creditMeta.vintageFrom}
                              onChange={(date) =>
                                setCreditMeta({
                                  ...creditMeta,
                                  vintageFrom: date,
                                })
                              }
                            />
                          </div>
                          <div className="w-full xl:w-1/2">
                            <VintageTo
                              hasError={!!fieldErrors.vintageTo}
                              value={creditMeta.vintageTo}
                              onChange={(date) =>
                                setCreditMeta({
                                  ...creditMeta,
                                  vintageTo: date,
                                })
                              }
                            />
                          </div>
                        </div>
                        {/* <IssuanceDate /> */}

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                          <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Offer quantity{" "}
                              <span className="text-meta-1">*</span>
                            </label>
                            <input
                              name="quantity"
                              value={creditMeta.quantity}
                              onChange={handleChange}
                              type="number"
                              placeholder="Enter offer quantity"
                              className={
                                fieldErrors.quantity
                                  ? CLASSESS.ERROR
                                  : CLASSESS.SUCCESS
                              }
                            />
                          </div>

                          <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Offer price <span className="text-meta-1">*</span>
                            </label>
                            <input
                              name="price"
                              value={creditMeta.price}
                              onChange={handleChange}
                              type="number"
                              step="0.01"
                              placeholder="Enter offer price"
                              className={
                                fieldErrors.price
                                  ? CLASSESS.ERROR
                                  : CLASSESS.SUCCESS
                              }
                            />
                          </div>
                        </div>

                        <div className="mb-4.5">
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Verra project registry link{" "}
                            <span className="text-meta-1">*</span>
                          </label>
                          <input
                            name="registryLink"
                            value={creditMeta.registryLink}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter Verra project registry link"
                            className={
                              fieldErrors.registryLink
                                ? CLASSESS.ERROR
                                : CLASSESS.SUCCESS
                            }
                          />
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                          <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Seller&apos;s Verra registry account name:{" "}
                              <span className="text-meta-1">*</span>
                            </label>
                            <input
                              name="registryAccountName"
                              value={creditMeta.registryAccountName}
                              onChange={handleChange}
                              type="text"
                              placeholder="Enter seller's Verra registry account name"
                              className={
                                fieldErrors.registryAccountName
                                  ? CLASSESS.ERROR
                                  : CLASSESS.SUCCESS
                              }
                            />
                          </div>

                          <div className="w-full xl:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Seller&apos;s Verra registry account No:
                              <span className="text-meta-1">*</span>
                            </label>
                            <input
                              name="registryAccountNo"
                              value={creditMeta.registryAccountNo}
                              onChange={handleChange}
                              type="text"
                              step="0.01"
                              placeholder="Enter seller's Verra registry account No"
                              className={
                                fieldErrors.registryAccountNo
                                  ? CLASSESS.ERROR
                                  : CLASSESS.SUCCESS
                              }
                            />
                          </div>
                        </div>

                        <div className="mb-4.5">
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            VCS issuance document{" "}
                            <span className="text-meta-1">*</span>
                          </label>
                          <input
                            onChange={handleFile}
                            type="file"
                            src={creditMeta.document}
                            className={`w-full cursor-pointer rounded-lg border-[1.5px] bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary ${
                              fieldErrors.document
                                ? "dark:border-form-danger border-danger focus:border-danger active:border-danger dark:focus:border-danger"
                                : "border-stroke focus:border-primary active:border-primary dark:border-form-strokedark dark:focus:border-primary"
                            }`}
                          />
                        </div>
                        <div className="mb-4.5 flex justify-center space-x-4 pt-7">
                          <button
                            type="button"
                            onClick={uploadMetadata}
                            className="w-32 rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                  <h2 className="font-medium text-black dark:text-white">
                    Project Information
                  </h2>
                </div>
                <div className="p-20">
                  {metadata ? (
                    <div>
                      <h1 className="mb-3 pb-5 text-lg font-medium text-black dark:text-white">
                        Your Project Information:
                      </h1>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Project ID:
                        </p>
                        <p className="flex-1">{metadata.projectId}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Project Name:
                        </p>
                        <p className="flex-1">{metadata.projectName}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Project Type:
                        </p>
                        <p className="flex-1">{metadata.projectType}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Crediting Period Start:
                        </p>
                        <p className="flex-1">{metadata.vintageFrom}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Crediting Period End:
                        </p>
                        <p className="flex-1">{metadata.vintageTo}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Origin (Country):
                        </p>
                        <p className="flex-1">{metadata.origin}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Offer Quantity:
                        </p>
                        <p className="flex-1">{metadata.quantity}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Offer Price:
                        </p>
                        <p className="flex-1">{metadata.price}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Registry Reference:
                        </p>
                        <p className="flex-1">
                          <a
                            href={metadata.registryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary-dark overflow-hidden break-all text-primary"
                          >
                            {metadata.registryLink}
                          </a>
                        </p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Seller&apos;s Verra Registry Account Name:
                        </p>
                        <p className="flex-1">{metadata.registryAccountName}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Seller&apos;s Verra Registry Account No:
                        </p>
                        <p className="flex-1">{metadata.registryAccountNo}</p>
                      </div>
                      <div className="mb-4 flex items-start text-left">
                        <p className="flex-1 text-sm font-medium text-black dark:text-white">
                          Certification Document:
                        </p>
                        <p className="flex-1">
                          <a
                            href={metadata.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary-dark overflow-hidden break-all text-primary"
                          >
                            {metadata.document}
                          </a>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MySpinner />
                  )}
                  <div className="mb-4.5 flex justify-center space-x-4 pt-7">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-32 rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={registerProject}
                      className="w-32 rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CheckUserRegistration>
    </>
  );
};

export default RegisterProjectForm;
