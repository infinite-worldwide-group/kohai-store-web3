"use client";
import StoreLayout from "@/components/Layouts/StoreLayout";
import { useStore } from "@/contexts/StoreContext";
import React from "react";

const AntiBribery: React.FC = () => {
  const { store } = useStore();

  return (
    <StoreLayout>
      <div
        className="text-white"
        style={{ color: store?.textColor ?? undefined }}
      >
        <h1 className="mb-2 text-4xl font-bold">
          Anti-Bribery and Corruption Policy - Affiliate
        </h1>

        <h2 className="my-3 pt-6 text-xl font-bold">INTRODUCTION</h2>
        <p className="mb-2 opacity-90">
          The Company (“we,” “us,” or “our”) is committed to operating its game
          credit website (the “Website”) with the highest standards of
          integrity, transparency, and ethical conduct. We enforce a
          zero-tolerance policy toward bribery and corruption in all forms and
          comply fully with the Malaysian Anti-Corruption Commission Act 2009
          (MACC Act 2009) and all applicable anti-bribery laws. No individual or
          entity associated with the Website may offer, give, receive, or
          solicit any bribes, kickbacks, gifts, hospitality, or anything of
          value intended to improperly influence business decisions or
          transactions.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          OBJECTIVES OF THE POLICY
        </h2>
        <p className="mb-2 opacity-90">This policy aims to:</p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Reinforce our commitment to ethical operations and integrity in all
            Website-related activities.
          </li>
          <li>
            Ensure leadership, including the Board of Directors and senior
            management, actively supports and oversees the Anti-Bribery
            Management System (ABMS) through accountability, resource
            allocation, and promotion of ethical practices.
          </li>
          <li>
            Guarantee compliance with the MACC Act 2009 and other relevant
            anti-bribery laws.
          </li>
          <li>
            Provide clear guidance on preventing, identifying, and reporting
            bribery and corruption.
          </li>
        </ul>

        <h2 className="my-3 pt-6 text-xl font-bold">SCOPE OF THE POLICY</h2>
        <p className="mb-2 opacity-90">
          This policy applies to all directors, employees, contractors, vendors,
          payment processors, and third-party service providers acting on behalf
          of the Company in connection with the Website. It covers all
          transactions and interactions, including those with users, suppliers,
          and digital partners, in Malaysia and any other countries where the
          Website operates.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">PROHIBITED CONDUCT</h2>
        <p className="mb-2 opacity-90">
          The following activities are strictly prohibited:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Bribery: Offering or receiving any financial or non-financial
            advantage to influence decisions, such as providing free game
            credits to secure a partnership.
          </li>
          <li>
            Kickbacks: Payments or benefits given in exchange for business
            favors, like rebates to a vendor for prioritizing services.
          </li>
          <li>
            Facilitation Payments: Payments to expedite routine actions, such as
            paying to speed up payment processing.
          </li>
          <li>
            Gifts and Hospitality: Providing or accepting gifts or entertainment
            that could influence decisions, like offering event tickets to
            secure a contract.
          </li>
          <li>
            Improper Donations: Making charitable contributions or sponsorships
            to disguise bribes.
          </li>
        </ul>

        <h2 className="my-3 pt-6 text-xl font-bold">PREVENTION MEASURES</h2>
        <p className="mb-2 opacity-90">
          To prevent bribery and corruption, we implement:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Risk Assessments: Regular evaluations of bribery risks in Website
            operations, such as payment processing or vendor agreements.
          </li>
          <li>
            Due Diligence: Background checks on third-party vendors, such as
            payment gateways, before engagement.
          </li>
          <li>
            Training: Ongoing anti-bribery training for employees and key
            contractors.
          </li>
          <li>
            Monitoring: Periodic audits to ensure compliance with this policy
            and secure transaction processes.
          </li>
        </ul>

        <h2 className="my-3 pt-6 text-xl font-bold">RESPONSIBILITIES</h2>
        <p className="mb-2 opacity-90">
          All individuals and entities associated with the Website must:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>Fully comply with this policy and understand its guidelines.</li>
          <li>
            Immediately report any suspected bribery or corruption via
            designated channels.
          </li>
          <li>Refuse and report any bribe offers or requests without delay.</li>
        </ul>
        <p className="mb-2 opacity-90">
          Non-compliance may result in disciplinary action, contract
          termination, or legal consequences.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          REPORTING AND WHISTLEBLOWING
        </h2>
        <p className="mb-2 opacity-90">
          We encourage reporting of any bribery, corruption, or suspicious
          activity. Reports can be made confidentially or anonymously, and
          whistleblowers are protected from retaliation under the law. Contact
          our Compliance Team at customer support.
        </p>
        <p className="mb-2 opacity-90">
          All reports are handled with confidentiality, and good-faith
          whistleblowers face no adverse consequences.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">
          CONSEQUENCES OF VIOLATIONS
        </h2>
        <p className="mb-2 opacity-90">
          Violations of this policy may lead to:
        </p>
        <ul className="mb-2 list-inside list-disc opacity-90">
          <li>
            Disciplinary Action: Warnings, suspension, or termination of
            employment or contracts.
          </li>
          <li>
            Termination of Relationships: Ending agreements with non-compliant
            vendors or partners.
          </li>
          <li>
            Legal Action: Reporting serious violations to the Malaysian
            Anti-Corruption Commission (MACC) or other authorities.
          </li>
        </ul>
        <p className="mb-2 opacity-90">
          We treat all breaches with utmost seriousness to uphold our commitment
          to integrity.
        </p>

        <h2 className="my-3 pt-6 text-xl font-bold">CONTINUOUS IMPROVEMENT</h2>
        <p className="mb-2 opacity-90">
          We are dedicated to maintaining an effective Anti-Bribery Management
          System (ABMS). This policy will be reviewed annually or as needed to
          align with legal and industry standards. We will conduct regular
          audits, risk assessments, and take corrective actions to address any
          identified weaknesses.
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

export default AntiBribery;
