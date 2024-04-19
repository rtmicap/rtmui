import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Steps, Button, message, Form, Input, Alert, List, Layout, Row, Col, Select, Divider, Checkbox, Upload, Flex, Descriptions, Collapse, Modal, Typography } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
const { Step } = Steps;
const { Content } = Layout;

import axios from 'axios';
import Countries from '../../utils/Countries and States/countries.json';
import { Document, Page } from '@react-pdf/renderer';
import { useNavigate } from "react-router-dom";
// import { saveUser } from '../Api/apiServices';
import config from "../../env.json";
const { Text } = Typography;

const RegistrationAccount = () => {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    const [listsOfCountries, setListsOfCountries] = useState([]);
    const [listsOfStates, setListsOfStates] = useState([]);
    // office 
    const [selectedOfficeState, setSelectedOfficeState] = useState('');
    const [selectedOfficeCountry, setSelectedOfficeCountry] = useState('');
    // factory
    const [selectedFactoryState, setSelectedFactoryState] = useState('');
    const [selectedFactoryCountry, setSelectedFactoryCountry] = useState('');
    // checkbox
    const [isChecked, setIsChecked] = useState(false);
    // ownership
    const [selectedOwnership, setSelectedOwnership] = useState('');
    const [fileError, setFileError] = useState('');

    const [formData, setFormData] = useState({});
    // files
    const [cinPdfFileList, setCinPdfFileList] = useState([]);
    const [gstPdfFileList, setGstPdfFileList] = useState([]);
    const [panPdfFileList, setPanPdfFileList] = useState([]);

    const [viewCinPdf, setViewCinPdf] = useState(null);
    const [viewGstPdf, setViewGstPdf] = useState(null);
    const [viewPanPdf, setViewPanPdf] = useState(null);


    useEffect(() => {
        getAllCountries();
    }, []);

    const handleCheckboxChange = (e) => {
        console.log("e.target: ", e.target);
        setIsChecked(e.target.checked);
    };

    const getAllCountries = async () => {
        // console.log("Countries: ", Countries);
        const countriesData = await Countries;
        setListsOfCountries(countriesData);
    }

    const data = [
        (<ol style={{ fontWeight: 'bold', fontSize: '15px' }}>
            <li><span style={{ color: 'red' }}>*</span> - Mandatory Fields</li>
            <li>Please have your soft copy ready in <span style={{ color: 'red' }}>PDF format</span> for CIN or UAM, GST & PAN details.</li>
            <li>PDF file size should not be greater than 2 MB</li>
        </ol>)
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
        console.log("onChangeOfficeState value: ", value);
    };

    const filterOfficeOptionState = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)


    const onChangeOfficeCountry = (value) => {
        setSelectedOfficeCountry(value);
        const filteredCountries = Countries.filter((country) => (country.iso2 || country.iso3) == value);
        setListsOfStates(filteredCountries[0].states);
    };

    const filterOfficeOptionCountry = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)

    // end of office state and city

    const onChangeFactoryState = async (value) => {
        setSelectedFactoryState(value);
    };

    const filterFactoryOptionState = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)


    const onChangeFactoryCountry = (value) => {
        setSelectedFactoryCountry(value);
        // set states as per the country value
        const filteredCountries = Countries.filter((country) => (country.iso2 || country.iso3) == value);
        setListsOfStates(filteredCountries[0].states)
    };

    const filterFactoryOptionCountry = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)

    const ownership = [
        { id: 1, value: "Public Limited" },
        { id: 2, value: "Private Limited" },
        { id: 3, value: "Partnership" },
        { id: 4, value: "Proprietary" }
    ];

    const onChangeOwnership = (value) => {
        setSelectedOwnership(value)
        console.log("onChangeOwnership: ", value);
    }

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
    // const options = useMemo(() => ({ workerSrc: 'http://127.0.0.1:5173/pdf.worker.js/pdf.worker.js' }), []);

    const accountTypeLists = [
        { id: 1, value: "Current" },
        { id: 2, value: "Savings" }

    ];

    const onChangeAccountType = (e) => {
        console.log("onChangeAccountType: ", e);
    }

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const fileType = ['application/pdf'];
    const pdfContentType = 'application/pdf';

    const base64toBlob = (data) => {
        // Cut the prefix `data:application/pdf;base64` from the raw base 64
        const base64WithoutPrefix = data.substr(`data:${pdfContentType};base64,`);
        console.log("base64WithoutPrefix: ", base64WithoutPrefix);
        const bytes = atob(base64WithoutPrefix);
        let length = bytes.length;
        let out = new Uint8Array(length);

        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }

        return new Blob([out], { type: pdfContentType });
    };

    const handleCinPdfChange = (info) => {
        // console.log("handleCinPdfChange: ", info);
        // setShowPdfViewer(true);
        const selectedFile = info.fileList[0].originFileObj;
        if (selectedFile) {
            if (selectedFile && selectedFile.type.includes(fileType)) {
                let render = new FileReader();
                render.readAsDataURL(selectedFile);
                render.onload = (e) => {
                    console.log("onload: ", e);
                    // const url = URL.createObjectURL(base64toBlob(e.target.result));
                    setViewCinPdf(e.target.result);
                    message.success("CIN Pdf file uploaded");
                }
            } else {
                setViewCinPdf(null);
                message.error("Invalid Unsupported File. Please Upload PDF file");
            }
        }
        setCinPdfFileList(info.fileList[0].originFileObj);
    };

    const handleGstPdfChange = (info) => {
        const selectedFile = info.fileList[0].originFileObj;
        if (selectedFile) {
            if (selectedFile && selectedFile.type.includes(fileType)) {
                let render = new FileReader();
                render.readAsDataURL(selectedFile);
                render.onload = (e) => {
                    console.log("onload: ", e);
                    // const url = URL.createObjectURL(base64toBlob(e.target.result));
                    setViewGstPdf(e.target.result);
                    message.success("GSTIN Pdf file uploaded");
                }
            } else {
                setViewGstPdf(null);
                message.error("Invalid Unsupported File. Please Upload PDF file");
            }
        }
        setGstPdfFileList(info.fileList[0].originFileObj);
    };

    const handlePanPdfChange = (info) => {
        const selectedFile = info.fileList[0].originFileObj;
        if (selectedFile) {
            if (selectedFile && selectedFile.type.includes(fileType)) {
                let render = new FileReader();
                render.readAsDataURL(selectedFile);
                render.onload = (e) => {
                    console.log("onload: ", e);
                    // const url = URL.createObjectURL(base64toBlob(e.target.result));
                    setViewPanPdf(e.target.result);
                    message.success("PAN Pdf file uploaded");
                }
            } else {
                setViewPanPdf(null);
                message.error("Invalid Unsupported File. Please Upload PDF file");
            }
        }
        setPanPdfFileList(info.fileList[0].originFileObj);
    };

    const handleViewFile = () => {
        if (viewCinPdf) {
            const newWindow = window.open();
            newWindow.document.write(`<iframe width='100%' height='100%' src='${viewCinPdf}'></iframe>`);
        } else {
            console.error('No PDF uploaded');

        }

    };

    const handleGstViewFile = () => {
        if (viewGstPdf) {
            const newWindow = window.open();
            newWindow.document.write(`<iframe width='100%' height='100%' src='${viewGstPdf}'></iframe>`);
        } else {
            console.error('No GSTIN PDF uploaded');
        }
    };

    const handlePanViewFile = () => {
        if (viewPanPdf) {
            const newWindow = window.open();
            newWindow.document.write(`<iframe width='100%' height='100%' src='${viewPanPdf}'></iframe>`);
        } else {
            console.error('No PAN PDF uploaded');
        }
    };

    const descriptive = [
        {
            label: (<h4>Company Name</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.companyname,
        },
        {
            label: (<h4>Company Website</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.website ? formData.website : '-',
        },
        {
            label: (<h4>ISO Certified</h4>),
            children: formData.isoCert ? formData.isoCert : '-',
        },
        {
            label: (<h4>TS Certified</h4>),

            children: formData.tsCert ? formData.tsCert : '-',
        },
        {
            label: (<h4>ISO 4001 Certified</h4>),

            children: formData.iso14001 ? formData.iso14001 : '-',
        },
        {
            label: (<h4>Company Turnover</h4>),

            children: formData.turnover + ' Lakhs',
        },
        {
            label: (<h4>Major Customer Served</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.majCustServed,
        },
        {
            label: '',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: ''
        },
        {
            label: (<h4>Office Country</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.officeCountry,
        },
        {
            label: (<h4>Factory Country</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.factoryCountry,
        },
        {
            label: (<h4>Office Address</h4>),
            // children: formData.officeAddress,
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: formData.officeAddress,
        },
        {
            label: (<h4>Factory Address</h4>),
            // children: formData.factoryAddress,
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: formData.factoryAddress,
        },
        {
            label: (<h4>Office State</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.officeState,
        },
        {
            label: (<h4>Factory State</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.factoryState,
        },
        {
            label: (<h4>Office City</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.officeCity,
        },
        {
            label: (<h4>Factory City</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.factoryCity,
        },
        {
            label: (<h4>Office Area</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.officeArea,
        },
        {
            label: (<h4>Factory Area</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.factoryArea,
        },
        {
            label: (<h4>Office PIN Code</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.offPinCode,
        },
        {
            label: (<h4>Factory PIN Code</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.facPinCode,
        },
        {
            label: (<h4>Office Telephone</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: `${formData.officeTelephoneStd} ${formData.officeTelephone}`,
        }
    ];

    const bankDescriptive = [
        {
            label: (<h4>Title of Account</h4>),
            children: formData.bankTitle
        },
        {
            label: (<h4>Type of Account</h4>),
            children: formData.bankAccType
        },
        {
            label: (<h4>Bank Account Number</h4>),
            children: formData.bankAccNum
        },
        {
            label: (<h4>Bank Contact Number</h4>),
            children: formData.bankContact ? formData.bankContact : '-'
        },
        {
            label: (<h4>Bank Address</h4>),
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: formData.bankNameAddr ? formData.bankNameAddr : '-'
        }
    ];

    const documentDescriptive = [
        {
            label: (<h4>Ownership</h4>),
            children: formData.ownership
        },
        {
            label: (<h4>Year of Establishment</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.yearEstablished
        },
        {
            label: (<h4>CIN Number</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.indLicNum
        },
        {
            label: (<h4>GSTIN Number</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.GSTIN
        },
        {
            label: (<h4>PAN Number</h4>),
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formData.PAN
        },
        {
            label: (<h4>CIN Uploaded File</h4>),
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: (
                <Button type='link' onClick={handleViewFile}>View CIN File</Button>
            )
        },
        {
            label: (<h4>GSTIN Uploaded File</h4>),
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: (
                <Button type='link' onClick={handleGstViewFile}>View GSTIN File</Button>
            )
        },
        {
            label: (<h4>PAN Uploaded File</h4>),
            span: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 2,
                xxl: 2,
            },
            children: (
                <Button type='link' onClick={handlePanViewFile}>View PAN File</Button>
            )
        }
    ];

    const items = [
        {
            key: 1,
            label: 'General Information Details',
            children: (
                <Descriptions
                    // title="General Information Details"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    items={descriptive}
                />
            )
        },
        {
            key: 2,
            label: 'Documents Verification Details',
            children: (
                <Descriptions
                    // title="General Information Details"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    items={documentDescriptive}
                />
            )
        },
        {
            key: 3,
            label: 'Bank Information Details',
            children: (
                <Descriptions
                    // title="General Information Details"
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    items={bankDescriptive}
                />
            )
        }
    ];

    const [panNumber, setPanNumber] = useState('');

    const handlePanChange = (e) => {
        console.log("handlePanChange: ", e.target.value);
        setPanNumber(e.target.value.toUpperCase());
        console.log("eequal: ", e.target.value == 'ABCTY1234D');
    };

    const steps = [
        {
            title: 'General Information',
            content: (
                <Form form={form} layout="vertical">
                    {/* Add your document upload fields here */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name="companyname" label="Company Name" rules={[
                                { required: true, message: 'Please enter your Company Name' }]}>
                                <Input placeholder="Please enter your company name" maxLength={100} />
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
                                <Input placeholder="Enter major customer served in your company (150 words)" maxLength={150} />
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
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="iso14001"
                                label="Choose ISO 4001 Certified"
                                rules={[
                                    { required: true, message: 'Please Choose ISO 4001 Certified or not' }]}
                            >
                                <Select
                                    placeholder="Choose ISO 4001 Certified"

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
                                <Input placeholder="Enter your 10-digit mobile number" maxLength={10} />
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
                                <Input placeholder="Enter your 10-digit mobile number" maxLength={10} />
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
                                        pattern: /^(\d{2,7})$/, // Regex pattern to match between 2 to 7 digits
                                        message: 'Please enter a valid office telephone STD code!',
                                    },
                                ]}
                            >
                                <Input prefix={'+'} placeholder="Enter STD Code" maxLength={7} />
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
                                        pattern: /^(\d{2,12})$/, // Regex pattern to match between 2 to 12 digits
                                        message: 'Please enter a valid office telephone number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter Telephone Number" maxLength={12} />
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
                                        pattern: /^(\d{2,7})$/, // Regex pattern to match between 2 to 7 digits
                                        message: 'Please enter a valid Factory telephone STD code!',
                                    },
                                ]}
                            >
                                <Input prefix={'+'} placeholder="Enter STD Code" maxLength={7} />
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
                                        pattern: /^(\d{2,12})$/, // Regex pattern to match between 2 to 12 digits
                                        message: 'Please enter a valid factory telephone number!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter Telephone Number" maxLength={12} />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of  Factory Telephone Number Fields */}

                    {/* Office Factory email Fields */}
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
                                <Input placeholder="Enter factory email address" autoComplete="off" />
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
                                <Input placeholder="Enter office email address" autoComplete="off" />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* End of  Factory Telephone email Fields */}

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
                            <Form.Item name={'factoryCountry'} label="Please select your Factory Country" rules={[
                                {
                                    required: true,
                                    message: "Please select your country"

                                }
                            ]}
                                valuePropName="value"
                            >
                                <Select
                                    showSearch
                                    placeholder="Select your Factory Country (or) Enter your Factory Country"
                                    optionFilterProp="children"
                                    onChange={onChangeFactoryCountry}
                                    filterOption={filterFactoryOptionCountry}
                                    style={{ width: "90%" }}
                                    value={selectedFactoryCountry}
                                >
                                    {listsOfCountries.map((country) => (
                                        <Select.Option key={country.name} value={country.iso2}>
                                            {country.name}
                                        </Select.Option>
                                    ))}
                                </Select>
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
                                    filterOption={filterFactoryOptionState}
                                    style={{ width: "90%" }}
                                    value={selectedFactoryState}
                                >
                                    {listsOfStates.map((state) => (
                                        <Select.Option key={state.id} value={state.name}>
                                            {state.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'factoryCity'} label="Please Enter your Factory City" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory city"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid factory city (Allowed only characters)"
                                }
                            ]}
                                valuePropName="value"
                            >
                                <Input name={'factoryCity'} placeholder='Enter your factory city' autoComplete="off" maxLength={60} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'factoryArea'} label="Please Enter your Factory Area" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory area"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid factory area (Allowed only characters)"
                                }
                            ]}
                                valuePropName="value"
                            >
                                <Input name={'factoryArea'} placeholder='Enter your factory area' autoComplete="off" maxLength={60} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'facPinCode'} label="Please Enter your Factory PIN code" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory PIN code"
                                },
                                {
                                    pattern: /^[0-9]{6}$/, // Regex pattern to match exactly 6 digits
                                    message: 'Please enter a valid 6-digit pin code number!',
                                },
                            ]}
                                valuePropName="value"
                            >
                                <Input name={'facPinCode'} placeholder='Enter your factory PIN code' />
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
                            <Form.Item name={'officeCountry'} label="Please select your Office Country" rules={[
                                {
                                    required: true,
                                    message: "Please select your office country"

                                }
                            ]}>
                                <Select
                                    showSearch
                                    placeholder="Select your Office Country (or) Enter your Office Country"
                                    optionFilterProp="children"
                                    onChange={onChangeOfficeCountry}
                                    filterOption={filterOfficeOptionCountry}
                                    style={{ width: "90%" }}
                                    value={selectedOfficeCountry}
                                >
                                    {listsOfCountries.map((country) => (
                                        <Select.Option key={country.name} value={country.iso2}>
                                            {country.name}
                                        </Select.Option>
                                    ))}
                                </Select>
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
                                    filterOption={filterOfficeOptionState}
                                    style={{ width: "90%" }}
                                    value={selectedOfficeState}
                                >
                                    {listsOfStates.map((state) => (
                                        <Select.Option key={state.id} value={state.name}>
                                            {state.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'officeCity'} label="Please Enter your Office City" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office city"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid office city (Allowed only characters)"
                                }
                            ]}
                                valuePropName="value"
                            >
                                <Input name={'officeCity'} placeholder='Enter your office city' autoComplete="off" maxLength={60} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'officeArea'} label="Please Enter your Office Area" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office area"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid office area (Allowed only characters)"
                                }
                            ]}
                                valuePropName="value"
                            >
                                <Input name={'officeArea'} placeholder='Enter your office area' maxLength={60} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'offPinCode'} label="Please Enter your Office PIN code" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office PIN code"
                                },
                                {
                                    pattern: /^[0-9]{6}$/, // Regex pattern to match exactly 6 digits
                                    message: 'Please enter a valid 6-digit pin code number!',
                                },
                            ]}
                                valuePropName="value"
                            >
                                <Input name={'offPinCode'} placeholder='Enter your office PIN code' maxLength={6} />
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
                <Form form={form} layout="vertical">
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
                                    options={ownership}
                                >
                                    {/* {ownership.map((owner) => (
                                        <Select.Option key={owner.id} value={owner.value}>
                                            {owner.value}
                                        </Select.Option>
                                    ))} */}
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
                                <Input placeholder="Enter year of establishment" maxLength={4} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* CIN Input and file */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'indLicNum'} label="CIN (Corporate Identification Number) or UAM" rules={[
                                {
                                    pattern: /^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$|^UDYAM([A-Z]{2})(\d{2})(\d{7})$/,
                                    message: "Please provide your valid CIN number L17110MH1973PLC019786 (or) U12345AB6784CDE123456"
                                },
                                {
                                    required: true,
                                    message: "Please enter your CIN number or UAM L17110MH1973PLC019786 (or) U12345AB6784CDE123456"
                                },
                            ]} extra="CIN Format: L17110MH1973PLC019786 (or) U12345AB6784CDE123456">
                                <Input placeholder="Enter your CIN number or UAM" maxLength={22} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'cinPdf'} label="Upload your CIN File" rules={[
                                {
                                    required: true,
                                    message: "Please upload your CIN file"
                                }
                            ]}>
                                <Flex gap="small" wrap="wrap">
                                    <Upload name={'cinPdf'} accept=".pdf" onChange={handleCinPdfChange} style={{ marginBottom: 16 }} maxCount={1} beforeUpload={() => false} showUploadList={{ showRemoveIcon: false }}>
                                        <Button icon={<UploadOutlined />}>Upload</Button>
                                    </Upload>
                                    {viewCinPdf && <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                                        <Button type='link' onClick={handleViewFile}>View Uploaded CIN</Button>
                                    </Col>}
                                </Flex>
                            </Form.Item>
                        </Col>

                    </Row>

                    {/* GST input and files */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'GSTIN'} label="GSTIN (Goods and Services Tax Identification Number)" rules={[
                                {
                                    required: true,
                                    message: "Please enter your GSTIN number (05ABDCE1234F1Z2)"
                                },
                                {
                                    pattern: /^([0][1-9]|[1-2][0-9]|[3][0-5])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1})([1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
                                    message: "Please provide your valid GSTIN number (05ABDCE1234F1Z2)"
                                }
                            ]} extra="GSTIN Format: 05ABDCE1234F1Z2">
                                <Input placeholder="Enter your GSTIN number" maxLength={15} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'gstInPdf'} label="Upload your GSTIN File" rules={[
                                {
                                    required: true,
                                    message: "Please upload your GSTIN file"
                                }
                            ]}>
                                <Flex gap="small" wrap="wrap">
                                    <Upload name={'gstInPdf'} accept=".pdf" onChange={handleGstPdfChange} style={{ marginBottom: 16 }} maxCount={1} beforeUpload={() => false} showUploadList={{ showRemoveIcon: false }}>
                                        <Button icon={<UploadOutlined />}>Upload</Button>
                                    </Upload>
                                    {viewGstPdf && <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                                        <Button type='link' onClick={handleGstViewFile}>View Uploaded GSTIN</Button>
                                    </Col>}
                                </Flex>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* PAN input and files */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'PAN'} label="PAN (Permanent Account Number)" rules={[
                                {
                                    required: true,
                                    message: "Please enter your PAN number (ABCTY1234D)"
                                },
                                {
                                    pattern: /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/,
                                    message: "Please provide your valid PAN number (ABCTY1234D)"
                                }
                            ]} extra="PAN Format: ABCTY1234D">
                                <Input placeholder="Enter your PAN number" maxLength={10} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'panPdf'} label="Upload your PAN File" rules={[
                                {
                                    required: true,
                                    message: "Please upload your PAN file"
                                }
                            ]}>
                                <Flex gap="small" wrap="wrap">
                                    <Upload name={'panPdf'} accept=".pdf" onChange={handlePanPdfChange} style={{ marginBottom: 16 }} maxCount={1} beforeUpload={() => false} showUploadList={{ showRemoveIcon: false }}>
                                        <Button icon={<UploadOutlined />}>Upload</Button>
                                    </Upload>
                                    {viewPanPdf && <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                                        <Button type='link' onClick={handlePanViewFile}>View Uploaded PAN</Button>
                                    </Col>}
                                </Flex>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form >
            ),
        },
        {
            title: 'Bank Information',
            content: (
                <Form form={form} layout="vertical">
                    {/* Add your title and account type */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item name={'bankTitle'} label="Bank Account Name" rules={[
                                {
                                    required: true,
                                    message: "Please enter bank account name"
                                },
                            ]}>
                                <Input placeholder="Enter title of account in the bank" maxLength={150} />
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
                                    pattern: /^[0-9]{11,16}$/,
                                    message: "Please provide a valid bank account number"
                                }
                            ]}>
                                <Input placeholder="Enter bank account number" maxLength={16}/>
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
                                <Input placeholder="Enter Mobile Number" maxLength={10} />
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
                                        message: 'Please enter your bank MICR code (Ex: 600002025)',
                                    },
                                    {
                                        pattern: /^[0-9]{1,9}$/,
                                        message: 'Please enter a valid bank MICR code! (Ex: 600002025)',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter your bank branch MICR Code (Ex: 600002025)" maxLength={9} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item
                                name="bankIFSC"
                                label="Bank Branch IFSC Code"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your bank IFSC code (Ex: IDIB000A090 or SBIN0005943)',
                                    },
                                    {
                                        pattern: /^[A-Za-z]{4}0[A-Z0-9a-z]{6}$/,
                                        message: 'Please enter a valid bank IFSC code! (Ex: IDIB000A090 or SBIN0005943)',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter your bank branch IFSC Code (Ex: IDIB000A090 or SBIN0005943)" maxLength={10} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            ),
        },
        {
            title: 'Review',
            content: (
                <>
                    <Text type='danger' strong>If you want to Edit your Information, Click previous button</Text>
                    <Collapse items={items} accordion />
                </>
            )
        },
    ];

    // const formData = new FormData();

    const handleNext = () => {
        form.validateFields().then((values) => {
            console.log("form: ", values);
            setFormData({ ...formData, ...values });
            setCurrentStep(currentStep + 1);
        });
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        console.log("fileform: ", cinPdfFileList);

        console.log("formData**: ", formData);
        // form.validateFields().then((values) => {

        // }).catch((error) => {
        //     message.error(`There is some error while submitting. Please contact support team`);
        //     console.log("form field error: ", error);
        // })
        // Process form submission
        const baseUrl = `${config.rtmWsEndpoint}/api/registration/saveuser`;
        formData.cinPdf = cinPdfFileList;
        formData.gstInPdf = gstPdfFileList;
        formData.panPdf = panPdfFileList;

        if (isChecked) {
            formData.officeAddress
            formData.officeState
            formData.officeCity
            formData.officeArea
            formData.offPinCode
        } else {
            // if not checked update factory data to office data
            formData.officeAddress = formData.factoryAddress;
            formData.officeState = formData.factoryState;
            formData.officeCity = formData.factoryCity;
            formData.officeArea = formData.factoryArea;
            formData.offPinCode = formData.facPinCode
        }

        console.log("formData2**: ", formData);

        // console.log("panPdf: ", fileFormData);

        const configHeaders = {
            headers: { "content-type": "multipart/form-data" },
        }; // htmlFor file uploads

        // const response = await saveUser(formData, configHeaders);

        // console.log("response: ", response)

        // if (response) {

        // } else {
        //     message.error(`There is some error while submitting`);
        // }

        axios.post(baseUrl, formData, configHeaders).then((response, err) => {
            if (err) {
                console.log("Form Error1: ", err);
                message.error(`There is some error while submitting! ${err.message}`);
                return;
            } else {
                console.log("submitted to db: ", response);
                message.success(`${response.data.message}`);
                setIsModalOpen(false);
                navigate('/success');
            }
        }).catch((error) => {
            console.log("Form Error: ", error);
            message.error(`There is some error while submitting! ${error.message}`);
        })
        console.log("handleSubmit values: ", values);
    };

    return (
        <div>
            <Layout>
                <Content style={{ padding: '60px' }}>
                    <div style={{ background: '#fff', padding: 40, minHeight: 280 }}>
                        <h2 style={{ textAlign: 'center' }}>Registration as Hirer/Renter</h2>
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
                                <Button type="primary" htmlType='submit' onClick={showModal}>
                                    Submit
                                </Button>
                            )}
                        </div>
                    </div>
                </Content>
            </Layout>
            <Modal title="Confirm to Submit" open={isModalOpen} onOk={handleSubmit} onCancel={handleCancel}>
                <p>
                    Once the account is approved. We will be using your factory email <strong>({formData.factoryEmailAddress})</strong> as a username for login purpose.
                    <br /><br />
                    <b>Note:</b> If you want to modify click cancel and update your email.
                </p>
            </Modal>
        </div>
    );
};

export default RegistrationAccount;
