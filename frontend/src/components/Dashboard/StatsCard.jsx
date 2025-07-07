import React from "react";
import { Card, Statistic, Space, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Text } = Typography;

const StatsCard = ({ stat }) => {
  const isIncrease = stat.changeType === "increase";
  const changeColor = isIncrease ? "#52c41a" : "#ff4d4f";
  const ChangeIcon = isIncrease ? ArrowUpOutlined : ArrowDownOutlined;

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        border: "none",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${stat.color || "#1890ff"}15 0%, ${
          stat.color || "#1890ff"
        }25 100%)`,
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {stat.icon && (
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: stat.color || "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
              }}
            >
              {stat.icon}
            </div>
          )}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: changeColor,
              }}
            >
              <ChangeIcon style={{ fontSize: 12 }} />
              <Text strong style={{ color: changeColor }}>
                {stat.change}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              vs last period
            </Text>
          </div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {stat.name}
          </Text>
          <div
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#262626",
              lineHeight: 1,
            }}
          >
            {typeof stat.value === "string"
              ? stat.value
              : stat.value.toLocaleString()}
          </div>
        </div>
      </Space>
    </Card>
  );
};

export default StatsCard;
