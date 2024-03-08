import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Steps, Button, message, Form, Input, Alert, List, Layout, Row, Col, Select, Divider, Checkbox, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
const { Step } = Steps;
const { Content } = Layout;

import { getAllCitiesByStateCode, getAllStates } from '../Api/apiServices';
import { Document, Page } from 'react-pdf';
import axios from 'axios';

const RegistrationAccount = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [listsOfStates, setListsOfStates] = useState([]);
    const [listsOfCities, setListsOfCities] = useState([]);

    // office 
    const [selectedOfficeState, setSelectedOfficeState] = useState('');
    const [selectedOfficeCity, setSelectedOfficeCity] = useState('');
    const [selectedOfficeLatitude, setSelectedOfficeLatitude] = useState('');
    const [selectedOfficeLongitude, setSelectedOfficeLongitude] = useState('');
    // factory
    const [selectedFactoryState, setSelectedFactoryState] = useState('');
    const [selectedFactoryCity, setSelectedFactoryCity] = useState('');
    const [selectedFactoryLatitude, setSelectedFactoryLatitude] = useState('');
    const [selectedFactoryLongitude, setSelectedFactoryLongitude] = useState('');
    // checkbox
    const [isChecked, setIsChecked] = useState(false);
    // ownership
    const [selectedOwnership, setSelectedOwnership] = useState('');
    // cin file
    const [fileList, setFileList] = useState(null);
    const [fileError, setFileError] = useState('');

    const [formData, setFormData] = useState({});
    const formRefs = useRef(Array.from({ length: 3 }, () => React.createRef())); // Assuming 3 steps

    useEffect(() => {
        getAllStatesFn();
    }, []);

    const handleCheckboxChange = (e) => {
        console.log("e.target: ", e.target);
        setIsChecked(e.target.checked);
    };

    const getAllStatesFn = async () => {
        const StatesData = await getAllStates();
        setListsOfStates(StatesData);
    }

    const data = [
        'PDF file size should not be greater than 2 MB',
    ];

    const infoMessage = () => {
        return (
            <List
                size="small"
                dataSource={data}
                renderItem={(item) => <List.Item>{item}</List.Item>}
            />
        )
    }

    // office State and City
    const onChangeOfficeState = async (value) => {
        setSelectedOfficeState(value);
        setSelectedOfficeCity(''); // Clear the value of selected city when state changes
        const postsData = await getAllCitiesByStateCode({ isoCode: value });
        setListsOfCities(postsData);
    };

    const filterOfficeOption = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)


    const onChangeOfficeCity = (value) => {
        console.log(`selected city ${value}`);
        const filteredLoc = listsOfCities.filter((data) => data.name == value);
        console.log("onChangeOfficeCity: ", filteredLoc);
        setSelectedOfficeLatitude(filteredLoc[0].latitude);
        setSelectedOfficeLongitude(filteredLoc[0].longitude);
        setSelectedOfficeCity(value);
    };

    const filterOfficeOptionCity = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)

    // end of office state and city

    const onChangeFactoryState = async (value) => {
        console.log("onChangeFactoryState: ", value);
        setSelectedFactoryState(value);
        setSelectedFactoryCity(''); // Clear the value of selected city when state changes
        const postsData = await getAllCitiesByStateCode({ isoCode: value });
        setListsOfCities(postsData);
    };

    const filterFactoryOption = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)


    const onChangeFactoryCity = (value) => {
        console.log(`selected city ${value}`);
        const filteredLoc = listsOfCities.filter((data) => data.name == value);
        console.log("onChangeFactoryCity: ", filteredLoc);
        setSelectedFactoryLatitude(filteredLoc[0].latitude);
        setSelectedFactoryLongitude(filteredLoc[0].longitude);
        setSelectedFactoryCity(value);
    };

    const filterFactoryOptionCity = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)

    const ownership = [
        { id: 1, value: "Public Limited" },
        { id: 2, value: "Private Limited" },
        { id: 3, value: "Partnership" },
        { id: 4, value: "Proprietary" }
    ];

    const onChangeOwnership = (e) => {
        console.log("onChangeOwnership: ", e);
    }

    const handleFileChange = async ({ fileList }) => {
        console.log("file: ", fileList);
        // setFileList(fileList);
        const response = await fetch(fileList.originFileObj);
        const blob = await response.blob();
        console.log("file blob: ", blob);
        setFileList(blob);
        // 1. Limit the number of uploaded files
    };

    const fileProps = {
        // action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
        onChange: handleFileChange,
        accept: '.pdf'
    };

    const beforeUpload = (file) => {
        const isPdf = file.type === 'application/pdf';
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isPdf) {
            // Show error message for non-PDF files
            setFileError('You can only upload PDF file!');
            console.error('You can only upload PDF file!');
        }
        if (!isLt2M) {
            // Show error message for files larger than 2MB
            setFileError('File must be smaller than 2MB!');
            console.error('File must be smaller than 2MB!');
        }
        return isPdf && isLt2M;
    };

    // Memoize the options prop
    const options = useMemo(() => ({ workerSrc: 'http://127.0.0.1:5173/pdf.worker.js/pdf.worker.js' }), []);

    const accountTypeLists = [
        { id: 1, value: "Current" },
        { id: 2, value: "Savings" }

    ];

    const onChangeAccountType = (e) => {
        console.log("onChangeAccountType: ", e);
    }

    const steps = [
        {
            title: 'General Information',
            content: (
                <Form form={form} layout="vertical" ref={formRefs.current[0]}
                    onFinish={(values) => handleFinish(values, 0)}>
                    {/* Add your document upload fields here */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name="companyname" label="Company Name" rules={[
                                { required: true, message: 'Please enter your Company Name' }]}>
                                <Input placeholder="Please enter your company name" maxLength={15} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="turnover"
                                label="Company Turn over (In Lakhs)"
                                rules={[
                                    { required: true, message: 'Please enter Company Turn over (In Lakhs)' },
                                    {
                                        pattern: /^\d{1,10}$/, // Regex pattern to match 10 digits
                                        message: 'Please enter a valid turnover (upto 10 digits)',
                                    },]}
                            >
                                <Input prefix={'Rs'} placeholder="Company Turn over (In Lakhs)" />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="website"
                                label="Company Website (Optional)"
                                rules={[
                                    {
                                        type: 'url',
                                        warningOnly: true,
                                    },
                                    {
                                        type: 'string',
                                        min: 6,
                                    },
                                ]}
                            >
                                <Input placeholder="www.abc.co.in" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="majCustServed"
                                label="Major Customer Served"
                                rules={[{ required: true, message: "Please provide a Major Customer Served" }]}
                            >
                                <Input placeholder="Enter major customer served in your company" maxLength={30} />
                            </Form.Item>
                        </Col>
                    </Row>


                    {/* Certified */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="isoCert"
                                label="Choose ISO Certified"
                                rules={[
                                    { required: true, message: 'Please Choose ISO 14001 Certified or not' }]}
                            >
                                <Select
                                    placeholder="Choose ISO 14001 Certified"

                                    options={[
                                        {
                                            value: 'yes',
                                            label: 'Yes',
                                        },
                                        {
                                            value: 'no',
                                            label: 'No',
                                        }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="tsCert"
                                label="Choose TS Certified"
                                rules={[
                                    { required: true, message: 'Please Choose TS Certified or not' }]}
                            >
                                <Select
                                    placeholder="Choose TS Certified"

                                    options={[
                                        {
                                            value: 'yes',
                                            label: 'Yes',
                                        },
                                        {
                                            value: 'no',
                                            label: 'No',
                                        }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of Certified */}

                    {/* Mobile Number Fields */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="factoryMobile"
                                label="Factory Mobile Number"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your mobile number!',
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/, // Regex pattern to match exactly 10 digits
                                        message: 'Please enter a valid 10-digit mobile number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter your 10-digit mobile number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="officeMobile"
                                label="Office Mobile Number"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your mobile number!',
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/, // Regex pattern to match exactly 10 digits
                                        message: 'Please enter a valid 10-digit mobile number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter your 10-digit mobile number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of Mobile Number Fields */}

                    {/* Office Telephone Number Fields */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="officeTelephoneStd"
                                label="Office STD Code (Optional)"
                                rules={[
                                    {
                                        warningOnly: true,
                                        message: 'Please enter office STD code!',
                                    },
                                    {
                                        pattern: /^[0-9]{5}$/, // Regex pattern to match exactly 5 digits
                                        message: 'Please enter a valid office telephone STD code!',
                                    },
                                ]}
                            >
                                <Input prefix={'+'} placeholder="Enter STD Code" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="officeTelephone"
                                label="Office Telephone (Optional)"
                                rules={[
                                    {
                                        warningOnly: true,
                                        message: 'Please enter office telephone!',
                                    },
                                    {
                                        pattern: /^[0-9]{12}$/, // Regex pattern to match exactly 12 digits
                                        message: 'Please enter a valid office telephone number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter Telephone Number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of  Office Telephone Number Fields */}

                    {/* Office Factory Number Fields */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="factoryTelephoneStd"
                                label="Factory STD Code (Optional)"
                                rules={[
                                    {
                                        message: 'Please enter factory STD code!',
                                    },
                                    {
                                        pattern: /^[0-9]{5}$/, // Regex pattern to match exactly 5 digits
                                        message: 'Please enter a valid Factory telephone STD code!',
                                    },
                                ]}
                            >
                                <Input prefix={'+'} placeholder="Enter STD Code" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="factoryTelephone"
                                label="Factory Telephone (Optional)"
                                rules={[
                                    {
                                        warningOnly: true,
                                        message: 'Please enter factory telephone!',
                                    },
                                    {
                                        pattern: /^[0-9]{12}$/, // Regex pattern to match exactly 12 digits
                                        message: 'Please enter a valid factory telephone number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter Telephone Number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of  Factory Telephone Number Fields */}

                    {/* Office Factory Number Fields */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="factoryEmailAddress"
                                label="Factory Email Address"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'Please enter a valid factory email!',
                                    }
                                ]}
                            >
                                <Input placeholder="Enter factory email address" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="officeEmailAddress"
                                label="Office Email Address"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'Please enter a valid office email!',
                                    }
                                ]}
                            >
                                <Input placeholder="Enter office email address" />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of  Factory Telephone Number Fields */}

                    <Row gutter={[16, 16]}>
                        <h4>Address Details:</h4>
                    </Row>

                    {/* Factory Address Fields */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'factoryAddress'} label="Factory Address" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory address"

                                }
                            ]}>
                                <Input.TextArea rows={4} placeholder="Enter your factory address (100 words)" maxLength={100} showCount />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'factoryState'} label="Please select your Factory State" rules={[
                                {
                                    required: true,
                                    message: "Please select your factory state"

                                }
                            ]}
                                valuePropName="value"
                            >
                                <Select
                                    showSearch
                                    placeholder="Select your Factory State (or) Enter your Factory State"
                                    optionFilterProp="children"
                                    onChange={onChangeFactoryState}
                                    filterOption={filterFactoryOption}
                                    style={{ width: "90%" }}
                                    value={selectedFactoryState}
                                >
                                    {listsOfStates.map((state) => (
                                        <Select.Option key={state.isoCode} value={state.isoCode}>
                                            {state.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'factoryCity'} label="Please select your Factory City" rules={[
                                {
                                    required: true,
                                    message: "Please select your city"

                                }
                            ]}
                                valuePropName="value"
                            >
                                <Select
                                    showSearch
                                    placeholder="Select your Factory City (or) Enter your Factory City"
                                    optionFilterProp="children"
                                    onChange={onChangeFactoryCity}
                                    filterOption={filterFactoryOptionCity}
                                    style={{ width: "90%" }}
                                    value={selectedFactoryCity}
                                >
                                    {listsOfCities.map((city) => (
                                        <Select.Option key={city.name} value={city.name}>
                                            {city.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of Factory Address Fields */}

                    {/* checkbox Fields */}
                    <Row gutter={[16, 16]}>
                        <Form.Item
                            name="isSameAddress"
                            valuePropName='checked'
                        >
                            <Checkbox onChange={handleCheckboxChange} checked={isChecked} style={{ color: '#1890ff' }} >
                                <ul style={{ listStyle: 'none', marginRight: '10px' }}>
                                    <li>Check here if Office and Factory address are different.</li>
                                    <li>
                                        <strong>Note:</strong>&nbsp;If not checked then we will store factory address as office address
                                    </li>
                                </ul>
                            </Checkbox>
                        </Form.Item>
                    </Row>
                    {/* End of checkbox Fields */}

                    {/* Office Address Fields */}
                    {isChecked && <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'officeAddress'} label="Office Address" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office address"

                                }
                            ]}>
                                <Input.TextArea rows={4} placeholder="Enter your office address (100 words)" maxLength={100} showCount />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'officeState'} label="Please select your Office State" rules={[
                                {
                                    required: true,
                                    message: "Please select your Office state"

                                }
                            ]}>
                                <Select
                                    showSearch
                                    placeholder="Select a Office State (or) Enter your Office State"
                                    optionFilterProp="children"
                                    onChange={onChangeOfficeState}
                                    filterOption={filterOfficeOption}
                                    style={{ width: "90%" }}
                                    value={selectedOfficeState}
                                >
                                    {listsOfStates.map((state) => (
                                        <Select.Option key={state.isoCode} value={state.isoCode}>
                                            {state.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'officeCity'} label="Please select your Office City" rules={[
                                {
                                    required: true,
                                    message: "Please select your office city"

                                }
                            ]}>
                                <Select
                                    showSearch
                                    placeholder="Select your Office City (or) Enter your Office City"
                                    optionFilterProp="children"
                                    onChange={onChangeOfficeCity}
                                    filterOption={filterOfficeOptionCity}
                                    style={{ width: "90%" }}
                                    value={selectedOfficeCity}
                                >
                                    {listsOfCities.map((city) => (
                                        <Select.Option key={city.name} value={city.name}>
                                            {city.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>}
                    {/* End of Office Address Fields */}


                </Form >
            ),
        },
        {
            title: 'Documents Verification',
            content: (
                <Form form={form} layout="vertical" ref={formRefs.current[1]}
                    onFinish={(values) => handleFinish(values, 1)}>
                    {/* Add your document upload fields here */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'ownership'} label="Ownership Pattern" rules={[
                                {
                                    required: true,
                                    message: "Please select ownership pattern"
                                }
                            ]}>
                                <Select
                                    placeholder="Select your ownership pattern"
                                    onChange={onChangeOwnership}
                                    style={{ width: "90%" }}
                                    value={selectedOwnership}
                                >
                                    {ownership.map((owner) => (
                                        <Select.Option key={owner.id} value={owner.value}>
                                            {owner.value}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'yearEstablished'} label="Year of Establishment" rules={[
                                {
                                    required: true,
                                    message: "Please enter year of establishment"
                                },
                                {
                                    pattern: /^[0-9]{4}$/,
                                    message: 'Please enter a valid year of establishment! (Max allowed 4 digits)',
                                },
                            ]}>
                                <Input placeholder="Enter year of establishment" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* CIN Input and file */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'indLicNum'} label="CIN (Corporate Identification Number)" rules={[
                                {
                                    required: true,
                                    message: "Please enter your CIN number"
                                }
                            ]}>
                                <Input placeholder="Enter your CIN number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'cinPdf'} label="Upload your CIN File" rules={[
                                {
                                    required: true,
                                    message: "Please upload your CIN file"
                                }
                            ]}>
                                <Upload {...fileProps} style={{ marginBottom: 16 }} maxCount={1} beforeUpload={beforeUpload}>
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* GST input and files */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'GSTIN'} label="GSTIN (Goods and Services Tax Identification Number)" rules={[
                                {
                                    required: true,
                                    message: "Please enter your GSTIN number"
                                }
                            ]}>
                                <Input placeholder="Enter your GSTIN number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'gstInPdf'} label="Upload your GSTIN File" rules={[
                                {
                                    required: true,
                                    message: "Please upload your GSTIN file"
                                }
                            ]}>
                                <Upload {...fileProps} style={{ marginBottom: 16 }} maxCount={1} beforeUpload={beforeUpload}>
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* PAN input and files */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'PAN'} label="PAN (Permanent Account Number)" rules={[
                                {
                                    required: true,
                                    message: "Please enter your PAN number"
                                }
                            ]}>
                                <Input placeholder="Enter your PAN number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'panPdf'} label="Upload your PAN File" rules={[
                                {
                                    required: true,
                                    message: "Please upload your PAN file"
                                }
                            ]}>
                                <Upload {...fileProps} style={{ marginBottom: 16 }} maxCount={1} beforeUpload={beforeUpload}>
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form >
            ),
        },
        {
            title: 'Bank Information',
            content: (
                <Form form={form} layout="vertical" ref={formRefs.current[2]}
                    onFinish={(values) => handleFinish(values, 2)}>
                    {/* Add your title and account type */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'bankTitle'} label="Title of Account in the Bank" rules={[
                                {
                                    required: true,
                                    message: "Please enter title of account in the bank"
                                },
                            ]}>
                                <Input placeholder="Enter title of account in the bank" maxLength={40} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'bankAccType'} label="Account Type" rules={[
                                {
                                    required: true,
                                    message: "Please select account type"
                                }
                            ]}>
                                <Select
                                    placeholder="Select your account type"
                                    onChange={onChangeAccountType}
                                    style={{ width: "90%" }}
                                >
                                    {accountTypeLists.map((account) => (
                                        <Select.Option key={account.id} value={account.value}>
                                            {account.value}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                    </Row>

                    {/* Add your bank account no and address */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'bankAccNum'} label="Bank Account Number" rules={[
                                {
                                    required: true,
                                    message: "Please enter bank account number"
                                },
                                {
                                    pattern: /^[0-9]{11,17}$/,
                                    message: "Please provide a valid bank account number"
                                }
                            ]}>
                                <Input placeholder="Enter bank account number" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'bankNameAddr'} label="Bank Address (optional)" rules={[
                                {
                                    message: "Please enter bank address"
                                }
                            ]}>
                                <Input.TextArea rows={4} placeholder="Enter your bank address (100 words)" maxLength={100} showCount />
                            </Form.Item>
                        </Col>

                    </Row>

                    {/* Bank Telephone Number Fields */}
                    <Row gutter={[16, 16]}>
                        {/* <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="bankstd"
                                label="Bank STD Code (Optional)"
                                rules={[
                                    {
                                        message: 'Please enter bank STD code!',
                                    },
                                    {
                                        pattern: /^[0-9]{5}$/, // Regex pattern to match exactly 5 digits
                                        message: 'Please enter a valid bank telephone STD code!',
                                    },
                                ]}
                            >
                                <Input prefix={'+'} placeholder="Enter STD Code" style={{ width: "70%" }} />
                            </Form.Item>
                        </Col> */}
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="bankContact"
                                label="Bank Contact (Optional)"
                                rules={[
                                    {
                                        message: 'Please enter bank mobile number!',
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/, // Regex pattern to match exactly 10 digits
                                        message: 'Please enter a valid bank mobile number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter Mobile Number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Bank MICR and IFSC Fields */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="bankMICR"
                                label="Bank Branch MICR Code"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your bank MICR code!',
                                    },
                                    {
                                        pattern: /^[0-9]{5}$/, // Regex pattern to match exactly 5 digits
                                        message: 'Please enter a valid bank MICR code!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter your bank branch MICR Code" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="bankIFSC"
                                label="Bank Branch IFSC Code"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your bank IFSC code!',
                                    },
                                    {
                                        pattern: /^[0-9]{5}$/, // Regex pattern to match exactly 5 digits
                                        message: 'Please enter a valid bank IFSC code!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter your bank branch IFSC Code" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            ),
        },
        {
            title: 'Review',
            content: 'Review your details before submission',
        },
    ];

    const handleFinish = (values, stepIndex) => {
        setFormData(prevState => ({ ...prevState, [stepIndex]: values }));
        handleNext(); // Move to the next step
    };

    const handleNext = () => {
        form.validateFields().then((values) => {
            console.log("form: ", values);
            setCurrentStep(currentStep + 1);
        });
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e) => {
        const allFormData = Object.values(formData).reduce((acc, curr) => ({ ...acc, ...curr }), {});
        console.log('All form data:', allFormData);
        form.validateFields().then((values) => {
            // Process form submission
            const baseUrl = "http://localhost:5100/api/registration/saveuser";
            // update latitude and longitude
            // values.officeLatitude = selectedOfficeLatitude;
            // values.officeLongitude = selectedOfficeLongitude;
            // values.officeCountry = "IN";

            // values.factoryLatitude = selectedFactoryLatitude;
            // values.factoryLongitude = selectedFactoryLongitude;
            // values.factoryCountry = "IN";

            const configHeaders = {
                headers: { "content-type": "multipart/form-data" },
            }; // htmlFor file uploads

            axios.post(baseUrl, values, configHeaders).then((response, err) => {
                if (err) {
                    console.log("Form Error1: ", err);
                    return;
                } else {
                    console.log("submitted to db: ", response);
                }
            }).catch((error) => {
                console.log("Form Error: ", error);
            })
            console.log("handleSubmit values: ", values);
            message.success('Registration successful!');
        }).catch((error) => {
            console.log("form field error: ", error);
        })
    };

    return (
        <div>
            <Layout>
                <Content style={{ padding: '60px' }}>
                    <div style={{ background: '#fff', padding: 40, minHeight: 280 }}>
                        <h2>Registration as Hirer/Renter</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <Alert
                                message="Informational Notes"
                                description={infoMessage()}
                                type="info"
                                showIcon
                            />
                        </div>
                        <Steps current={currentStep}>
                            {steps.map((step, index) => (
                                <Step key={step.title} title={step.title} />
                            ))}
                        </Steps>
                        <div style={{ marginTop: '2rem' }}>{steps[currentStep].content}</div>
                        <div style={{ marginTop: '2rem' }}>
                            {currentStep > 0 && (
                                <Button style={{ margin: '0 8px' }} onClick={handlePrev}>
                                    Previous
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <Button type="primary" htmlType='submit' onClick={handleSubmit}>
                                    Submit
                                </Button>
                            )}
                        </div>
                    </div>
                </Content>
            </Layout>

        </div>
    );
};

export default RegistrationAccount;
