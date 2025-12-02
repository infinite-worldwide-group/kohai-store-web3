"use client";

interface Props {
  visible: boolean;
  close: () => void;
  title: string;
  description: string;
  confirm?: () => void;
}

const AlertModal: React.FC<Props> = ({
  visible,
  close,
  description,
  title,
  confirm,
}) => {
  if (!visible) return null;

  return (
    <div
      className="relative"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 99999 }}
    >
      <div
        className="fixed inset-0 transition-opacity"
        aria-hidden="true"
        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        onClick={close}
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto text-white">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-black px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0">
                  <h3
                    className="font-semibold text-gray-900 text-white"
                    id="modal-title"
                  >
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">{description}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black px-4 py-3">
              {confirm && (
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-success px-3 py-2 text-sm uppercase text-white shadow-sm hover:bg-opacity-80"
                  onClick={confirm}
                >
                  Proceed to Payment
                </button>
              )}
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm uppercase opacity-50"
                onClick={close}
              >
                {confirm ? "Cancel" : "Got It"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
