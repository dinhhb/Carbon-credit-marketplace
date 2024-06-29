import { Credit, PinataRes } from "@/types/credit";
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import SelectGroupRetirement from "../Form/FormElements/SelectGroup/SelectGroupRetirement";
import { RetirementMeta } from "@/types/retirement";
import axios from "axios";
import { useWeb3 } from "../providers/web3";
import { toast } from "react-toastify";
import MySpinner from "../Spinners/MySpinner";
import { Contract } from "ethers";

interface CreditProps {
  credit: Credit;
}

const ALLOW_FIELDS = [
  "amount",
  "beneficialOwner",
  "retirementReason",
  "retirementReasonDetails",
];

const CLASSESS = {
  SUCCESS:
    "w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary",
  ERROR:
    "w-full rounded border-[1.5px] border-danger bg-transparent px-5 py-3 text-black outline-none transition focus:border-danger active:border-danger disabled:cursor-default disabled:bg-whiter dark:border-form-danger dark:bg-form-input dark:text-white dark:focus:border-danger",
};

const RetireCreditsModal: React.FC<CreditProps> = ({ credit }) => {
  const [retireCreditModalOpen, setRetireCreditModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [retirementURI, setRetirementURI] = useState<string>("");
  const {
    ethereum,
    projectContract,
    tokenContract,
    marketContract,
    retireContract,
  } = useWeb3();
  const [metadata, setMetadata] = useState<RetirementMeta | null>(null);

  const [retirementMeta, setRetirementMeta] = useState<RetirementMeta>({
    amount: 0,
    beneficialOwner: "",
    retirementReason: "",
    retirementReasonDetails: "",
    document: "",
    credit,
  });

  const trigger = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDivElement>(null);

  // Update retirementMeta with credit.metadata when credit changes
  useEffect(() => {
    if (credit) {
      setRetirementMeta((prevMeta) => ({
        ...prevMeta,
        credit,
      }));
    }
  }, [credit]);

  // Log retirementMeta to console whenever it changes
  // useEffect(() => {
  //   console.log("retirementMeta:", retirementMeta);
  // }, [retirementMeta]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !retireCreditModalOpen ||
        modal.current.contains(target as Node) ||
        trigger.current?.contains(target as Node)
      )
        return;
      setRetireCreditModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [retireCreditModalOpen]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!retireCreditModalOpen || keyCode !== 27) return;
      setRetireCreditModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [retireCreditModalOpen]);

  const getSignedData = async () => {
    const messageToSign = await axios.get("/api/verify2");

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

  const uploadMetadata = async () => {
    // Validate fields before proceeding
    const errors: { [key: string]: boolean } = {};

    Object.keys(retirementMeta).forEach((key) => {
      // Check if the field is allowed and if it's empty
      if (
        ALLOW_FIELDS.includes(key) &&
        !retirementMeta[key as keyof RetirementMeta]
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

        const promise = axios.post("/api/verify2", {
          address: account,
          signature: signedData,
          retirement: retirementMeta,
        });

        const res = await toast.promise(promise, {
          pending: "Uploading retirement information...",
          success: "Retirement information uploaded successfully",
          error: "Failed to upload retirement information",
        });

        const data = res.data as PinataRes;
        const metadataUri = `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`;
        setRetirementURI(metadataUri);

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

  const _retireContract = retireContract;
  const _tokenContract = tokenContract;
  const marketContractAddress = marketContract
    ? (marketContract as unknown as Contract).address
    : undefined;

  const handleRetireCredits = useCallback(async () => {
    try {
      if (metadata!.amount > credit.quantityOwned) {
        alert("Retire amount exceeds owned credits");
        return;
      }

      const result1 = await _tokenContract!.setApprovalForAll(
        marketContractAddress || "",
        true,
      );
      
      await toast.promise(result1?.wait(), {
        pending: "Granting approval...",
        success: "Approval granted",
        error: "Failed to grant approval",
      });
      // alert("Approval granted");

      const result2 = await _retireContract!.retireCredits(
        credit.tokenId,
        metadata!.amount,
        retirementURI,
      );
      await toast.promise(result2!.wait(), {
        pending: "Retiring credit...",
        success: "Credit retired successfully!",
        error: "Failed to retire credit",
      });
      setRetirementURI("");
      setFieldErrors({});
      setRetireCreditModalOpen(false);
    } catch (e: any) {
      console.log(e.message);
    }
  }, [
    credit.quantityOwned,
    credit.tokenId,
    metadata,
    _tokenContract,
    marketContractAddress,
    _retireContract,
    retirementURI,
  ]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setRetirementMeta({ ...retirementMeta, [name]: value });

    // Update field error status based on whether the input is empty
    setFieldErrors((prev) => ({
      ...prev,
      [name]: !value, // Set to true if value is empty, false otherwise
    }));
  };

  const [retirements, setRetirements] = useState<any[]>([]);

  useEffect(() => {
    const fetchRetirements = async () => {
      try {
        const response = await fetch("/test-data/retirements.json");
        const data = await response.json();
        // console.log("Retirements:", data.retirements);
        setRetirements(data.retirements);
      } catch (error) {
        console.error("Error fetching retirements:", error);
        toast.error("Failed to fetch retirements");
      }
    };
    fetchRetirements();
  }, []);

  const fillRandomFields = () => {
    const randomRetirement = retirements[Math.floor(Math.random() * retirements.length)];
    setRetirementMeta({
      ...retirementMeta,
      amount: randomRetirement.amount.toString(),
      beneficialOwner: randomRetirement.beneficialOwner,
      retirementReason: randomRetirement.retirementReason,
      retirementReasonDetails: randomRetirement.retirementReasonDetails,
    });
  };

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setRetireCreditModalOpen(!retireCreditModalOpen)}
        className="mr-1 rounded-md bg-danger px-2 py-1 font-medium text-white"
      >
        <svg
          className="text-gray-800 h-6 w-6 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
          />
        </svg>
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          retireCreditModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          className="max-h-full w-full max-w-142.5 overflow-y-auto rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
          style={{ maxHeight: "90vh", maxWidth: "60vw" }}
        >
          <h3 className="mt-5.5 pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            Retire Your Credits
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="w-1/3">Max amount:</p>
            <p className="w-2/3">{credit.quantityOwned}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="w-1/3">Project name:</p>
            <p className="w-2/3">{credit.metadata.projectName}</p>
          </div>
          {!retirementURI ? (
            <div className="flex flex-col py-2">
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
                  <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
                    Retire amount <span className="text-meta-1">*</span>
                  </label>
                  <input
                    name="amount"
                    type="number"
                    placeholder="Enter retire amount"
                    value={retirementMeta.amount}
                    onChange={handleChange}
                    className={
                      fieldErrors.amount ? CLASSESS.ERROR : CLASSESS.SUCCESS
                    }
                    // value={amountRetire}
                    // onChange={(e) => setAmountRetire(e.target.value)}
                  />
                </div>
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
                    Beneficial owner <span className="text-meta-1">*</span>
                  </label>
                  <input
                    name="beneficialOwner"
                    type="text"
                    placeholder="Enter beneficial owner"
                    value={retirementMeta.beneficialOwner}
                    onChange={handleChange}
                    className={
                      fieldErrors.beneficialOwner
                        ? CLASSESS.ERROR
                        : CLASSESS.SUCCESS
                    }
                  />
                </div>
              </div>
              <SelectGroupRetirement
                handleChange={handleChange}
                hasError={!!fieldErrors.retirementReason}
                value={retirementMeta.retirementReason}
              />
              <div className="mb-4.5">
                <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
                  Retirement reason detail{" "}
                  <span className="text-meta-1">*</span>
                </label>
                <input
                  name="retirementReasonDetails"
                  type="text"
                  placeholder="Enter retirement reason detail"
                  value={retirementMeta.retirementReasonDetails}
                  onChange={handleChange}
                  className={
                    fieldErrors.retirementReasonDetails
                      ? CLASSESS.ERROR
                      : CLASSESS.SUCCESS
                  }
                />
              </div>
            </div>
          ) : (
            <>
              {metadata ? (
                <>
                  <div className="mb-4 flex items-start text-left">
                    <p className="w-1/3">Amount:</p>
                    <p className="w-2/3">{metadata.amount}</p>
                  </div>
                  <div className="mb-4 flex items-start text-left">
                    <p className="w-1/3">Beneficial owner:</p>
                    <p className="w-2/3">{metadata.beneficialOwner}</p>
                  </div>
                  <div className="mb-4 flex items-start text-left">
                    <p className="w-1/3">Retirement reason:</p>
                    <p className="w-2/3">{metadata.retirementReason}</p>
                  </div>
                  <div className="mb-4 flex items-start text-left">
                    <p className="w-1/3">Retirement reason detail:</p>
                    <p className="w-2/3">{metadata.retirementReasonDetails}</p>
                  </div>
                </>
              ) : (
                <MySpinner />
              )}
            </>
          )}
          <div className="-mx-3 flex flex-wrap gap-y-4 pt-5">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => {
                  if (retirementURI) {
                    setRetirementURI("");
                    setFieldErrors({});
                  } else {
                    setRetireCreditModalOpen(false);
                  }
                }}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => {
                  if (retirementURI) {
                    handleRetireCredits();
                  } else {
                    uploadMetadata();
                  }
                }}
                className={`block w-full rounded border p-3 text-center font-medium text-white transition hover:bg-opacity-90 ${
                  !retirementURI
                    ? "border-primary bg-primary"
                    : "border-danger bg-danger"
                }`}
              >
                {retirementURI ? "Retire" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetireCreditsModal;
