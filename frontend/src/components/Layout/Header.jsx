import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Button, Dropdown, Avatar, Typography, Space } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { logout } from "../../store/slices/authSlice";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ collapsed, setCollapsed }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            width: 40,
            height: 40,
          }}
        />
        <Text strong style={{ marginLeft: 16, fontSize: "16px" }}>
          Welcome back, {user?.name}
        </Text>
      </div>

      <Space align="center">
        <Text type="secondary" style={{ marginRight: 8 }}>
          {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
        </Text>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <Avatar
            style={{
              backgroundColor: "#1890ff",
              cursor: "pointer",
            }}
            icon={<UserOutlined />}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
