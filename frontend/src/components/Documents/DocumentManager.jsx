import React, { useState } from "react";
import {
  Upload,
  Button,
  List,
  Modal,
  message,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Select,
  Input,
  Form,
} from "antd";
import {
  UploadOutlined,
  PaperClipOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Option } = Select;
const { TextArea } = Input;

const DocumentManager = ({
  entityType, // 'staff', 'clients', 'tasks'
  entityId,
  documents = [],
  onDocumentsChange,
  canUpload = true,
  canReview = false,
  canShare = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewForm] = Form.useForm();
  const [shareForm] = Form.useForm();

  const uploadProps = {
    name: "documents",
    multiple: true,
    maxCount: 5,
    beforeUpload: () => false, // Prevent auto upload
    onChange: (info) => {
      if (info.fileList.length > 0) {
        handleUpload(info.fileList);
      }
    },
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls",
  };

  const handleUpload = async (fileList) => {
    setUploading(true);
    try {
      const formData = new FormData();

      fileList.forEach((file) => {
        formData.append("documents", file.originFileObj || file);
      });

      await api.post(`/${entityType}/${entityId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Documents uploaded successfully");
      onDocumentsChange && onDocumentsChange();
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await api.delete(`/${entityType}/${entityId}/documents/${documentId}`);
      message.success("Document deleted successfully");
      onDocumentsChange && onDocumentsChange();
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete document");
    }
  };

  const handleReview = async (values) => {
    try {
      await api.put(
        `/${entityType}/${entityId}/documents/${selectedDocument._id}/review`,
        values
      );
      message.success("Document review updated successfully");
      setReviewModalVisible(false);
      onDocumentsChange && onDocumentsChange();
    } catch (error) {
      console.error("Review error:", error);
      message.error("Failed to update document review");
    }
  };

  const handleShare = async (values) => {
    try {
      await api.post(
        `/${entityType}/${entityId}/documents/${selectedDocument._id}/share`,
        values
      );
      message.success("Document shared successfully");
      setShareModalVisible(false);
      onDocumentsChange && onDocumentsChange();
    } catch (error) {
      console.error("Share error:", error);
      message.error("Failed to share document");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "orange";
    }
  };

  return (
    <div style={{ padding: "16px 0" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4>Documents ({documents.length})</h4>
        {canUpload && (
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload Documents
            </Button>
          </Upload>
        )}
      </div>

      <List
        dataSource={documents}
        renderItem={(document) => (
          <List.Item
            actions={[
              <Tooltip title="View">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(document.url, "_blank")}
                />
              </Tooltip>,
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = document.url;
                    link.download = document.name;
                    link.click();
                  }}
                />
              </Tooltip>,
              ...(canReview
                ? [
                    <Tooltip title="Review">
                      <Button
                        type="text"
                        icon={getStatusIcon(document.reviewStatus)}
                        onClick={() => {
                          setSelectedDocument(document);
                          setReviewModalVisible(true);
                          reviewForm.setFieldsValue({
                            status: document.reviewStatus,
                            reviewNotes: document.reviewNotes,
                          });
                        }}
                      />
                    </Tooltip>,
                  ]
                : []),
              ...(canShare && entityType === "clients"
                ? [
                    <Tooltip title="Share">
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        onClick={() => {
                          setSelectedDocument(document);
                          setShareModalVisible(true);
                        }}
                      />
                    </Tooltip>,
                  ]
                : []),
              <Popconfirm
                title="Delete Document"
                description="Are you sure you want to delete this document?"
                onConfirm={() => handleDelete(document._id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={<PaperClipOutlined style={{ fontSize: 24 }} />}
              title={
                <Space>
                  <span>{document.name}</span>
                  <Tag color={getStatusColor(document.reviewStatus)}>
                    {document.reviewStatus}
                  </Tag>
                  {document.type && <Tag>{document.type.toUpperCase()}</Tag>}
                </Space>
              }
              description={
                <div>
                  <div>
                    Uploaded:{" "}
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </div>
                  {document.reviewedAt && (
                    <div>
                      Reviewed:{" "}
                      {new Date(document.reviewedAt).toLocaleDateString()}
                      {document.reviewedBy && ` by ${document.reviewedBy.name}`}
                    </div>
                  )}
                  {document.reviewNotes && (
                    <div style={{ marginTop: 4, fontStyle: "italic" }}>
                      "{document.reviewNotes}"
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: "No documents uploaded yet",
        }}
      />

      {/* Review Modal */}
      <Modal
        title="Review Document"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form form={reviewForm} onFinish={handleReview} layout="vertical">
          <Form.Item
            name="status"
            label="Review Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reviewNotes" label="Review Notes">
            <TextArea rows={3} placeholder="Add review comments..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setReviewModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Review
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Share Modal */}
      <Modal
        title="Share Document"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
      >
        <Form form={shareForm} onFinish={handleShare} layout="vertical">
          <Form.Item
            name="recipients"
            label="Recipients"
            initialValue={entityType === "clients" ? [] : []}
          >
            <Select mode="tags" placeholder="Enter email addresses">
              {/* Pre-populated options can be added here */}
            </Select>
          </Form.Item>

          <Form.Item name="message" label="Message">
            <TextArea rows={3} placeholder="Add a message..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setShareModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Share Document
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentManager;
