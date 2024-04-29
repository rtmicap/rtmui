import React, { useState, useEffect } from 'react';
import { Col, Row, Select, Form, Input, Upload, Button, Space, message, Image, Modal, Checkbox } from 'antd'
import HeaderTitle from '../../utils/HeaderTitle';
import { machineFields } from '../Machine Variable Fields/MachineFiellds';
import { getMachinesByCatAndType, registerMachine } from '../Api/apiServices';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

import query from "india-pincode-search";
import SummaryPage from './SummaryPage';
import { generateId } from "../../utils/GenerateRandomId";

import { useAuth } from "../../contexts/AuthContext";
const { TextArea } = Input;
import config from "../../env.json";
import axios from 'axios';
import { Cutting } from '../Machine Variable Fields/Cutting';
import { Turning } from '../Machine Variable Fields/Turning';
import { MachiningCenters } from '../Machine Variable Fields/MachiningCenters';
import { PlasticsMoulding } from '../Machine Variable Fields/PlasticsMoulding';
import { Drilling } from '../Machine Variable Fields/Drilling';
import { Grinding } from '../Machine Variable Fields/Grinding';
import { Milling } from '../Machine Variable Fields/Milling';
const getBase64 = (img) => {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    // reader.addEventListener('load', () => callback(reader.result));
    reader.onload = (e) => {
        // const url = URL.createObjectURL(base64toBlob(e.target.result));
        return e.target.result;
        // callback(e.target.result);
        // message.success("PAN Pdf file uploaded");
    }
};


function RegisterMachines() {
    const { authUser } = useAuth();
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
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);
    // identical check
    const [openIdenticalCheck, setOpenIdenticalCheck] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    // summary Page
    const [openSummary, setOpenSummary] = useState(false);
    // others input field during select option
    const [selectedType, setSelectedType] = useState('');
    //input fields bind
    const [machineInputFields, setMachineInputFields] = useState([]);
    //others select
    const [selectedOption, setSelectedOption] = useState('');
    const [othersInput, setOthersInput] = useState(false);


    const resetForm = () => {
        form.resetFields();
        setType('');
        setCategory('');
        setOpenIdenticalCheck(false);
        setMachineInputFields([]);
    }

    const machineFieldsFromApi = async () => {
        try {
            const data = await getMachinesByCatAndType();
            // console.log("machineFieldsFromApi: ", data);
            setMachineFieldsApi(data);
            const keys = Object.keys(data);
            setOptionsCategory(keys.sort());
            // console.log("setOptionsCategory fields:", keys);

        } catch (error) {
            console.log("error fields:", error);
        }
    }
    useEffect(() => {
        machineFieldsFromApi();
    }, [])

    const handleMachineCategory = async (e) => {
        console.log("handleMachineCategory: ", e);
        setType('');
        setCategory(e);
        // console.log("machineInputs: ", machineFieldsApi)
        const values = Object.values(machineFieldsApi[e]);
        // console.log("values: ", values)
        if (values) {
            setOptionsTypeMachine(values.sort());
        }
    }

    const formatPascalCase = (input) => {
        //Vertical Machining Centers to VerticalMachiningCenters
        const res = input.replace(/\b(\w)(\w*)/g, function(match, firstChar, restChars) {
            return firstChar.toUpperCase() + restChars;
        }).replace(/\s+/g, '');

        return res;
    }


    const onChangeTypeMachine = async (value) => {
        console.log(`selected ${value}`);
        // const setValue = value == "BlowMouldingMachine" ? "BlowMoulding" : value == "InjectionMoulding" ? "InjectionMoulding" : value;
        setType(value);
        // console.log("category: ", category);
        if (category == "Cutting") {
            const cutting = Cutting[formatPascalCase(value)];
            console.log("cutting fields: ", cutting);
            setMachineInputFields(cutting);
        } else if (category == "Turning") {
            const turning = Turning[formatPascalCase(value)];
            setMachineInputFields(turning);
        } else if (category == "Machining Centers") {
            const machining = MachiningCenters[formatPascalCase(value)]
            setMachineInputFields(machining);
        } else if (category == "Plastics Moulding Machines") {
            const plastics = PlasticsMoulding[formatPascalCase(value)]
            setMachineInputFields(plastics);
        } else if (category == "Drilling") {
            const drilling = Drilling[formatPascalCase(value)]
            setMachineInputFields(drilling);
        } else if (category == "Grinding") {
            const grinding = Grinding[formatPascalCase(value)]
            setMachineInputFields(grinding);
        } else if (category == "Milling") {
            const milling = Milling[formatPascalCase(value)]
            setMachineInputFields(milling);
        }
        else {
            setCategory('');
            setType('');
            setMachineInputFields([]);
        }
    };


    function formatString(input) {
        // Replace occurrences of '([a-z])([A-Z])' with '$1 $2'
        // Ex: BandSaw -> Band Saw or ConventionalLathe -> Conventional Lathe
        return input.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    const handleInputChange = (e) => {
        console.log("e.target: ", e);

        if (e.target.id == "noOfMachines") {
            if (e.target.value > 1) {
                setOpenIdenticalCheck(true);
            } else {
                setOpenIdenticalCheck(false);
            }
        }
    }

    const handleSelectChange = (value) => {
        console.log("handleSelectCHange: ", value);
        setSelectedOption(value);
    }

    const handleCheckboxChange = (e) => {
        console.log("e.target: ", e.target);
        setIsChecked(e.target.checked);
    };

    const handlePreview = async (file) => {
        // console.log("handlePreview: ", file);
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        console.log("handlePreview2: ", file);
        setPreviewImage(file.thumbUrl || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name);
    };

    const handleImageChange = async ({ fileList: newFileList }) => {
        // console.log("newFileList: ", newFileList[0]);
        // console.log("newFileList: ", newFileList[0].uid);
        try {
            if (newFileList && newFileList.length > 0) {
                const configHeaders = {
                    headers: { "content-type": "multipart/form-data" },
                };
                // const baseUrl = `${config.rtmWsEndpoint}/api/machines/uploadMachineImage`;
                const baseUrl = `${config.rtmWsEndpoint}/api/uploadfile/uploadToB2`;
                const formData = new FormData();
                formData.append("fileName", newFileList[0].originFileObj);
                var response = await axios.post(baseUrl, formData, configHeaders);
                console.log("responseData: ", response);
                setImageBase64(response.data.fileUrl)
            }
            setFileList(newFileList);

        } catch (error) {
            console.log("responseData error: ", error);
            message.error(`Error while uploading the Image ${error.message}`);
        }


    };

    const onFinish = async (values) => {
        // Handle form submission here
        console.log('Received values:', values);
        console.log('authUser authUser:', authUser);
        const formDataToSubmit = new FormData();
        values.machineId = generateId();
        values.companyId = authUser.CompanyId;
        values.variable_fields = "test";
        values.Machine_Photo = imageBase64;
        values.identical = isChecked;

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
        console.log("existingFormDataArray: ", existingFormDataArray);
        localStorage.setItem('machines', JSON.stringify(existingFormDataArray));
        if (existingFormDataArray && existingFormDataArray.length > 0) {
            setOpenSummary(true);
            message.success("Wooh! Your data has been submitted.")
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        console.log('Form submission failed:', errorInfo);
        // Extract error messages from errorInfo and display them
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </button>
    );
    const handleCancel = () => setPreviewOpen(false);

    if (openSummary) {
        return (
            <SummaryPage openSummary={openSummary} setOpenSummary={setOpenSummary} resetForm={resetForm} />
        )
    }
    return (
        <>
            <HeaderTitle title={'Register Machine'} />
            <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Form.Item name={"category"} label="Machine Category" rules={[
                            { required: true, message: 'Please choose the machine category' }]}>
                            <Select
                                placeholder="Please choose the machine category"
                                onChange={handleMachineCategory}
                                value={category}
                            >
                                {optionsCategory.map((item, index) => (
                                    <Select.Option key={index} value={item}>{item}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Form.Item name={"machineType"} label="Machine Type" rules={[
                            { required: true, message: 'Please choose the machine type' }]}>
                            <Select
                                placeholder="Please choose the machine type"
                                onChange={onChangeTypeMachine}
                                value={type}
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
                        {/* Machines Fields goes here */}
                        {machineInputFields && machineInputFields.length > 0 && machineInputFields.map((field) => (
                            <Row gutter={[16, 16]} key={field.label}>
                                <Col span={24}>

                                    {field.type === 'select' ? (
                                        <>
                                            <Form.Item label={field.label} name={field.name} rules={[
                                                { required: true, message: `Please input ${field.label}` },
                                                { pattern: field.pattern, message: `Please provide a valid ${field.label}` }
                                            ]}>
                                                <Select placeholder={field.placeholder} onChange={handleSelectChange} options={field.options} />
                                            </Form.Item>
                                            {selectedOption === 'Others' && (
                                                <Form.Item name={field.name + ' ' + 'Others'} label={field.label + ' ' + 'Others'} rules={[{ required: true, message: 'Please specify others name!' }]}>
                                                    <Input
                                                        // name={field.name}
                                                        placeholder="Please specify"
                                                        onChange={handleInputChange}
                                                        maxLength={20}
                                                    />
                                                </Form.Item>
                                            )}
                                        </>

                                    ) : (
                                        <>
                                            <Form.Item label={field.label} name={field.name} rules={[
                                                { required: true, message: `Please input ${field.label}` },
                                                { pattern: field.pattern, message: `Please provide a valid ${field.label}` }
                                            ]}>
                                                <Input placeholder={field.placeholder} onChange={handleInputChange} maxLength={field.maxLength} />
                                            </Form.Item>
                                        </>
                                    )}
                                </Col>
                            </Row>
                        ))}

                        {/* If no.of machine is more than 1 */}
                        {openIdenticalCheck ?
                            <>
                                <Form.Item name={'identical'} valuePropName='checked' rules={[{ required: true, message: `Please check the box for identical or not` }]}>
                                    <Checkbox.Group>
                                        <Checkbox onChange={handleCheckboxChange} checked={isChecked} style={{ color: '#1890ff' }}>
                                            <span>
                                                You have entered <strong>More than One Machine</strong>.<br />
                                                <ul>
                                                    <li>Confirm <strong>Yes</strong> if the machine specifications are <strong>Identical</strong>.</li>
                                                    <li>If <strong>Not Identical</strong> Please enter the right Number of Machines field and Click <strong>Save & Add</strong> to add more machines.</li>
                                                </ul>
                                            </span>
                                        </Checkbox>
                                    </Checkbox.Group>
                                </Form.Item>
                            </>
                            : ""
                        }

                        {/* Comments */}
                        {category && type && machineInputFields && machineInputFields.length > 0 &&
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Form.Item label={'Comments (optional)'} name={'comments'} rules={[{ message: `Please input the comments` }]}>
                                        <TextArea rows={4} placeholder="Enter Comments (Max 100 words)" maxLength={100} showCount allowClear />
                                    </Form.Item>
                                </Col>
                            </Row>
                        }
                    </Col>
                    {category && type && machineInputFields && machineInputFields.length > 0 &&
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                label="Upload Your Machine Image"
                                name="Machine_Photo"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => e && e.fileList}
                                rules={[{ required: true, message: 'Please upload your photo!' }]}
                            >
                                <Upload
                                    // action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleImageChange}
                                    beforeUpload={() => false}
                                    accept=".png,.jpeg,.jpg"
                                >
                                    {fileList.length >= 8 ? null : uploadButton}
                                </Upload>

                            </Form.Item>
                        </Col>
                    }
                    {/* Preview machine Image */}
                    <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                        <img
                            alt="example"
                            style={{
                                width: '100%',
                            }}
                            src={previewImage}
                        />
                    </Modal>
                </Row>
                {/* Submit Button */}
                <Row gutter={[16, 16]}>
                    {category && type && machineInputFields && machineInputFields.length > 0 &&
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Button type="primary" htmlType='submit'>Proceed to Submit</Button>
                        </Col>
                    }
                </Row>
            </Form >
        </>
    )
}

export default RegisterMachines