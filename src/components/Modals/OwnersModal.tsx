import React, { useState, useEffect, useRef } from "react";

interface OwnersModalProps {
  numberOfOwners: number;
  owners: string[];
}

const OwnersModal: React.FC<OwnersModalProps> = ({
  owners,
  numberOfOwners,
}) => {
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
      <a
        ref={trigger}
        onClick={() => setModalOpen(!modalOpen)}
        className="dark:text-primary-dark hover:text-primary-dark cursor-pointer text-primary dark:hover:text-primary"
      >
        {numberOfOwners}
      </a>
      <div
        className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          modalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modal}
          // onFocus={() => setModalOpen(true)}
          // onBlur={() => setModalOpen(false)}
          className="max-h-full w-full max-w-142.5 overflow-y-auto rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-17.5 md:py-15"
          style={{ maxHeight: "90vh" }}
        >
          <h3 className="pb-2 text-left text-xl font-bold text-black dark:text-white sm:text-2xl">
            Owners
          </h3>
          <span className="mx-auto mb-6 inline-block h-1 w-full rounded bg-primary"></span>
          {/* <div className="mb-4 flex items-start text-left">
            <p className="flex-1">Address</p>
            <p className="flex-1">Quantity</p>
          </div>
          <div className="mb-4 flex items-start text-left">
            <p className="flex-1">0x902a...</p>
            <p className="flex-1">2595</p>
          </div> */}
          {owners.map((owner, index) => (
            <div key={index} className="mb-4 flex items-start text-left">
              <p className="flex-1">{owner}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnersModal;
