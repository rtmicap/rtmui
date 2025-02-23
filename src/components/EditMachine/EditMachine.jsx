import { Button, Col, Drawer, Form, Input, message, Row, Select, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GET_MACHINES_BY_MACHONE_ID } from '../../api/apiUrls';
import axios from '../../api/axios';
import { Cutting } from '../Machine Variable Fields/Cutting';
import { Drilling } from '../Machine Variable Fields/Drilling';
import { Milling } from '../Machine Variable Fields/Milling';
import { Grinding } from '../Machine Variable Fields/Grinding';
import { Turning } from '../Machine Variable Fields/Turning';
import { LoadingOutlined } from '@ant-design/icons';
const { TextArea } = Input;

function EditMachine({ machineId, onClose }) {
    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [singleMachineData, setSingleMachineData] = useState({});
    const machineCategories = { Cutting, Drilling, Milling, Grinding, Turning }; // Add all your machine categories

    var CuttingMock = {
        "id": 5111,
        "Category": "Cutting",
        "Machine_Type": "Band Saw",
        "Brand": "PATHAK",
        "Model": "ghn",
        "Year_of_Purchase": 1993,
        "Machine_Hour_Rate": 70.00,
        "Machine_Name": "1029-Band Saw-713",
        "Comments": "undefined",
        "Identical": 0,
        "Machine_Photo": "rc-upload-1712586069055-56",
        "Variable_fields": JSON.parse("{\"type\": \"Manual\", \"machineId\": \"BF4C4D\", \"machineHourRate\": \"70\", \"variable_fields\": \"test\", \"max_square_in_mm\": \"75\", \"cutting_speed_in_mmin\": \"20\", \"cutter_motor_power_in_kw\": \"4\", \"max_diameter_round_in_mm\": \"100\", \"max_cut_feed_length_in_mm\": \"3\"}"),
        "Score": 10,
        "createdAt": "2024-04-08 16:37:37",
        "updatedAt": "2024-04-08 16:37:37",
        "CompanyId": 1029,
        "Group_Id": 7

    }

    const getMachinesByMachineId = async () => {
        setLoading(true);
        const resp = await axios.get(GET_MACHINES_BY_MACHONE_ID, {
            params: {
                machineId: machineId
            }
        });
        // console.log("getMachinesByMachineId: ", resp.data);
        var machineData = resp.data.results[0];
        setSingleMachineData(machineData);
        setLoading(false);
        if (machineData) {
            console.log("machineData: ", machineData);
            const machineTypeKey = machineData.Machine_Type.replace(/\s/g, "");
            // Get the correct category object dynamically
            const selectedCategory = machineCategories[machineData.Category];
            // Extract the selected fields if the category exists
            const selectedFields = selectedCategory ? selectedCategory[machineTypeKey] || [] : [];
            console.log("selectedFields: ", selectedFields);
            setFields(selectedFields);
            let variableFields = {};
            try {
                variableFields = machineData.Variable_fields || "{}";
            } catch (error) {
                console.error("Error parsing variable fields", error);
            }
            const initialValues = selectedFields.reduce((acc, field) => {
                acc[field.name] =
                    machineData[field.label.replace(/\s/g, "_")] || variableFields[field.name] || "";
                return acc;
            }, {});

            form.setFieldsValue(initialValues);
        } else {
            setLoading(false);
            message.warning("No Machine Found!");
        }
    }

    useEffect(() => {
        getMachinesByMachineId();
    }, []);

    const handleSubmit = (values) => {
        console.log("updated form Values:", values);
        // onClose();
        console.log("singleMachineData:", singleMachineData);
        const commonFields = {
            id: machineId,
            Category: singleMachineData.Category,
            Machine_Type: singleMachineData.Machine_Type,
            Brand: values.brand,
            Model: values.model,
            Year_of_Purchase: values.yearOfPurchase,
            Machine_Hour_Rate: values.machineHourRate,
            Machine_Name: singleMachineData.Machine_Name,
            Comments: values.Comments,
            Identical: values.Identical,
            Machine_Photo: values.Machine_Photo,
            Score: singleMachineData.Score,
            CompanyId: singleMachineData.CompanyId,
            Group_Id: singleMachineData.Group_Id,
            noOfMachines: values.noOfMachines,
        };

        // Get the category
        const selectedCategory = machineCategories[singleMachineData.Category];

        // Normalize Machine Type key
        const machineTypeKey = singleMachineData.Machine_Type.replace(/\s/g, "");

        // Extract category-specific fields
        const categorySpecificFields = selectedCategory ? selectedCategory[machineTypeKey] || {} : {};

        // Merge user-entered values and predefined fields
        const variableFields = { ...categorySpecificFields, ...values.Variable_fields };

        // Convert variable fields to JSON string
        const formattedData = {
            ...commonFields,
            Variable_fields: JSON.stringify(variableFields),
        };

        console.log("Formatted Data:", formattedData);
    };

    const contentStyle = {
        padding: 50,
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
    };
    const content = <div style={contentStyle} />;

    return (
        <>
            <div className="container">
                <Drawer
                    title={`Edit Machine ID: ${machineId}`}
                    placement={'right'}
                    width={600}
                    onClose={onClose}
                    destroyOnClose
                    open={!!machineId}
                    loading={loading}
                    extra={
                        <Space>
                            <Button onClick={onClose} danger>Cancel</Button>
                            {/* <Button type="primary" onClick={handleSubmit}>
                                Update
                            </Button> */}
                        </Space>
                    }
                >
                    {loading ?
                        <Spin tip="Loading" indicator={<LoadingOutlined spin style={{ textAlign: 'center' }} />} size="large">
                            {content}
                        </Spin> :
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            {fields.map((field) => (
                                <Form.Item
                                    key={field.name}
                                    name={field.name}
                                    label={field.label}
                                    rules={[{ required: true, message: `Please enter ${field.label}` }]}
                                >
                                    {field.type === "text" || field.type === "number" ? (
                                        <Input placeholder={field.placeholder} maxLength={field.maxLength} />
                                    ) : field.type === "select" ? (
                                        <Select placeholder={field.placeholder}>
                                            {field.options.map((option) => (
                                                <Select.Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    ) : null}
                                </Form.Item>
                            ))}
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Form.Item label={'Comments (optional)'} name={'comments'} rules={[{ message: `Please input the comments` }]}>
                                        <TextArea rows={4} placeholder="Enter Comments (Max 100 words)" maxLength={100} showCount allowClear />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {!loading &&
                                <Button type="primary" htmlType="submit">
                                    Update
                                </Button>
                            }
                        </Form>
                    }
                </Drawer>
            </div>
        </>
    )
}

export default EditMachine