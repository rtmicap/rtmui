import React, { useState, useEffect } from 'react';
import { Col, Row, Select, Form, Input, Upload, Button, Space, message, Image, Modal, Checkbox } from 'antd'
import HeaderTitle from '../../utils/HeaderTitle';
import { machineFields } from '../Machine Variable Fields/MachineFiellds';
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

import query from "india-pincode-search";
import SummaryPage from './SummaryPage';
import { generateId } from "../../utils/GenerateRandomId";

import { useAuth } from "../../contexts/AuthContext";
const { TextArea } = Input;
import config from "../../env.json";
import axios from 'axios';

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


function RegistrationMachines() {
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

    // console.log("machineInputsyo: ", machineInputs["Machining"]);

    const machineFieldsFromApi = async () => {
        try {
            const data = await getMachinesByCatAndType();
            // console.log("machineFieldsFromApi: ", data);
            setMachineFieldsApi(data);
            const keys = Object.keys(data);
            setOptionsCategory(keys.sort());
            // console.log("setOptionsCategory fields:", keys);

        } catch (error) {
            // console.log("error fields:", error);
        }
    }
    useEffect(() => {
        machineFieldsFromApi();
    }, [])

    const handleMachineCategory = async (e) => {
        // console.log("handleMachineCategory: ", e);
        if (e) {
            setType('');
        }
        setCategory(e);
        // console.log("machineInputs: ", e);
        const inputVal = e == "Plastics Moulding Machines" ? "Plastics" : e == "Machining Centers" ? "Machining" : e;
        // console.log("inputVal: ", inputVal);
        const values = Object.keys(machineInputs[inputVal]);
        if (values) {
            // console.log("inputVa valuesl: ", values);
            setOptionsTypeMachine(values.sort());
        }
    }

    const onChangeTypeMachine = async (value) => {
        // console.log(`selected ${value}`);
        // const setValue = value == "BlowMouldingMachine" ? "BlowMoulding" : value == "InjectionMoulding" ? "InjectionMoulding" : value;
        const setValue = value == "BlowMouldingMachine" ? "BlowMouldingMachine" : value == "InjectionMoulding" ? "InjectionMoulding" : value;
        // console.log(`setValue ${setValue}`);
        setType(setValue);
        // console.log("final: ", machineInputs[category][setValue]);
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
        }
        return isImage;
    };

    const handlePreview = async (file) => {
        // console.log("handlePreview: ", file);
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        // console.log("handlePreview2: ", file);
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
                // const baseUrl = `${config.localEndpoint}/api/machines/uploadMachineImage`;
                const baseUrl = `${config.localEndpoint}/api/uploadfile/uploadToB2`;
                const formData = new FormData();
                formData.append("fileName", newFileList[0].originFileObj);
                var response = await axios.post(baseUrl, formData, configHeaders);
                // console.log("responseData: ", response);
                setImageBase64(response.data.fileUrl)
            }
            setFileList(newFileList);

        } catch (error) {
            // console.log("responseData error: ", error);
            message.error(`Error while uploading the Image ${error.message}`);
        }


    }


    const handleCancel = () => setPreviewOpen(false);




    const handleToSummary = () => {
        form.validateFields.then((values) => {
            // console.log("handleToSummary: ", values);
        })
    }

    const resetForm = () => {
        form.resetFields();
        setType('');
        setCategory('');
        setOpenIdenticalCheck(false);
    }

    const onFinish = async (values) => {
        // Handle form submission here
        // console.log('Received values:', values);
        // console.log('authUser authUser:', authUser);
        const formDataToSubmit = new FormData();
        values.machineId = generateId();
        values.companyId = authUser.CompanyId;
        //values.variable_fields = "test";
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

        // console.log('formDataObject values:', formDataObject);



        var existingFormDataArray = JSON.parse(localStorage.getItem('machines')) || [];

        // Add the new form data to the array
        existingFormDataArray.push(formDataObject);
        // console.log("existingFormDataArray: ", existingFormDataArray);
        localStorage.setItem('machines', JSON.stringify(existingFormDataArray));
        if (existingFormDataArray && existingFormDataArray.length > 0) {
            setOpenSummary(true);
            message.success("Woah! Your data has been submitted.")
        }

    };

    const onFinishFailed = (errorInfo) => {
        // console.log('Failed:', errorInfo);
        // console.log('Form submission failed:', errorInfo);
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

    const handleInputChange = (e) => {
        // console.log("e.target: ", e);

        if (e.target.id == "noOfMachines") {
            if (e.target.value > 1) {
                setOpenIdenticalCheck(true);
            } else {
                setOpenIdenticalCheck(false);
            }
        }
    }

    const handleCheckboxChange = (e) => {
        // console.log("e.target: ", e.target);
        setIsChecked(e.target.checked);
    };

    if (openSummary) {
        return (
            <SummaryPage openSummary={openSummary} setOpenSummary={setOpenSummary} resetForm={resetForm} />
        )
    }

    function formatString(input) {
        // Replace occurrences of '([a-z])([A-Z])' with '$1 $2'
        // Ex: BandSaw -> Band Saw or ConventionalLathe -> Conventional Lathe
        return input.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    const machining = () => {
        if (category == "Plastics" && type == "InjectionMoulding") {
            return (
                <>
                    {machineInputs[Plastics][InjectionMoulding].map((field) => (
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item key={field.name} label={field.label} name={field.name} rules={[
                                    { required: true, message: `Please input ${field.label}` },
                                    { pattern: field.pattern, message: `Please provide a valid ${field.label}` }
                                ]}>
                                    {field.type === 'select' ? (
                                        <>
                                            <Select name={field.name} placeholder={field.placeholder}>
                                                {field.options.map((option) => (
                                                    <Select.Option key={option} value={option}>{option}</Select.Option>
                                                ))}
                                            </Select>
                                        </>

                                    ) : (
                                        <>

                                            <Input name={field.name} placeholder={field.placeholder} onChange={handleInputChange} maxLength={field.maxLength} />
                                        </>
                                    )}

                                </Form.Item>
                            </Col>
                        </Row>
                    ))}
                </>
            )
        }
    }


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
                        <Form.Item name={"machineType"} label="Machine Type" rules={[
                            { required: true, message: 'Please choose the machine type' }]}>
                            <Select
                                placeholder="Please choose the machine type"
                                onChange={onChangeTypeMachine}
                            >
                                {optionsTypeMachine.map((item, index) => (
                                    <Select.Option key={index} value={item}>{formatString(item)}</Select.Option>
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
                                    <Form.Item key={field.name} label={field.label} name={field.name} rules={[
                                        { required: true, message: `Please input ${field.label}` },
                                        { pattern: field.pattern, message: `Please provide a valid ${field.label}` }
                                    ]}>
                                        {field.type === 'select' ? (
                                            <>
                                                <Select name={field.name} placeholder={field.placeholder}>
                                                    {field.options.map((option) => (
                                                        <Select.Option key={option} value={option}>{option}</Select.Option>
                                                    ))}
                                                </Select>
                                            </>

                                        ) : (
                                            <>

                                                <Input name={field.name} placeholder={field.placeholder} onChange={handleInputChange} maxLength={field.maxLength} />
                                            </>
                                        )}

                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}

                        {machining}

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
                        {category && type &&
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Form.Item label={'Comments (optional)'} name={'comments'} rules={[{ message: `Please input the comments` }]}>
                                        <TextArea rows={4} placeholder="Enter Comments (Max 100 words)" maxLength={100} showCount allowClear />
                                    </Form.Item>
                                </Col>
                            </Row>
                        }



                    </Col>
                    {category && type &&
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

export default RegistrationMachines