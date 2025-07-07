import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

// Component for conditionally rendering based on permissions
export const PermissionGate = ({
  children,
  module,
  action = "read",
  fallback = null,
  level = null,
}) => {
  const { hasPermission, getPermissionLevel } = usePermissions();

  if (level) {
    const userLevel = getPermissionLevel(module);
    const levelHierarchy = ["none", "view", "edit", "full"];
    const requiredLevelIndex = levelHierarchy.indexOf(level);
    const userLevelIndex = levelHierarchy.indexOf(userLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return fallback;
    }
  }

  if (!hasPermission(module, action)) {
    return fallback;
  }

  return children;
};
