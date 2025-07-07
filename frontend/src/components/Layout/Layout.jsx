import React, { useState } from "react";
import { Layout as AntLayout } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-overlay">
      <AntLayout style={{ minHeight: "100vh" }}>
        <Sidebar collapsed={collapsed} />
        <AntLayout>
          <Header collapsed={collapsed} setCollapsed={setCollapsed} />
          <Content>{children}</Content>
        </AntLayout>
      </AntLayout>
    </div>
  );
};

export default Layout;
