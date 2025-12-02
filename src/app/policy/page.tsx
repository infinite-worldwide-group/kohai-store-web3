"use client";
import StoreLayout from "@/components/Layouts/StoreLayout";
import { useStore } from "@/contexts/StoreContext";
import React from "react";

const Policy: React.FC = () => {
  const { store } = useStore();

  return (
    <StoreLayout>
      <div
        className="text-white"
        style={{ color: store?.textColor ?? undefined }}
      >
        <h1 className="mb-2 text-4xl font-bold">
          Personal Data Protection Policy - Affiliate
        </h1>

        <h2 className="my-3 pt-6 text-xl font-bold">INTRODUCTION</h2>
        <p className="mb-2 opacity-90">
          This Personal Data Protection Policy (“Policy”) is issued by the
          registered owner of the game credit website (the “Website”). Our
          mission is to provide a seamless and secure platform for gamers to
          purchase game credits and digital vouchers without the need for
          registration. We value your privacy and are committed to protecting
          your personal information. This Policy outlines how we collect, use,
          and safeguard your Personal Data in accordance with the Personal Data
          Protection Act 2010, Malaysia, and any related regulations,
          guidelines, or amendments (collectively, the “PDPA”).
        </p>
        <p className="mb-2 opacity-90">
          By using the Website, you acknowledge that you have read, understood,
          and agree to this Policy. If you do not agree with this Policy, you
          must immediately discontinue use of the Website. We reserve the right
          to amend this Policy at any time, with changes announced on the
          Website. Your continued use of the Website after such announcements
          signifies your acceptance of the revised Policy.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          COLLECTION OF PERSONAL DATA
        </h2>
        <p className="mb-2 opacity-90">
          “Personal Data” refers to any information that can identify an
          individual, such as name, email address, payment details, game account
          identifiers, or IP address. We collect minimal Personal Data necessary
          to process your game credit purchases, as the Website does not require
          registration or account creation.
        </p>
        <p className="mb-2 opacity-90">
          We may collect Personal Data when you:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Complete a purchase for game credits or digital vouchers (e.g.,
            payment details, game account information).
          </li>
          <li>Contact our support team via email or other channels.</li>
          <li>
            Interact with the Website, including through cookies or analytics
            tools that collect non-identifiable data like IP addresses or
            browsing behavior.
          </li>
        </ul>
        <p className="mb-2 opacity-90">
          Personal Data may also be collected from third parties, such as
          payment processors, to facilitate transactions or comply with legal
          obligations.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          PURPOSE OF COLLECTING AND PROCESSING PERSONAL DATA
        </h2>
        <p className="mb-2 opacity-90">
          We process your Personal Data for the following purposes
          (collectively, “Purposes”):
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            To process and deliver game credit purchases to your specified game
            account.
          </li>
          <li>
            To verify and facilitate payment transactions through secure payment
            gateways.
          </li>
          <li>
            To respond to your inquiries, complaints, or support requests.
          </li>
          <li>To comply with legal, regulatory, or tax requirements.</li>
          <li>
            To analyze Website usage (via anonymized data) to improve services.
          </li>
          <li>
            To detect, prevent, or investigate fraudulent or illegal activities.
          </li>
        </ul>
        <p className="mb-2 opacity-90">
          If you do not provide the required Personal Data for a transaction
          (e.g., payment or game account details), we may be unable to process
          your purchase.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          DISCLOSURE OF PERSONAL DATA
        </h2>
        <p className="mb-2 opacity-90">
          We do not sell, rent, or share your Personal Data with third parties
          without your consent, except as necessary for the Purposes outlined
          above. We may disclose your Personal Data to:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Payment processors or financial institutions to complete
            transactions.
          </li>
          <li>
            Regulatory authorities, law enforcement, or courts to comply with
            legal obligations.
          </li>
          <li>
            Service providers (e.g., IT or data storage vendors) under strict
            confidentiality agreements to support Website operations.
          </li>
        </ul>

        <h2 className="my-3 pt-6 text-xl font-bold">YOUR RIGHTS</h2>
        <p className="mb-2 opacity-90">
          Under the PDPA, you have the right to:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Request access to or a copy of your Personal Data held by us
            (subject to a small administrative fee).
          </li>
          <li>Request correction of inaccurate or outdated Personal Data.</li>
          <li>
            Limit the processing of your Personal Data (e.g., opt out of
            marketing communications, if applicable).
          </li>
          <li>
            Withdraw consent for processing your Personal Data, subject to legal
            or contractual restrictions.
          </li>
        </ul>
        <p className="mb-2 opacity-90">
          To exercise these rights, contact us at customer support. We may
          refuse requests if permitted by law (e.g., if providing access would
          violate another individual’s rights). Withdrawing consent may prevent
          us from processing future transactions.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          SECURITY OF PERSONAL DATA
        </h2>
        <p className="mb-2 opacity-90">
          We implement industry-standard technical, physical, and procedural
          measures to protect your Personal Data from unauthorized access,
          disclosure, or loss. All payment transactions are encrypted, and
          access to Personal Data is restricted to authorized personnel only.
          However, no internet-based service is entirely secure, and we cannot
          guarantee absolute security for data transmitted online. You agree to
          use the Website at your own risk and will not hold us liable for
          unauthorized access beyond our reasonable control.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          RETENTION OF PERSONAL DATA
        </h2>
        <p className="mb-2 opacity-90">
          We retain your Personal Data only for as long as necessary to fulfill
          the Purposes or meet legal, regulatory, or operational requirements.
          Once no longer needed, your Personal Data is securely deleted or
          anonymized in accordance with our retention policies.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          TRANSFER OF PERSONAL DATA OUTSIDE MALAYSIA
        </h2>
        <p className="mb-2 opacity-90">
          Your Personal Data may be stored or processed on servers located
          outside Malaysia (e.g., by cloud service providers). We ensure that
          such third parties adhere to data protection standards comparable to
          those required by the PDPA. By using the Website, you consent to the
          transfer of your Personal Data outside Malaysia for these purposes.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">COOKIES AND ANALYTICS</h2>
        <p className="mb-2 opacity-90">
          We use cookies to enhance your experience and collect anonymized data
          (e.g., IP address, browser type) for Website analytics and performance
          improvements. Cookies do not identify you personally unless combined
          with other Personal Data. You can disable cookies in your browser
          settings, but this may affect Website functionality.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">THIRD-PARTY LINKS</h2>
        <p className="mb-2 opacity-90">
          The Website may contain links to third-party websites (e.g., game
          platforms or payment providers). We are not responsible for the
          privacy practices or content of these external sites. We recommend
          reviewing their privacy policies before providing any Personal Data.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          PERSONAL DATA FROM MINORS
        </h2>
        <p className="mb-2 opacity-90">
          Users under 18 must have parental or guardian consent to use the
          Website. If you provide Personal Data on behalf of a minor, you
          confirm that you have their consent or are legally authorized to act
          on their behalf.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">CONTACT DETAILS</h2>
        <p className="mb-2 opacity-90">
          For questions, complaints, or requests regarding your Personal Data,
          contact our Data Protection Officer at customer support.
        </p>
        <p className="mb-2 opacity-90">Date of Issuance: 18th April 2025</p>
        <p className="mb-2 opacity-90">
          This Policy shall be effective as of 18th April 2025.
        </p>
      </div>
    </StoreLayout>
  );
};

export default Policy;
