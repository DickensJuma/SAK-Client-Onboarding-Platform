import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider, theme, App as AntApp } from "antd";
import { fetchUser } from "./store/slices/authSlice";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { PermissionProvider } from "./components/Auth/PermissionProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Tasks from "./pages/Tasks";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Onboarding from "./pages/Onboarding";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#c18992",
          borderRadius: 8,
          colorBgContainer: "#ffffff",
          colorLink: "#c18992",
          colorLinkHover: "#a67480",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorInfo: "#c18992",
        },
        components: {
          Layout: {
            siderBg: "#152237",
            headerBg: "#ffffff",
            bodyBg: "#f5f5f5",
          },
          Menu: {
            darkItemBg: "#152237",
            darkSubMenuItemBg: "#0f1a2a",
            darkItemSelectedBg: "#c18992",
            darkItemHoverBg: "rgba(193, 137, 146, 0.1)",
            darkItemColor: "#ffffff",
            darkItemSelectedColor: "#ffffff",
          },
          Button: {
            colorPrimary: "#c18992",
            colorPrimaryHover: "#a67480",
            colorPrimaryActive: "#8f5f6a",
          },
          Card: {
            colorBgContainer: "#ffffff",
            colorBorderSecondary: "#f0f0f0",
          },
          Table: {
            colorBgContainer: "#ffffff",
            headerBg: "#fafafa",
            headerColor: "#152237",
          },
          Tag: {
            colorPrimary: "#c18992",
          },
        },
      }}
    >
      <AntApp>
        <PermissionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route
                        path="/staff"
                        element={
                          <ProtectedRoute
                            roles={["admin", "hr", "management", "director"]}
                          >
                            <Staff />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute
                            roles={["admin", "director", "management"]}
                          >
                            <Reports />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/user-management"
                        element={
                          <ProtectedRoute roles={["admin"]}>
                            <UserManagement />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </PermissionProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
