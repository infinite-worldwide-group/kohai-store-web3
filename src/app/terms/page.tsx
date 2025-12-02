"use client";
import StoreLayout from "@/components/Layouts/StoreLayout";
import { useStore } from "@/contexts/StoreContext";
import React from "react";

const Terms: React.FC = () => {
  const { store } = useStore();

  return (
    <StoreLayout>
      <div
        className="text-white"
        style={{ color: store?.textColor ?? undefined }}
      >
        <h1 className="mb-2 text-4xl font-bold">
          Term and Conditions - Affiliate
        </h1>

        <h2 className="my-3 pt-6 text-xl font-bold">GENERAL ACCEPTANCE</h2>
        <p className="mb-2 opacity-90">
          Welcome to our game credit platform (the "Website"). The Website
          provides a convenient and secure way for users ("you," "your") to
          purchase game credits, in-game currency, or digital vouchers for
          various online games without requiring registration or sign-up. By
          accessing or using the Website, you agree to be bound by these Terms
          and Conditions ("Terms"). If you do not agree with these Terms, you
          must immediately discontinue use of the Website. We reserve the right
          to modify or update these Terms at any time. Significant changes will
          be communicated via updates posted on the Website. Your continued use
          of the Website after such changes signifies your acceptance of the
          revised Terms.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">DEFINITIONS</h2>
        <p className="mb-2 opacity-90">
          "Website" refers to the online platform and related services for
          purchasing game credits. "User" refers to anyone accessing or using
          the Website to purchase game credits or digital products. "Game
          Credits" means in-game currency, vouchers, or digital items purchased
          through the Website. "Content" refers to any text, graphics, or data
          displayed on or processed through the Website.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">ELIGIBILITY</h2>
        <p className="mb-2 opacity-90">
          To use the Website, you must be at least 18 years old. Users under 18
          may only use the Website with the explicit consent and supervision of
          a parent or guardian, who must agree to these Terms on their behalf.
          By using the Website, you confirm that you meet these eligibility
          requirements or have obtained the necessary parental consent.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">NO SIGN-UP REQUIRED</h2>
        <p className="mb-2 opacity-90">
          The Website is designed for ease of use and does not require users to
          create an account or sign up to purchase Game Credits. You may access
          the services by providing minimal information necessary to complete a
          transaction, such as payment details and game account information. You
          are responsible for ensuring the accuracy of the information provided
          during the purchase process.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">ACCEPTABLE USE</h2>
        <p className="mb-2 opacity-90">When using the Website, you agree to:</p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Use the Website only for its intended purpose of purchasing Game
            Credits.
          </li>
          <li>
            Refrain from any misuse, including but not limited to attempting to
            manipulate transactions, reverse engineering, or compromising
            security.
          </li>
          <li>
            Comply with all applicable laws and regulations, including consumer
            protection and payment processing laws.
          </li>
          <li>Not engage in fraudulent or deceptive activities.</li>
        </ul>
        <p className="mb-2 opacity-90">
          We reserve the right to restrict or block access to the Website if you
          violate these obligations.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          PURCHASE OF GAME CREDITS AND PAYMENT
        </h2>
        <p className="mb-2 opacity-90">
          <strong>Pricing and Fees:</strong> All prices for Game Credits are
          clearly displayed at the point of purchase, inclusive of applicable
          taxes or fees.
          <br />
          <strong>Payment Methods:</strong> Payments can be made via the secure
          payment methods listed on the Website, including but not limited to
          credit/debit cards, digital wallets, and bank transfers (where
          available).
          <br />
          <strong>Instant Delivery:</strong> Upon successful payment, Game
          Credits are delivered instantly to the provided game account, provided
          accurate details are submitted.
          <br />
          <strong>Errors in Submission:</strong> We are not responsible for
          failed deliveries due to incorrect game account information provided
          by you.
          <br />
          <strong>Transaction Security:</strong> All transactions are processed
          through secure, encrypted payment gateways to protect your financial
          information.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">REFUND POLICY</h2>
        <p className="mb-2 opacity-90">
          We aim to ensure a seamless purchase experience. Refunds may be
          granted in the following cases:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Non-Delivery: If Game Credits are not delivered due to a technical
            error on our part, you may be eligible for a refund.
          </li>
          <li>
            Duplicate Payments: Accidental duplicate transactions may qualify
            for a refund upon verification.
          </li>
          <li>
            Non-Refundable Cases: Game Credits successfully delivered to the
            correct game account are non-refundable.
          </li>
        </ul>
        <p className="mb-2 opacity-90">
          Refund requests must be submitted to Customer Support or WhatsApp
          Customer Service within 7 days of the transaction date. Refunds, if
          approved, will be processed within 7–14 business days.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">INTELLECTUAL PROPERTY</h2>
        <p className="mb-2 opacity-90">
          All content on the Website, including but not limited to text,
          graphics, logos, and software, is the property of this platform or its
          licensors and is protected by copyright and intellectual property
          laws. You may not copy, distribute, or create derivative works from
          any part of the Website without prior written consent. If you believe
          your intellectual property rights have been infringed, please contact
          us at customer support with details of the alleged infringement.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">DATA PRIVACY</h2>
        <p className="mb-2 opacity-90">
          We are committed to protecting your personal information. Our Privacy
          Policy outlines how we collect, use, and safeguard data provided
          during transactions, such as payment details or game account
          information. By using the Website, you agree to our Privacy Policy,
          which complies with applicable data protection laws, including the
          Personal Data Protection Act 2010 (PDPA) in Malaysia and other
          relevant regulations.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">LIMITATION OF LIABILITY</h2>
        <p className="mb-2 opacity-90">
          To the fullest extent permitted by law, we are not liable for any
          indirect, incidental, or consequential damages arising from your use
          of the Website, including but not limited to losses due to incorrect
          game account details, service interruptions, or unauthorized access by
          third parties. We strive to ensure the Website is secure and
          operational but do not guarantee uninterrupted or error-free service.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">TERMINATION OF ACCESS</h2>
        <p className="mb-2 opacity-90">
          We reserve the right to suspend or terminate your access to the
          Website if you:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>Violate these Terms.</li>
          <li>Engage in fraudulent or illegal activities.</li>
          <li>
            Attempt to compromise the Website’s security or functionality.
          </li>
        </ul>
        <p className="mb-2 opacity-90">
          Upon termination, you will no longer be able to use the Website to
          purchase Game Credits.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">CONTACT AND SUPPORT</h2>
        <p className="mb-2 opacity-90">
          If you have any questions, concerns, or feedback about these Terms or
          the Website, please contact us at Top Up Customer Support or WhatsApp
          Customer Service. We are committed to addressing issues promptly and
          transparently. Thank you for choosing our platform to enhance your
          gaming experience.
        </p>
        <p className="mb-2 opacity-90">
          Date of Issuance: 18th April 2025
          <br />
          These Terms shall be effective as of 18th April 2025.
        </p>
      </div>
    </StoreLayout>
  );
};

export default Terms;
