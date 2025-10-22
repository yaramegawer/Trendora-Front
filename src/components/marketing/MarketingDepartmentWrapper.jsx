import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const MarketingDepartmentWrapper = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
        <p style={{ color: "#6b7280" }}>
          You must be logged in to access the Digital Marketing department.
        </p>
      </div>
    );
  }

  return <div style={{ padding: 24 }}>{children}</div>;
};

export default MarketingDepartmentWrapper;
