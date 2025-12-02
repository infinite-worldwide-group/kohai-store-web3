"use client";
import StoreLayout from "@/components/Layouts/StoreLayout";
import { useStore } from "@/contexts/StoreContext";
import React from "react";

const RefundPolicy: React.FC = () => {
  const { store } = useStore();

  return (
    <StoreLayout>
      <div
        className="text-white"
        style={{ color: store?.textColor ?? undefined }}
      >
        <h1 className="mb-2 text-4xl font-bold">
          Game Credit Purchase Refund Policy - Affiliate
        </h1>

        <h2 className="my-3 pt-6 text-xl font-bold">
          No Refunds for Successful Transactions
        </h2>
        <p className="mb-2 opacity-90">
          Once a game credit top-up is completed and confirmed by the publisher,
          no cancellations or refunds will be provided.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          No Transfer or Withdrawal of Game Items
        </h2>
        <p className="mb-2 opacity-90">
          We cannot transfer game items between accounts or withdraw items from
          one account to issue refunds.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">User Responsibility</h2>
        <p className="mb-2 opacity-90">
          You are responsible for ensuring that all data (e.g., game ID, user
          information) entered during the transaction is correct. Mistakes made
          during purchase (like entering the wrong game ID) cannot be refunded
          or reversed.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          Claims for Missing or Incorrect Items
        </h2>
        <p className="mb-2 opacity-90">
          If you did not receive your game item or received an incorrect item,
          you must report it within 7 days of purchase through Customer Support.
          We will investigate and, if eligible, issue a refund or replacement.
          Claims made after 7 days from the purchase date will not be accepted.
        </p>

        <p className="mb-2 opacity-90">
          For more details, please review our Terms and Conditions.
          <br />
          Thank you for your understanding.
        </p>
      </div>
    </StoreLayout>
  );
};

export default RefundPolicy;
