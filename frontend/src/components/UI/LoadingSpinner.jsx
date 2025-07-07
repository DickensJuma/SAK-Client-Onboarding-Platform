import React from "react";
import { Spin } from "antd";

const LoadingSpinner = ({
  size = "default",
  tip = "Loading...",
  spinning = true,
  children,
}) => {
  // If there are children, use nested pattern with tip
  if (children) {
    return (
      <Spin size={size} tip={tip} spinning={spinning}>
        {children}
      </Spin>
    );
  }

  // If no children, use standalone spinner without tip to avoid warning
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Spin size={size} spinning={spinning} />
      {tip && <div style={{ marginTop: "8px", color: "#666" }}>{tip}</div>}
    </div>
  );
};

export default LoadingSpinner;
