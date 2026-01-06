"use client";

import { TopupProductFragment } from "graphql/generated/graphql";

import styles from "./TopupProduct.module.css";

const GameInfo = (props: { item: TopupProductFragment }) => {
  const {
    avatarUrl,
    title,
    helperUrl,
    category,
    description,
    publisher,
    genre,
  } = props.item;

  return (
    <>
      <div className="mb-4 flex flex-row gap-4">
        {!!avatarUrl && <img src={avatarUrl} className={styles.avatar} />}
        <div>
          <h3>{title}</h3>
          <p>{publisher?.name}</p>
        </div>
      </div>
      <div className="mb-4 flex flex-row gap-2">
        {category && (
          <div className="rounded-full bg-gray-300 px-3 py-1">
            {category.name}
          </div>
        )}
        {genre && (
          <div className="rounded-full bg-gray-300 px-3 py-1">{genre}</div>
        )}
      </div>
      {!!description && <p>{description}</p>}
    </>
  );
};

export default GameInfo;
