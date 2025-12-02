"use client";

import { AffiliateTransactionState } from "graphql/generated/graphql";

const TransactionFilter = (props: {
  transactionType: string | undefined;
  setTransactionType: (val: string | undefined) => void;
  states: string[] | undefined;
  setStates: (val: any) => void;
}) => {
  const { transactionType, setTransactionType, states, setStates } = props;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTransactionType(val === "" ? undefined : val);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStates(val === "" ? undefined : [val]);
  };

  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <select
        value={states ? states[0] : ""}
        onChange={handleStateChange}
        className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 p-3 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
      >
        <option value="">{states ? "All status" : "Select status"}</option>
        <option value={AffiliateTransactionState.Pending}>Pending</option>
        <option value={AffiliateTransactionState.Processing}>Processing</option>
        <option value={AffiliateTransactionState.Completed}>Completed</option>
        <option value={AffiliateTransactionState.Approved}>Approved</option>
        <option value={AffiliateTransactionState.Rejected}>Rejected</option>
        <option value={AffiliateTransactionState.Failed}>Failed</option>
      </select>

      <select
        value={transactionType ?? ""}
        onChange={handleChange}
        className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 p-3 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
      >
        <option value="">
          {!!transactionType ? "All type" : "Select Type"}
        </option>
        <option value="earn">Earn</option>
        <option value="contest_bonus">Contest Bonus</option>
        <option value="withdraw">Withdraw</option>
        <option value="refund">Refund</option>
        <option value="service_fee">Service Fee</option>
      </select>
    </div>
  );
};

export default TransactionFilter;
