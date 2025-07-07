import { useContext } from "react";
import { PermissionContext } from "../contexts/PermissionContext";

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

// Hook for checking permissions in components
export const usePermissionCheck = (module, action = "read") => {
  const { hasPermission } = usePermissions();
  return hasPermission(module, action);
};

// Hook for checking module access
export const useModuleAccess = (module) => {
  const { hasModuleAccess } = usePermissions();
  return hasModuleAccess(module);
};
