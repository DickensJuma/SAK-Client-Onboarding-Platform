import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

// Higher-order component for route protection
export const withPermission = (
  WrappedComponent,
  requiredModule,
  requiredAction = "read"
) => {
  return (props) => {
    const { hasPermission, hasModuleAccess, loading } = usePermissions();
    const navigate = useNavigate();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (
      !hasModuleAccess(requiredModule) ||
      !hasPermission(requiredModule, requiredAction)
    ) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have permission to access this page."
          extra={
            <Button type="primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          }
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
};
