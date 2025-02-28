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
import { LoadingOutlined, LeftCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;

function EditMachine({ machineId, onClose }) {
    const location = useLocation();

    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [singleMachineData, setSingleMachineData] = useState({});
    const machineCategories = { Cutting, Drilling, Milling, Grinding, Turning }; // Add all your machine categories

    const { machineData } = location.state || {};

    const getMachinesByMachineId = async () => {
        setSingleMachineData(machineData);
        setLoading(false);
        if (machineData) {
            console.log("machineData: ", machineData);
            const machineTypeKey = machineData.Machine_Type.replace(/\s/g, "");
            // Get the correct category object dynamically
            const selectedCategory = machineCategories[machineData.Category];
            // Extract the selected fields if the category exists
            const selectedFields = selectedCategory ? selectedCategory[machineTypeKey] || [] : [];
            const filteredFields = selectedFields.filter(field => field.name !== "noOfMachines");
            console.log("selectedFields: ", selectedFields);
            console.log("filteredFields: ", filteredFields);
            setFields(filteredFields);
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
            id: singleMachineData.id,
            Category: singleMachineData.Category,
            Machine_Type: singleMachineData.Machine_Type,
            Brand: values.brand,
            Model: values.model,
            Year_of_Purchase: values.yearOfPurchase,
            Machine_Hour_Rate: values.machineHourRate,
            Machine_Name: singleMachineData.Machine_Name,
            Comments: values.Comments,
            Machine_Photo: values.Machine_Photo,
            CompanyId: singleMachineData.CompanyId,
            type: values.type,
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
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h3 className='text-center'>Edit Machine ID: {machineData.id}</h3>
                <hr />
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

                        {/* <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {machineData.Machine_Photo?.toLowerCase().endsWith('.pdf') ? (
                                        <a href={machineData.Machine_Photo} target="_blank" rel="noopener noreferrer">
                                            <img
                                                alt="PDF file"
                                                src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" // A PDF icon
                                                style={{ width: '40px', height: 'auto', objectFit: 'contain' }}
                                            />
                                        </a>
                                    ) : (
                                        <img
                                            alt="machine image"
                                            src={machineData.Machine_Photo}
                                            style={{ width: '200px', height: 'auto', objectFit: 'cover', borderRadius: '5px' }}
                                        />
                                    )}
                                </div>
                            </Col>
                        </Row> */}
                        {!loading &&
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>
                        }
                    </Form>
                }
            </div>
        </>
    )
}

export default EditMachine