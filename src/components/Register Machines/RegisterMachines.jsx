import React, { useState, useEffect } from 'react';
import { Col, Row, Select, Form, Input, Upload, Button, Space, message, Image } from 'antd'
import HeaderTitle from '../../utils/HeaderTitle';
import { machineFields } from '../Machine Variable Fields/MachineFiellds';
import { getMachinesByCatAndType, registerMachine } from '../Api/apiServices';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

import query from "india-pincode-search"

function RegisterMachines() {
    const [form] = Form.useForm();
    const machineInputs = machineFields;
    const [machineFieldsApi, setMachineFieldsApi] = useState([]);
    // select Fields
    const [optionsCategory, setOptionsCategory] = useState([]);
    const [optionsTypeMachine, setOptionsTypeMachine] = useState([]);
    // test 
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    // image 
    const [imageList, setImageList] = useState([]);

    console.log("machineInputs: ", machineInputs);

    const machineFieldsFromApi = async () => {
        try {
            const data = await getMachinesByCatAndType();
            console.log("machineFieldsFromApi: ", data);
            setMachineFieldsApi(data);
            const keys = Object.keys(data);
            setOptionsCategory(keys);
            console.log("setOptionsCategory fields:", keys);

        } catch (error) {
            console.log("error fields:", error);
        }
    }
    useEffect(() => {
        machineFieldsFromApi();
        // const test = query.search('600032');
        // console.log("test pin code: ", test);
    }, [])


    const onChange = (value) => {
        console.log(`selected ${value}`);
        setType(value);
    };

    const handleMachineCategory = async (e) => {
        // console.log("handleMachineCategory: ", e);
        setCategory(e);
        const values = Object.keys(machineInputs[e]);
        console.log("handleMachineCategory values: ", values);
        setOptionsTypeMachine(values);
    }

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng;
    };

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };


    const handleChange = info => {
        let fileList = [...info.fileList];

        // Limit to max 3 images
        fileList = fileList.slice(-1);

        // Display a message if trying to upload more than 3 images
        if (fileList.length > 1) {
            message.error('You can only upload up to 1 images.');
            return;
        }
        // Update state
        setImageList(fileList);
    };

    const handleRemove = file => {
        const index = imageList.indexOf(file);
        const newFileList = [...imageList];
        newFileList.splice(index, 1);
        setImageList(newFileList);
    };

    const handleToSummary = () => {
        form.validateFields.then((values) => {
            console.log("handleToSummary: ", values);
        })
    }

    const onFinish = async (values) => {
        // Handle form submission here
        console.log('Received values:', values);
        const formDataToSubmit = new FormData();
        values.companyId = 1001;
        values.variable_fields = "test";
        values.Machine_Photo = values.machineImage;
        Object.entries(values).forEach(([key, value]) => {
            formDataToSubmit.append(key, value);
        });

        // Convert values to plain object
        const formDataObject = {};
        formDataToSubmit.forEach((value, key) => {
            formDataObject[key] = value;
        });

        console.log('formDataObject values:', formDataObject);



        var existingFormDataArray = JSON.parse(localStorage.getItem('machines')) || [];

        // Add the new form data to the array
        existingFormDataArray.push(formDataObject);
        localStorage.setItem('machines', JSON.stringify(existingFormDataArray));

        // api
        // const configHeaders = {
        //     headers: { "content-type": "application/json" },
        // };

        // var reqItem = {
        //     machines: existingFormDataArray
        // }

        // const response = await registerMachine(reqItem, configHeaders);
        // console.log('API response values:', response);
        // message.success(`${response.message}`)
        // if (response) {
        //     localStorage.removeItem("machines");
        // }
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };


    return (
        <>
            <HeaderTitle title={'Register Machine'} />
            <Form form={form} onFinish={onFinish}
                onFinishFailed={onFinishFailed} layout="vertical">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Form.Item name={"category"} label="Machine Category" rules={[
                            { required: true, message: 'Please choose the machine category' }]}>
                            <Select
                                placeholder="Please choose the machine category"
                                onChange={handleMachineCategory}
                            >
                                {optionsCategory.map((item, index) => (
                                    <Select.Option key={index} value={item}>{item}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Form.Item name="machineType" label="Machine Type" rules={[
                            { required: true, message: 'Please choose the machine type' }]}>
                            <Select
                                placeholder="Please choose the machine type"
                                onChange={onChange}
                            >
                                {optionsTypeMachine.map((item, index) => (
                                    <Select.Option key={index} value={item}>{item}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                    </Col>
                </Row>
                {/* Update Machine Forms Fields here */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        {category && type && machineInputs[category][type].map((field) => (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Form.Item key={field.name} label={field.label} name={field.name} rules={[{ required: true, message: `Please input ${field.label}` }]}>
                                        {field.type === 'select' ? (
                                            <Select name={field.name} placeholder={field.placeholder}>
                                                {field.options.map((option) => (
                                                    <Select.Option key={option} value={option}>{option}</Select.Option>
                                                ))}
                                            </Select>
                                        ) : (
                                            <Input name={field.name} placeholder={field.placeholder} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}
                    </Col>
                    {category && type &&
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={"machineImage"} label="Upload Machine Image" rules={[
                                { required: true, message: 'Please upload the machine image' }]}>
                                <Space direction="vertical">
                                    <Upload
                                        fileList={imageList}
                                        onChange={handleChange}
                                        maxCount={1}
                                        listType="picture-card"
                                        showUploadList={{
                                            showRemoveIcon: true,
                                            showDownloadIcon: false,
                                            showPreviewIcon: true,
                                        }}
                                        onRemove={handleRemove}
                                        // beforeUpload={beforeUpload}
                                        accept=".jpg, .jpeg, .png"
                                    >
                                        {imageList.length < 1 && (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        )}
                                    </Upload>

                                    <div>
                                        {imageList.map(file => (
                                            <>
                                                <div key={file.uid} style={{ display: 'inline-block', marginRight: 10 }}>
                                                    <Image
                                                        src={file.thumbUrl}
                                                        alt={file.name}
                                                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <p>You can remove image and upload again</p>
                                            </>
                                        ))}
                                    </div>
                                </Space>
                            </Form.Item>
                        </Col>
                    }
                </Row>
                {/* Submit Button */}
                <Row gutter={[16, 16]}>
                    {category && type &&
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Button type="primary" htmlType='submit'>Proceed to Submit</Button>
                        </Col>
                    }
                </Row>
            </Form>
        </>
    )
}

export default RegisterMachines