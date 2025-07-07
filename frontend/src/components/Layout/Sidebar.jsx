import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  UserOutlined,
  UserAddOutlined,
  BarChartOutlined,
  ShopOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useModuleAccess } from "../../hooks/usePermissions";
import logoImage from "../../assets/Salons-Assured-logo.png";

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const hasModuleAccess = useModuleAccess || (() => true);

  const allMenuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      module: "dashboard",
    },
    {
      key: "/clients",
      icon: <TeamOutlined />,
      label: user?.userType === "client" ? "My Business" : "Clients",
      module: "clients",
    },
    {
      key: "/tasks",
      icon: <CheckSquareOutlined />,
      label: "Tasks",
      module: "tasks",
    },
    {
      key: "/onboarding",
      icon: <UserAddOutlined />,
      label: "Onboarding",
      module: "onboarding",
    },
    {
      key: "/staff",
      icon: <UserOutlined />,
      label: "Staff",
      module: "staff",
      roles: ["admin", "hr", "management", "director"],
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Reports",
      module: "reports",
      roles: ["admin", "director", "management"],
    },
    {
      key: "/user-management",
      icon: <SettingOutlined />,
      label: "User Management",
      module: "settings",
      roles: ["admin"],
    },
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter((item) => {
    // Check if user has access to the module
    if (
      item.module &&
      typeof hasModuleAccess === "function" &&
      !hasModuleAccess(item.module)
    ) {
      return false;
    }

    // Check role-based access for legacy compatibility
    if (item.roles && !item.roles.includes(user?.role)) {
      return false;
    }

    return true;
  });

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="dark"
      width={256}
      style={{
        background: "#001529",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "8px" : "8px 16px",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        {collapsed ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "4px",
              overflow: "hidden",
              background: "#152237",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px",
            }}
          >
            <img
              src={logoImage}
              alt="Salons Assured"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "6px",
                overflow: "hidden",
                background: "#152237",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                padding: "4px",
              }}
            >
              <img
                src={logoImage}
                alt="Salons Assured"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <span>Salons Assured</span>
          </>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: "#001529",
          border: "none",
        }}
      />
    </Sider>
  );
};

export default Sidebar;
