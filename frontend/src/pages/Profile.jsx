import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Form,
  Input,
  Select,
  Upload,
  Divider,
  Space,
  Tabs,
  Switch,
  notification,
  Spin,
  Badge,
  List,
  Tag,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SecurityScanOutlined,
  BellOutlined,
  EyeOutlined,
  LockOutlined,
  HistoryOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import { usePermissions } from "../hooks/usePermissions";
import "./Profile.css";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchProfileData();
    fetchActivityData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/profile");
      setProfileData(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to load profile data",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      const response = await api.get("/users/activity");
      setActivityData(response.data.activities || []);
    } catch (error) {
      console.error("Failed to load activity data:", error);
    }
  };

  const handleAvatarUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      notification.error({
        message: "Invalid file type",
        description: "Please upload an image file",
      });
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notification.error({
        message: "File too large",
        description: "Image must be smaller than 2MB",
      });
      return false;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
    return false;
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Add form data
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === "object" && values[key] !== null) {
          Object.keys(values[key]).forEach((subKey) => {
            formData.append(`${key}[${subKey}]`, values[key][subKey]);
          });
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Add avatar if selected
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await api.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfileData(response.data);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);

      notification.success({
        message: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      await api.put("/users/change-password", values);
      notification.success({
        message: "Success",
        description: "Password changed successfully",
      });
      form.resetFields(["currentPassword", "newPassword", "confirmPassword"]);
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  const ProfileHeader = () => (
    <Card className="profile-header-card">
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} sm={8} md={6} className="text-center">
          <div className="avatar-container">
            <Badge
              count={
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  className="avatar-upload-btn"
                  onClick={() =>
                    document.getElementById("avatar-upload").click()
                  }
                />
              }
              offset={[-10, 10]}
            >
              <Avatar
                size={120}
                src={avatarPreview || profileData?.avatar || user?.avatar}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
            </Badge>
            <Upload
              id="avatar-upload"
              beforeUpload={handleAvatarUpload}
              showUploadList={false}
              accept="image/*"
              style={{ display: "none" }}
            >
              <input type="file" style={{ display: "none" }} />
            </Upload>
          </div>
        </Col>
        <Col xs={24} sm={16} md={18}>
          <div className="profile-info">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title level={2} style={{ margin: 0, color: "#152237" }}>
                {profileData?.name || user?.name}
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                {profileData?.position || user?.position || "Staff Member"}
              </Text>
              <div className="profile-tags">
                <Tag color="#152237">{profileData?.role || user?.role}</Tag>
                {profileData?.userType && (
                  <Tag color="#c28992">{profileData.userType}</Tag>
                )}
              </div>
              <Space className="profile-contact">
                <Space>
                  <MailOutlined />
                  <Text>{profileData?.email || user?.email}</Text>
                </Space>
                {profileData?.phone && (
                  <Space>
                    <PhoneOutlined />
                    <Text>{profileData.phone}</Text>
                  </Space>
                )}
              </Space>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const PersonalInfoTab = () => (
    <Card title="Personal Information" className="profile-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={!editing}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone" label="Phone Number">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="position" label="Position/Title">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name={["address", "street"]} label="Street Address">
              <Input prefix={<EnvironmentOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={["address", "city"]} label="City">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={["address", "state"]} label="State/Province">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name={["address", "zipCode"]} label="ZIP/Postal Code">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Space>
          {!editing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={loading}
              >
                Save Changes
              </Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </>
          )}
        </Space>
      </Form>
    </Card>
  );

  const SecurityTab = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Change Password" className="profile-card">
        <Form layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </Form>
      </Card>

      <Card title="Security Settings" className="profile-card">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="security-item">
            <Space>
              <SecurityScanOutlined />
              <div>
                <Text strong>Two-Factor Authentication</Text>
                <br />
                <Text type="secondary">Add an extra layer of security</Text>
              </div>
            </Space>
            <Switch />
          </div>
          <Divider />
          <div className="security-item">
            <Space>
              <BellOutlined />
              <div>
                <Text strong>Login Notifications</Text>
                <br />
                <Text type="secondary">Get notified of new logins</Text>
              </div>
            </Space>
            <Switch defaultChecked />
          </div>
        </Space>
      </Card>
    </Space>
  );

  const ActivityTab = () => (
    <Card title="Recent Activity" className="profile-card">
      <List
        dataSource={activityData}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<HistoryOutlined />} />}
              title={item.action}
              description={
                <Space direction="vertical" size="small">
                  <Text type="secondary">{item.description}</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: "No recent activity" }}
      />
    </Card>
  );

  if (loading && !profileData) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Title level={2}>
          <UserOutlined /> Profile Settings
        </Title>
        <Text type="secondary">
          Manage your account settings and preferences
        </Text>
      </div>

      <ProfileHeader />

      <Card className="profile-tabs-card">
        <Tabs defaultActiveKey="personal" size="large">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Personal Info
              </span>
            }
            key="personal"
          >
            <PersonalInfoTab />
          </TabPane>
          <TabPane
            tab={
              <span>
                <SecurityScanOutlined />
                Security
              </span>
            }
            key="security"
          >
            <SecurityTab />
          </TabPane>
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Activity
              </span>
            }
            key="activity"
          >
            <ActivityTab />
          </TabPane>
          {hasPermission("admin") && (
            <TabPane
              tab={
                <span>
                  <SettingOutlined />
                  Preferences
                </span>
              }
              key="preferences"
            >
              <Card title="System Preferences" className="profile-card">
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div className="preference-item">
                    <Space>
                      <BellOutlined />
                      <div>
                        <Text strong>Email Notifications</Text>
                        <br />
                        <Text type="secondary">Receive email updates</Text>
                      </div>
                    </Space>
                    <Switch defaultChecked />
                  </div>
                  <Divider />
                  <div className="preference-item">
                    <Space>
                      <TeamOutlined />
                      <div>
                        <Text strong>Team Updates</Text>
                        <br />
                        <Text type="secondary">
                          Get notified about team changes
                        </Text>
                      </div>
                    </Space>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </Card>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;
