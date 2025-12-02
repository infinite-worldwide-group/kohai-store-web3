"use client";

import { TopupProductFragment } from "graphql/generated/graphql";
import styles from "./TopupProduct.module.css";

const GameInfo = (props: { item: TopupProductFragment | null }) => {
  if (!props.item) return null;

  const {
    avatarUrl,
    title,
    category,
    description,
    publisher,
  } = props.item;

  // These fields don't exist in TopupProduct
  const helperUrl = null;
  const genre = null;

  const isAllowedDomain = process.env.NEXT_PUBLIC_DOMAIN === "https://store.kohai.gg/";

  return (  
    <div className="sticky top-25 z-30">
      <div className="mb-4 flex flex-row gap-4">
        {!!avatarUrl && <img src={avatarUrl} className={styles.avatar} />}
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="opacity-60">{typeof publisher === 'string' ? publisher : ''}</p>
        </div>
      </div>
      <div className="mb-4 flex flex-row gap-2">
        {category && (
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-white text-opacity-70 shadow-2xl backdrop-blur-md">
            {typeof category === 'string' ? category : ''}
          </div>
        )}
        {genre && (
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-white text-opacity-70 shadow-2xl backdrop-blur-md">
            {genre}
          </div>
        )}
      </div>
      {!!description && (
        <p className="mb-4 text-sm opacity-70">{description}</p>
      )}
      {!!isAllowedDomain && (
        <a href={"https://www.trustpilot.com/review/store.kohai.gg"} target="_blank" rel="noopener noreferrer"
          className="mb-6 mt-6 flex flex-row gap-4 rounded-xl"
          style={{ background: "rgba(105, 101, 101, 0.22)" }}
        >
          <div className="flex flex-col justify-between h-auto items-start gap-2 p-4 flex-1 relative">
            <div className="flex items-start gap-2">
              {/* Avatar */}
              <img
                src="https://user-images.trustpilot.com/688bd664b7b81778c3652c74/73x73.png"
                alt="User avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="flex flex-col flex-1">
                {/* Username and verified */}
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[11px] font-semibold text-white">Louis Sanggah</span>
                  {/* Verified tick */}
                  <span className="inline-flex items-center justify-center rounded-full bg-[#00b67a] h-3 w-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="h-2 w-2"
                    >
                      <path
                        d="M3 6.5l2 2 4-4"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[9px] text-green-600 font-semibold ml-0.5">Verified</span>
                </div>
                {/* 4.5 stars */}
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(4)].map((_, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center justify-center bg-[#00b67a] rounded px-0.5 py-0.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="#fff"
                        className="h-1.5 w-1.5"
                      >
                        <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.27l-4.94 2.58.94-5.51-4-3.9 5.53-.8L10 1.5z" />
                      </svg>
                    </span>
                  ))}
                  <span className="inline-flex items-center justify-center bg-[#00b67a] rounded px-0.5 py-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      className="h-1.5 w-1.5"
                    >
                      <defs>
                        <linearGradient id="halfStarGrey" x1="0" x2="1" y1="0" y2="0">
                          <stop offset="50%" stopColor="#fff" />
                          <stop offset="50%" stopColor="#d1d5db" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.27l-4.94 2.58.94-5.51-4-3.9 5.53-.8L10 1.5z"
                        fill="url(#halfStarGrey)"
                      />
                    </svg>
                  </span>
                </div>
                {/* Comment text */}
                <span className="text-[11px] text-white whitespace-normal break-words leading-relaxed">
                  This website Kohai it's cool and amazing, especially for top up diamond in any games, and I have been used this for a month... So shout out to Kohai Esport because give us useful and cheap price for top up
                </span>
                <br />
                {/* Trustpilot logo at right bottom, no text */}
                <div rel="noopener noreferrer" className="absolute bottom-2 right-2 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#00b67a"
                    className="h-4 w-4"
                  >
                    <path d="M12 0l2.39 7.35h7.72l-6.24 4.54 2.39 7.35-6.26-4.54-6.24 4.54 2.39-7.35L1.89 7.35h7.72z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-white">Trustpilot</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      )}
      {!!helperUrl && <img src={helperUrl} className="mt-2 rounded-xl" />}
    </div>
  );
};

export default GameInfo;