"use client";

const LabelRow = (props: { num: String; label: String }) => {
  const { num, label } = props;

  return (
    <div className="flex flex-row gap-3">
      <h2>{num}</h2>
      <h2>{label}</h2>
    </div>
  );
};

export default LabelRow;
