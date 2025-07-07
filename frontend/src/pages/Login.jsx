import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Space, Carousel } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../store/slices/authSlice";
import logoImage from "../assets/Salons-Assured-logo.png";
import kenyaTrainingImage from "../assets/Salons-Assured-Kenya-Training.jpg";
import trainingImage from "../assets/Training.jpg";
import happyClientsDecImage from "../assets/Happy-Clients-Dec.jpg";
import happyClientsSalonsImage from "../assets/Happy-Clients-Salons-Assured.jpg";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onFinish = (values) => {
    dispatch(login(values));
  };

  // Slider content for the left side
  const sliderItems = [
    {
      title: "Professional Training Programs",
      description:
        "Comprehensive training programs designed to elevate your salon's service quality and staff expertise.",
      backgroundImage: kenyaTrainingImage,
      overlay: "rgba(21, 34, 55, 0.7)",
    },
    {
      title: "Expert-Led Training Sessions",
      description:
        "Learn from industry professionals and master the latest techniques in beauty and salon management.",
      backgroundImage: trainingImage,
      overlay: "rgba(21, 34, 55, 0.7)",
    },
    {
      title: "Happy Clients, Growing Businesses",
      description:
        "Join hundreds of satisfied salon owners who have transformed their businesses with our comprehensive platform.",
      backgroundImage: happyClientsDecImage,
      overlay: "rgba(21, 34, 55, 0.6)",
    },
    {
      title: "Success Stories & Testimonials",
      description:
        "See how salon owners across the industry have achieved remarkable growth and client satisfaction with Salons Assured.",
      backgroundImage: happyClientsSalonsImage,
      overlay: "rgba(21, 34, 55, 0.6)",
    },
    {
      title: "Streamline Your Operations",
      description:
        "Manage clients, staff, and tasks efficiently with our comprehensive platform designed specifically for beauty businesses.",
      background: "linear-gradient(135deg, #152237 0%, #1a2e47 100%)",
       backgroundImage: happyClientsSalonsImage,
      icon: "🏪",
       overlay: "rgba(21, 34, 55, 0.6)",
    },
    {
      title: "Grow Your Business",
      description:
        "Access powerful analytics and reporting tools to understand your business performance and identify growth opportunities.",
      background: "linear-gradient(135deg, #152237 0%, #2a4d6b 100%)",
           backgroundImage: happyClientsDecImage,
      icon: "�",
       overlay: "rgba(21, 34, 55, 0.6)",
    },
  ];

  return (
    <div className="login-container">
      {/* Left Panel - Image Slider */}
      <div className="login-left-panel">
        <div className="login-carousel">
          <Carousel
            autoplay
            dots={true}
            effect="fade"
            autoplaySpeed={4000}
            dotPosition="bottom"
          >
            {sliderItems.map((item, index) => (
              <div key={index}>
                <div
                  className="login-slide"
                  style={{
                    background: item.backgroundImage
                      ? `url(${item.backgroundImage})`
                      : item.background,
                  }}
                >
                  {/* Overlay for better text readability on images */}
                  {item.backgroundImage && (
                    <div
                      className="login-slide-overlay"
                      style={{
                        background: item.overlay,
                      }}
                    />
                  )}

                  <div className="login-slide-content">
                    {item.icon && (
                      <div
                        style={{
                          fontSize: "4rem",
                          marginBottom: "20px",
                        }}
                      >
                        {item.icon}
                      </div>
                    )}
                    <Typography.Title
                      level={2}
                      style={{
                        color: "white",
                        marginBottom: "20px",
                        fontSize: "2.5rem",
                        fontWeight: "600",
                        textShadow: item.backgroundImage
                          ? "2px 2px 4px rgba(0,0,0,0.5)"
                          : "none",
                      }}
                    >
                      {item.title}
                    </Typography.Title>
                    <Typography.Text
                      style={{
                        color: "rgba(255, 255, 255, 0.95)",
                        fontSize: "1.2rem",
                        lineHeight: "1.6",
                        maxWidth: "500px",
                        textShadow: item.backgroundImage
                          ? "1px 1px 2px rgba(0,0,0,0.5)"
                          : "none",
                      }}
                    >
                      {item.description}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-right-panel">
        <Card className="login-form-card">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <div className="login-logo-container">
                <img
                  src={logoImage}
                  alt="Salons Assured Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <Typography.Title
                level={2}
                style={{ marginBottom: 8, color: "#152237" }}
              >
                Welcome Back
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "16px" }}>
                Sign in to your Salons Assured account
              </Typography.Text>
            </div>

            <Form
              name="login"
              size="large"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-form-button"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Login;
