import { Button, Drawer, Form, Input, message, Select, Space, Spin } from 'antd';
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

function EditMachine({ machineId, onClose }) {
    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const machineCategories = { Cutting, Drilling, Milling, Grinding, Turning }; // Add all your machine categories

    const getMachinesByMachineId = async () => {
        setLoading(true);
        const resp = await axios.get(GET_MACHINES_BY_MACHONE_ID, {
            params: {
                machineId: machineId
            }
        });
        // console.log("getMachinesByMachineId: ", resp.data);
        var machineData = resp.data.results[0];
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