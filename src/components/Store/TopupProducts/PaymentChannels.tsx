"use client";

const PaymentChannels = (props: {
  payment: "fiuu" | "kohai" | "billplz" | undefined;
  setPayment: (arg: "fiuu" | "kohai" | "billplz" | undefined) => void;
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        className={`rounded-lg p-2 px-3 ${props.payment == "kohai" ? "bg-white" : "bg-gray-300"}`}
        onClick={() => props.setPayment("kohai")}
      >
        <div className="flex flex-row gap-4">
          <div>
            <h3>Kohai Credit</h3>
            <p>Login required</p>
          </div>
        </div>
      </div>
      <div
        className={`rounded-lg p-2 px-3 ${props.payment == "billplz" ? "bg-white" : "bg-gray-300"}`}
        onClick={() => props.setPayment("billplz")}
      >
        <div className="flex flex-row gap-4">
          <div>
            <h3>Billplz</h3>
            <p>FPX/Online Banking</p>
          </div>
        </div>
      </div>
      <div
        className={`rounded-lg p-2 px-3 ${props.payment == "fiuu" ? "bg-white" : "bg-gray-300"}`}
        onClick={() => props.setPayment("fiuu")}
      >
        <div className="flex flex-row gap-4">
          <div>
            <h3>Fiuu</h3>
            <p>E-wallet, Crypto</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentChannels;
