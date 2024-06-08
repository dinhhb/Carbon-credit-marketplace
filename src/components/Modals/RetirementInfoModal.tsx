import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import { Retirement, RetirementMeta } from "@/types/retirement";
import { renderTimeCell } from "../common/TimeCell";
import { toast } from "react-toastify";
import axios from "axios";
import { useWeb3 } from "../providers/web3";
import { PinataRes } from "@/types/credit";

interface RetirementProps {
  retirement: Retirement;
}

const ALLOW_FIELDS = [
  "amount",
  "beneficialOwner",
  "retirementReason",
  "retirementReasonDetails",
  "document",
  "credit",
];

const RetirementInfoModal: React.FC<RetirementProps> = ({ retirement }) => {
  const [retirementInfoModalOpen, setRetirementInfoModalOpen] = useState(false);

  const [retirementURI, setRetirementURI] = useState<string>("");

  const { ethereum, retireContract } = useWeb3();
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [retirementMeta, setRetirementMeta] = useState<RetirementMeta>({
    amount: retirement.metadata.amount,
    beneficialOwner: retirement.metadata.beneficialOwner,
    retirementReason: retirement.metadata.retirementReason,
    retirementReasonDetails: retirement.metadata.retirementReasonDetails,
    document: "",
    credit: retirement.metadata.credit,
  });

  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !retirementInfoModalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setRetirementInfoModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!retirementInfoModalOpen || keyCode !== 27) return;
      setRetirementInfoModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

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

      // if (res.headers["content-type"] !== "application/json") {
      //   console.error("Unexpected response type:", res.headers["content-type"]);
      //   console.error("Response body:", res.data);
      //   throw new Error("Invalid JSON response");
      // }

      const data = res.data as PinataRes;

      setRetirementMeta({
        ...retirementMeta,
        document: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
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

        const promise = axios.post("/api/verify3", {
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
        console.log("Metadata URI:", metadataUri);
        setRetirementURI(metadataUri);
      } catch (e: any) {
        console.error(e.message);
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  useEffect(() => {
    console.log("Updated retirementMeta:", retirementMeta);
  }, [retirementMeta]);

  const _retireContract = retireContract;

  const registerRetirement = useCallback(async () => {
    try {
      const retirementRes = await axios.get(retirementURI, {
        headers: { Accept: "text/plain" },
      });
      const content = retirementRes.data;
      console.log("Retirement URI:", retirementURI);
      console.log("Retirement content:", content);
      Object.keys(content).forEach((key) => {
        if (!ALLOW_FIELDS.includes(key)) {
          throw new Error("Invalid JSON structure");
        }
      });
      const tx = await _retireContract?.certificateRetirement(
        retirement.retirementId,
        retirementURI,
      );
      const promise = tx?.wait();

      const result = await toast.promise(promise!, {
        pending: "Updating retirement certificate...",
        success: "Retirement certificate updated successfully",
        error: "Failed to update retirement certificate",
      });
    } catch (error: any) {
      console.error(error.message);
    }
  }, [_retireContract, retirement.retirementId, retirementURI]);

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setRetirementInfoModalOpen(!retirementInfoModalOpen)}
        className="mr-1 rounded-md bg-body px-2 py-1 font-medium text-white"
      >
        <svg
          className="text-gray-800 h-6 w-6 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          retirementInfoModalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          className="max-h-full w-full max-w-142.5 overflow-y-auto rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
          style={{ maxHeight: "90vh", maxWidth: "60vw" }}
        >
          <h3 className="pb-2 text-center text-xl font-bold text-black dark:text-white sm:text-2xl">
            Retirement Information
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Retirement ID:</p>
            <p className="flex-1">{retirement.retirementId}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Owner:</p>
            <p className="flex-1">{retirement.owner}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Time:</p>
            <p className="flex-1">{renderTimeCell(retirement.time)}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Amount:</p>
            <p className="flex-1">{retirement.metadata.amount}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Beneficial owner:</p>
            <p className="flex-1">{retirement.metadata.beneficialOwner}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Retirement reason:</p>
            <p className="flex-1">{retirement.metadata.retirementReason}</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Retirement reason details:</p>
            <p className="flex-1">
              {retirement.metadata.retirementReasonDetails}
            </p>
          </div>
          <div className="py-6">
            <label className="mb-3 block text-left text-sm font-medium text-black dark:text-white">
              VCU Retirement Certification{" "}
              <span className="text-meta-1">*</span>
            </label>
            <input
              onChange={handleFile}
              type="file"
              src={retirementMeta.document}
              // src={retirement.metadata.document}
              className={`w-full cursor-pointer rounded-lg border-[1.5px] bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary ${
                fieldErrors.document
                  ? "dark:border-form-danger border-danger focus:border-danger active:border-danger dark:focus:border-danger"
                  : "border-stroke focus:border-primary active:border-primary dark:border-form-strokedark dark:focus:border-primary"
              }`}
            />
          </div>

          <div className="flex justify-center space-x-4">
            {retirementURI ? (
              <button
                type="button"
                onClick={registerRetirement}
                className="w-32 rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={uploadMetadata}
                className="w-32 rounded border border-primary bg-primary p-3 text-center font-medium text-white transition hover:bg-opacity-90"
              >
                Upload
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementInfoModal;
