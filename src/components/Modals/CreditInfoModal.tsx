import React, { useState, useEffect, useRef } from "react";
import ConfirmBuyCreditsModal from "../Modals/ConfirmBuyCreditsModal";

const CreditInfoModal: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const trigger = useRef<any>(null);
  const modal = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!modal.current) return;
      if (
        !modalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div>
      <button
        ref={trigger}
        onClick={() => setModalOpen(!modalOpen)}
        className="rounded-md bg-body px-2 py-1 font-medium text-white mr-1"
      >
        Details
      </button>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          modalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          onFocus={() => setModalOpen(true)}
          onBlur={() => setModalOpen(false)}
          className="max-h-full w-full max-w-142.5 overflow-y-auto rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
          style={{ maxHeight: "90vh" }}
        >
          <h3 className="pb-2 text-left text-xl font-bold text-black dark:text-white sm:text-2xl">
            VIET NAM IMPROVED COOKSTOVE PROJECT BY KCM – IMPROVED COOKSTOVE
            PROJECT IN YEN BAI PROVINCE – CPA 008
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-full rounded bg-primary"></span>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Project ID:</p>
            <p className="flex-1">2595</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Vintage:</p>
            <p className="flex-1">2021</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Project developer:</p>
            <p className="flex-1">Korea Carbon Management Ltd</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Methodology:</p>
            <p className="flex-1">AMS-II.G.</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Region:</p>
            <p className="flex-1">Asia</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Project type:</p>
            <p className="flex-1">Agriculture Forestry and Other Land Use</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Standard:</p>
            <p className="flex-1">VCS</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Crediting period start:</p>
            <p className="flex-1">26/12/2002</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Crediting period end:</p>
            <p className="flex-1">26/12/2002</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Issuance date:</p>
            <p className="flex-1">26/12/2002</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Credits serial number:</p>
            <p className="flex-1">
              16570-773911996-773948920-VCS-VCU-1423-VER-VN-3-2595-01012021-31122021-0
            </p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Quantity issued:</p>
            <p className="flex-1">36925</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Registry reference link:</p>
            <p className="flex-1">
              <a
                href="https://registry.verra.org/app/projectDetail/VCS/2595"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-dark overflow-hidden break-all text-primary"
              >
                https://registry.verra.org/app/projectDetail/VCS/2595
              </a>
            </p>
          </div>
          <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="w-full px-3 2xsm:w-1/2">
              <button
                onClick={() => setModalOpen(false)}
                className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
              >
                Cancel
              </button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <ConfirmBuyCreditsModal />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditInfoModal;
