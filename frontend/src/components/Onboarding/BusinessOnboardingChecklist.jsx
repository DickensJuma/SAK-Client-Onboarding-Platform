import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Button,
  Steps,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  InputNumber,
  DatePicker,
  message,
  Progress,
  Alert,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  StarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../services/api";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const BusinessOnboardingChecklist = ({
  onComplete,
  initialData = {},
  editMode = "full",
  selectedStage = null,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [formData, setFormData] = useState({
    businessInfo: {},
    preOnboarding: {},
    needsAssessment: {},
    serviceProposal: {},
    followUp: {},
    contract: {},
    relationship: {},
    feedback: {},
    ...initialData,
  });

  useEffect(() => {
    fetchClients();
    fetchStaff();
  }, []);

  // Separate effect to handle stage-specific editing
  useEffect(() => {
    if (editMode === "stage" && selectedStage) {
      const stageMap = {
        businessInfo: 0,
        preOnboarding: 1,
        needsAssessment: 2,
        serviceProposal: 3,
        followUp: 4,
        feedback: 5,
      };
      const stageIndex = stageMap[selectedStage];
      if (stageIndex !== undefined) {
        setCurrentStep(stageIndex);
      }
    }
  }, [editMode, selectedStage]);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const response = await api.get("/staff");
      console.log("Staff API response:", response.data);
      const staffData = response.data.staff || response.data || [];
      console.log("Staff data:", staffData);
      setStaff(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      // Mock data for demo if API fails
      const mockStaff = [
        {
          _id: "staff1",
          name: "Alice Johnson",
          position: "Senior Stylist",
          email: "alice@salon.com",
          phone: "+254701234567",
          specialties: ["Hair Cutting", "Coloring", "Styling"],
        },
        {
          _id: "staff2",
          name: "David Smith",
          position: "Barber",
          email: "david@salon.com",
          phone: "+254702345678",
          specialties: ["Men's Cuts", "Beard Trimming", "Hot Towel Shave"],
        },
        {
          _id: "staff3",
          name: "Maria Garcia",
          position: "Beauty Therapist",
          email: "maria@salon.com",
          phone: "+254703456789",
          specialties: ["Facials", "Manicure", "Pedicure"],
        },
        {
          _id: "staff4",
          name: "James Wilson",
          position: "Manager",
          email: "james@salon.com",
          phone: "+254704567890",
          specialties: ["Management", "Customer Service", "Training"],
        },
      ];
      console.log("Using mock staff:", mockStaff);
      setStaff(mockStaff);
    } finally {
      setLoadingStaff(false);
    }
  };
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await api.get("/clients");
      console.log("API response:", response.data);
      const clientsData = response.data.clients || response.data || [];
      console.log("Clients data:", clientsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Mock data for demo if API fails
      const mockClients = [
        {
          _id: "1",
          businessName: "TechCorp Solutions",
          businessType: "corporate",
          contactPerson: {
            name: "John Doe",
            position: "HR Manager",
            phone: "+254712345678",
            email: "john@techcorp.com",
          },
          address: {
            street: "123 Corporate Plaza",
            city: "Nairobi",
            state: "Nairobi County",
            zipCode: "00100",
          },
          numberOfEmployees: 50,
          operatingHours: "Mon-Fri 8:00AM - 5:00PM",
        },
        {
          _id: "2",
          businessName: "Elite Beauty Center",
          businessType: "salon",
          contactPerson: {
            name: "Sarah Johnson",
            position: "Owner",
            phone: "+254723456789",
            email: "sarah@elitebeauty.com",
          },
          address: {
            street: "456 Beauty Street",
            city: "Mombasa",
            state: "Mombasa County",
            zipCode: "80100",
          },
          numberOfEmployees: 15,
          operatingHours: "Mon-Sat 9:00AM - 6:00PM",
        },
        {
          _id: "3",
          businessName: "City Hotel Group",
          businessType: "hospitality",
          contactPerson: {
            name: "Michael Brown",
            position: "General Manager",
            phone: "+254734567890",
            email: "michael@cityhotel.com",
          },
          address: {
            street: "789 Hotel Avenue",
            city: "Kisumu",
            state: "Kisumu County",
            zipCode: "40100",
          },
          numberOfEmployees: 100,
          operatingHours: "24/7",
        },
      ];
      console.log("Using mock clients:", mockClients);
      setClients(mockClients);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleClientSelect = (clientId) => {
    console.log("Selected client ID:", clientId);
    const client = clients.find((c) => c._id === clientId);
    console.log("Found client:", client);

    if (client) {
      // Map the client data structure to form fields
      const formValues = {
        companyName: client.businessName || client.companyName,
        businessType: client.businessType,
        contactPersonTitle: client.contactPerson
          ? `${client.contactPerson.name} - ${client.contactPerson.position}`
          : client.contactPersonTitle,
        phoneNumber: client.contactPerson
          ? client.contactPerson.phone
          : client.phoneNumber,
        emailAddress: client.contactPerson
          ? client.contactPerson.email
          : client.emailAddress,
        physicalAddress: client.address
          ? `${client.address.street}, ${client.address.city}, ${client.address.state}`
          : client.physicalAddress,
        numberOfEmployees: client.numberOfEmployees || 0,
        operatingHours: client.operatingHours || "",
        websiteSocialMedia: client.websiteSocialMedia || "",
        poBox: client.address?.zipCode || client.poBox || "",
      };

      // Auto-fill form with client data
      form.setFieldsValue(formValues);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          ...formValues,
          clientId: client._id || client.id,
        },
      }));

      message.success(
        `Client "${formValues.companyName}" selected and form auto-filled!`
      );
    } else {
      console.error("Client not found for ID:", clientId);
      message.error("Client not found. Please try again.");
    }
  };

  const steps = [
    {
      title: "Business Information",
      icon: <ShopOutlined />,
      content: "businessInfo",
    },
    {
      title: "Pre-Onboarding",
      icon: <UserOutlined />,
      content: "preOnboarding",
    },
    {
      title: "Needs Assessment",
      icon: <QuestionCircleOutlined />,
      content: "needsAssessment",
    },
    {
      title: "Service Proposal",
      icon: <FileTextOutlined />,
      content: "serviceProposal",
    },
    {
      title: "Follow-up & Contract",
      icon: <CheckCircleOutlined />,
      content: "followUp",
    },
    {
      title: "Feedback & Review",
      icon: <StarOutlined />,
      content: "feedback",
    },
  ];

  const calculateProgress = () => {
    const totalSteps = steps.length;
    return Math.round(((currentStep + 1) / totalSteps) * 100);
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        ...formData,
        [steps[currentStep].content]: values,
      };
      setFormData(updatedData);

      if (editMode === "stage") {
        // Stage-specific update: complete the update for this stage only
        await handleComplete(updatedData);
      } else if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        form.resetFields();
        // Set form values for next step if they exist
        if (updatedData[steps[currentStep + 1].content]) {
          form.setFieldsValue(updatedData[steps[currentStep + 1].content]);
        }
      } else {
        // Final step - complete onboarding
        await handleComplete(updatedData);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Please complete all required fields");
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    form.resetFields();
    // Load previous step data
    if (formData[steps[currentStep - 1].content]) {
      form.setFieldsValue(formData[steps[currentStep - 1].content]);
    }
  };

  const handleComplete = async (data) => {
    setLoading(true);
    try {
      console.log(
        "BusinessOnboardingChecklist - handleComplete called with data:",
        data
      );

      // Get selected staff member details if assigned
      let assignedStaffDetails = null;
      if (data.feedback?.assignedStaffMember) {
        const selectedStaff = staff.find(
          (member) =>
            member._id === data.feedback.assignedStaffMember ||
            member.id === data.feedback.assignedStaffMember
        );
        if (selectedStaff) {
          assignedStaffDetails = {
            staffId: selectedStaff._id || selectedStaff.id,
            name: selectedStaff.name,
            position: selectedStaff.position,
            email: selectedStaff.email,
            phone: selectedStaff.phone,
          };
        }
      }

      const completeData = {
        ...data,
        assignedStaffDetails,
        completedAt: dayjs().toISOString(),
        progress: 100, // Always 100 when completing the full checklist
      };

      console.log(
        "BusinessOnboardingChecklist - completeData to be sent:",
        completeData
      );

      if (onComplete) {
        await onComplete(completeData);
      }

      message.success("Business onboarding checklist completed successfully!");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      message.error("Failed to complete onboarding checklist");
    } finally {
      setLoading(false);
    }
  };

  const renderBusinessInfo = () => (
    <div>
      <Title level={4}>
        <ShopOutlined /> Business Client Information
      </Title>

      {/* Client Selection Section */}
      <Card
        size="small"
        style={{ marginBottom: 24, backgroundColor: "#f8f9fa" }}
      >
        <Title level={5}>
          <SearchOutlined /> Select Existing Client
        </Title>
        <Alert
          message="Choose from existing clients or enter new business information below"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form.Item name="clientId" label="Select Client (Optional)">
          <Select
            placeholder="Search and select an existing client"
            loading={loadingClients}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={handleClientSelect}
            style={{ width: "100%" }}
          >
            {clients.map((client) => (
              <Option
                key={client._id || client.id}
                value={client._id || client.id}
              >
                {client.businessName || client.companyName} -{" "}
                {client.businessType}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: "Company name is required" }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="businessType"
            label="Industry/Business Type"
            rules={[{ required: true, message: "Business type is required" }]}
          >
            <Select placeholder="Select business type">
              <Option value="salon">Salon</Option>
              <Option value="barbershop">Barbershop</Option>
              <Option value="spa">Spa</Option>
              <Option value="corporate">Corporate Office</Option>
              <Option value="retail">Retail Business</Option>
              <Option value="hospitality">Hotel/Restaurant</Option>
              <Option value="healthcare">Healthcare Facility</Option>
              <Option value="education">Educational Institution</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="physicalAddress"
            label="Physical Address"
            rules={[
              { required: true, message: "Physical address is required" },
            ]}
          >
            <TextArea rows={2} placeholder="Enter complete physical address" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="poBox" label="P.O. Box">
            <Input placeholder="Enter P.O. Box" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="contactPersonTitle"
            label="Contact Person/Title"
            rules={[{ required: true, message: "Contact person is required" }]}
          >
            <Input placeholder="Name and job title" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: "Phone number is required" }]}
          >
            <Input placeholder="+254..." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="emailAddress"
            label="Email Address"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="company@example.com" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="websiteSocialMedia" label="Website/Social Media">
            <Input placeholder="www.company.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="numberOfEmployees"
            label="Number of Employees"
            rules={[
              { required: true, message: "Number of employees is required" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Enter number"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="operatingHours"
            label="Operating Hours"
            rules={[
              { required: true, message: "Operating hours are required" },
            ]}
          >
            <Input placeholder="e.g., Mon-Fri 8:00AM - 5:00PM" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderPreOnboarding = () => (
    <div>
      <Title level={4}>
        <UserOutlined /> Pre-Onboarding Checklist
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>Initial Contact & Research</Title>
        <Form.Item name="initialContactChecklist" valuePropName="checked">
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Checkbox value="businessResearched">
                  Business identified and researched
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="initialContactMade">
                  Initial contact made (phone/email/visit)
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="appointmentScheduled">
                  Appointment scheduled with decision maker
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="backgroundGathered">
                  Company background information gathered
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="competitorAnalysis">
                  Competitor analysis completed
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="needsAssessmentPrepared">
                  Service needs assessment prepared
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Card size="small">
        <Title level={5}>First Meeting Preparation</Title>
        <Form.Item name="meetingPrepChecklist" valuePropName="checked">
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Checkbox value="portfolioPrepared">
                  Service portfolio prepared
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="pricingReady">Pricing packages ready</Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="materialsGathered">
                  Promotional materials gathered
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="businessCardsReady">
                  Business cards and flyers ready
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="contractTemplates">
                  Contract templates prepared
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="calendarAvailable">
                  Calendar available for booking
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Form.Item name="initialContactDate" label="Initial Contact Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="firstMeetingDate" label="First Meeting Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderNeedsAssessment = () => (
    <div>
      <Title level={4}>
        <QuestionCircleOutlined /> Business Needs Assessment Questionnaire
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>1. Current Beauty & Grooming Arrangements</Title>
        <Form.Item
          name="currentArrangements"
          label="Do you currently have arrangements with any salon/barbershop for your staff?"
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="currentProvider" label="If yes, which one?">
          <Input placeholder="Current service provider" />
        </Form.Item>

        <Form.Item
          name="employeeGroomingHandling"
          label="How do your employees currently handle their grooming needs?"
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="individual">Individual arrangements</Radio>
              <Radio value="company">Company sponsored</Radio>
              <Radio value="none">No specific arrangement</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="satisfactionWithCurrent"
          label="Are you satisfied with current arrangements? Why/Why not?"
        >
          <TextArea rows={3} placeholder="Please explain..." />
        </Form.Item>
      </Card>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>2. Service Requirements</Title>
        <Form.Item
          name="servicesNeeded"
          label="Which services would be most valuable for your business?"
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Checkbox value="corporateHaircuts">
                  Corporate haircuts/styling for staff
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="executiveGrooming">
                  Executive grooming packages
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="eventStyling">
                  Event styling (meetings, conferences, launches)
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="regularMaintenance">
                  Regular maintenance packages
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="specialOccasions">
                  Wedding/special occasion services for staff
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="clientEntertainment">
                  Client entertainment (bringing clients for services)
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="otherServices" label="Other services needed">
          <Input placeholder="Please specify other services..." />
        </Form.Item>
      </Card>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>3. Scheduling Preferences</Title>
        <Form.Item name="preferredDays" label="Preferred service days">
          <Checkbox.Group>
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Checkbox value="monday">Monday</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="tuesday">Tuesday</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="wednesday">Wednesday</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="thursday">Thursday</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="friday">Friday</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="saturday">Saturday</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="sunday">Sunday</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="preferredTimeSlots" label="Preferred time slots">
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="earlyMorning">Early morning (7-9am)</Checkbox>
              <Checkbox value="morning">Morning (9-12pm)</Checkbox>
              <Checkbox value="lunch">Lunch hours (12-2pm)</Checkbox>
              <Checkbox value="afternoon">Afternoon (2-5pm)</Checkbox>
              <Checkbox value="evening">Evening (5-8pm)</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          name="advanceNotice"
          label="How much advance notice do you typically need?"
        >
          <Input placeholder="e.g., 1 week, 2 days, etc." />
        </Form.Item>
      </Card>

      <Card size="small">
        <Title level={5}>4. Budget & Payment</Title>
        <Form.Item
          name="monthlyBudget"
          label="What's your monthly budget for staff grooming services?"
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="under10k">Under Ksh 10,000</Radio>
              <Radio value="10k-25k">Ksh 10,000 - 25,000</Radio>
              <Radio value="25k-50k">Ksh 25,000 - 50,000</Radio>
              <Radio value="50k-100k">Ksh 50,000 - 100,000</Radio>
              <Radio value="above100k">Above Ksh 100,000</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="paymentMethod" label="Preferred payment method">
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="monthly">Monthly invoice</Radio>
              <Radio value="perService">Per service</Radio>
              <Radio value="quarterly">Quarterly payment</Radio>
              <Radio value="annual">Annual package</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="paymentAuthorizer" label="Who authorizes payments?">
          <Input placeholder="Name and title of person who authorizes payments" />
        </Form.Item>
      </Card>
    </div>
  );

  const renderServiceProposal = () => (
    <div>
      <Title level={4}>
        <FileTextOutlined /> Service Proposal Development
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item name="recommendedPackage" label="Package Recommendation">
            <Select placeholder="Select recommended package">
              <Option value="basic">Basic Corporate Package</Option>
              <Option value="premium">Premium Executive Package</Option>
              <Option value="eventBased">Event-Based Services</Option>
              <Option value="customized">Customized Package</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="proposedFrequency" label="Proposed Frequency">
            <Select placeholder="Select service frequency">
              <Option value="weekly">Weekly</Option>
              <Option value="biweekly">Bi-weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
              <Option value="asNeeded">As Needed</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="proposedServices" label="Proposed Services">
            <TextArea
              rows={3}
              placeholder="Detail the specific services to be provided..."
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="serviceDuration" label="Service Duration">
            <Input placeholder="e.g., 2 hours per session" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="serviceLocation" label="Service Location">
            <Select placeholder="Select service location">
              <Option value="salon">At Salon</Option>
              <Option value="client">At Client Location</Option>
              <Option value="both">Both Options Available</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="proposedPricing" label="Proposed Pricing">
            <TextArea rows={2} placeholder="Detail pricing structure..." />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderFollowUp = () => (
    <div>
      <Title level={4}>
        <CheckCircleOutlined /> Post-Meeting Follow-up & Contract
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>Immediate Actions (Same Day)</Title>
        <Form.Item name="immediateActions" valuePropName="checked">
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Checkbox value="thankYouSent">Thank you message sent</Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="notesDocumented">
                  Meeting notes documented
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="proposalPrepared">
                  Service proposal prepared
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="quoteCalculated">
                  Pricing quote calculated
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="followUpScheduled">
                  Follow-up meeting scheduled
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>Proposal Submission (Within 48 Hours)</Title>
        <Form.Item name="proposalSubmission" valuePropName="checked">
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Checkbox value="formalProposal">
                  Formal proposal document prepared
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="pricingBreakdown">
                  Pricing breakdown included
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="termsOutlined">
                  Terms and conditions outlined
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="contractDraft">
                  Contract draft prepared
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="proposalSubmitted">
                  Proposal submitted to client
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Form.Item
            name="proposalSubmissionDate"
            label="Proposal Submission Date"
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="followUpDay3" label="Day 3 Follow-up">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="followUpDay7" label="Day 7 Follow-up">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="contractStatus" label="Contract Status">
        <Select placeholder="Select contract status">
          <Option value="draft">Draft</Option>
          <Option value="submitted">Submitted</Option>
          <Option value="underReview">Under Review</Option>
          <Option value="signed">Signed</Option>
          <Option value="declined">Declined</Option>
        </Select>
      </Form.Item>
    </div>
  );

  const renderFeedback = () => (
    <div>
      <Title level={4}>
        <StarOutlined /> Feedback & Review
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>Client Satisfaction Survey</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="satisfactionRating"
              label="How satisfied are you with our services? (1-10)"
            >
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="wouldRecommend"
              label="Would you recommend us to other businesses?"
            >
              <Radio.Group>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="mostLiked"
              label="What do you like most about our services?"
            >
              <TextArea
                rows={3}
                placeholder="Please share what you appreciate most..."
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="improvementAreas"
              label="What areas need improvement?"
            >
              <TextArea
                rows={3}
                placeholder="Please share areas where we can improve..."
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="additionalComments" label="Additional comments">
              <TextArea
                rows={3}
                placeholder="Any additional feedback or comments..."
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card size="small">
        <Title level={5}>Internal Review</Title>
        <Form.Item name="internalReview" valuePropName="checked">
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Checkbox value="serviceQuality">
                  Service delivery quality assessed
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="staffPerformance">
                  Staff performance reviewed
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="feedbackAnalyzed">
                  Client feedback analyzed
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="improvementsIdentified">
                  Process improvements identified
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="trainingNeeds">
                  Training needs identified
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Form.Item
            name="assignedStaffMember"
            label="Assigned Staff Member"
            tooltip="Select the staff member responsible for managing this client relationship"
          >
            <Select
              placeholder="Select staff member"
              loading={loadingStaff}
              showSearch
              allowClear
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: "100%" }}
            >
              {staff.map((member) => (
                <Option
                  key={member._id || member.id}
                  value={member._id || member.id}
                >
                  {member.name} - {member.position}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="completionDate" label="Date Completed">
            <DatePicker style={{ width: "100%" }} defaultValue={dayjs()} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="meetingNotes" label="Meeting Notes">
            <TextArea
              rows={4}
              placeholder="Document important meeting notes and observations..."
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="nextSteps" label="Next Steps">
            <TextArea
              rows={3}
              placeholder="Document next steps and action items..."
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case "businessInfo":
        return renderBusinessInfo();
      case "preOnboarding":
        return renderPreOnboarding();
      case "needsAssessment":
        return renderNeedsAssessment();
      case "serviceProposal":
        return renderServiceProposal();
      case "followUp":
        return renderFollowUp();
      case "feedback":
        return renderFeedback();
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2}>
            {editMode === "stage"
              ? `Update ${
                  steps.find((s) => s.content === selectedStage)?.title ||
                  "Stage"
                }`
              : "Business Onboarding Checklist"}
          </Title>
          <Title level={3} type="secondary">
            {editMode === "stage"
              ? `Updating specific stage for ${
                  initialData?.companyName || "client"
                }`
              : "Business Client Onboarding Checklist & Questionnaire"}
          </Title>
          {editMode !== "stage" && (
            <Progress
              percent={calculateProgress()}
              status="active"
              strokeColor={{
                "0%": "#c28992",
                "100%": "#87d068",
              }}
            />
          )}
        </div>

        <Steps current={currentStep} style={{ marginBottom: "32px" }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              icon={step.icon}
              status={
                editMode === "stage"
                  ? index === currentStep
                    ? "process"
                    : "wait"
                  : index < currentStep
                  ? "finish"
                  : index === currentStep
                  ? "process"
                  : "wait"
              }
            />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          initialValues={formData[steps[currentStep].content]}
        >
          {renderStepContent()}
        </Form>

        <Divider />

        <div style={{ textAlign: "center" }}>
          <Space>
            {editMode === "stage" ? (
              // Stage-specific editing: only show update button
              <Button
                type="primary"
                onClick={handleNext}
                loading={loading}
                style={{
                  backgroundColor: "#c28992",
                  borderColor: "#c28992",
                }}
              >
                Update Stage
              </Button>
            ) : (
              // Full editing: show normal navigation
              <>
                {currentStep > 0 && (
                  <Button onClick={handlePrev}>Previous</Button>
                )}
                <Button
                  type="primary"
                  onClick={handleNext}
                  loading={loading}
                  style={{
                    backgroundColor: "#c28992",
                    borderColor: "#c28992",
                  }}
                >
                  {currentStep === steps.length - 1
                    ? "Complete Onboarding"
                    : "Next"}
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default BusinessOnboardingChecklist;
