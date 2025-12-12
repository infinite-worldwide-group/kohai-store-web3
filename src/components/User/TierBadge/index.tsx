"use client";

import React from "react";
import styles from "./TierBadge.module.css";

interface TierBadgeProps {
  tierName: string | null;
  tierStyle: string | null;
  discountPercent?: number;
  compact?: boolean;
}

/**
 * TierBadge Component
 * Displays user's VIP tier badge with appropriate styling
 *
 * Tier Styles:
 * - silver: Elite tier (1% discount)
 * - gold: Grandmaster tier (2% discount)
 * - orange: Legend tier (3% discount)
 */
const TierBadge: React.FC<TierBadgeProps> = ({
  tierName,
  tierStyle,
  discountPercent,
  compact = false
}) => {
  if (!tierName || !tierStyle) {
    return null; // No tier
  }

  const tierClassName = `${styles.tierBadge} ${styles[tierStyle] || ''}`;

  return (
    <span
      className={tierClassName}
      style={{ verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}
    >
      <span className={styles.badgeIcon}>👑</span>
      <span className={styles.badgeText}>{tierName}</span>
      {/* Discount percentage hidden per user request - only show tier name */}
    </span>
  );
};

export default TierBadge;
