import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../services/api";
import { PermissionContext } from "../../contexts/PermissionContext";

export const PermissionProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState(null);
  const [accessibleModules, setAccessibleModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    try {
      const response = await api.get("/users/profile/me");
      setUserPermissions(response.data.permissions);
      setAccessibleModules(response.data.accessibleModules);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (module, action = "read") => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === "admin") return true;

    // Client users have restricted access
    if (user.userType === "client") {
      return module === "clients" && action === "read";
    }

    // Check specific permissions
    const permission = userPermissions?.find((p) => p.module === module);
    if (!permission) return false;

    return permission.actions.includes(action) || permission.level === "full";
  };

  const hasModuleAccess = (module) => {
    if (!user) return false;

    // Admin has all access
    if (user.role === "admin") return true;

    return accessibleModules.includes(module);
  };

  const getPermissionLevel = (module) => {
    if (!user) return "none";

    if (user.role === "admin") return "full";

    const permission = userPermissions?.find((p) => p.module === module);
    return permission?.level || "none";
  };

  const isClient = () => user?.userType === "client";
  const isAdmin = () => user?.role === "admin";
  const isStaff = () => user?.userType === "staff";

  const value = {
    hasPermission,
    hasModuleAccess,
    getPermissionLevel,
    isClient,
    isAdmin,
    isStaff,
    accessibleModules,
    userPermissions,
    loading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
