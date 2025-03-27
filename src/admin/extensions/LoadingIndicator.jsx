// LoadingIndicator.jsx
import React from "react";

const LoadingIndicator = () => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(0, 0, 0, 0.1)",
          borderTop: "4px solid #000",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span style={{ marginLeft: "10px" }}></span>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingIndicator;
