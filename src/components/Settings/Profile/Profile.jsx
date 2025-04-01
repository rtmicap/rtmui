import React, { useEffect, useState } from 'react';
import { LoadingOutlined, LeftCircleOutlined, UploadOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Form, Input, Button, Modal, message, Row, Col, Select } from "antd";
import { useAuth } from '../../../contexts/AuthContext';
import { GET_COMPANY_DETAILS_BY_ID, UPDATE_COMPANY_DETAILS_BY_ID } from "../../../api/apiUrls";
import axios from '../../../api/axios';
import Countries from '../../../utils/Countries and States/countries.json';

function Profile() {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const [activeTab, setActiveTab] = useState("1");
    const [companyData, setCompanyData] = useState(null);
    const [companyDocs, setCompanyDocs] = useState(null);
    const [companyBank, setCompanyBank] = useState(null);
    const [companyAddress, setCompanyAddress] = useState(null);
    const [editable, setEditable] = useState({ general: false, documents: false, bank: false, address: false });
    const accountTypeLists = [
        { id: 1, value: "Current" },
        { id: 2, value: "Savings" }
    ];

    const currentUserCompanyById = authUser && authUser.CompanyId;
    // console.log("authUser: ", authUser);
    const [form] = Form.useForm();
    const [docForm] = Form.useForm();
    const [bankForm] = Form.useForm();
    const [addressForm] = Form.useForm();

    const [listsOfCountries, setListsOfCountries] = useState([]);
    const [listsOfStates, setListsOfStates] = useState([]);
    // office 
    const [selectedOfficeState, setSelectedOfficeState] = useState('');
    const [selectedOfficeCountry, setSelectedOfficeCountry] = useState('');
    // factory
    const [selectedFactoryState, setSelectedFactoryState] = useState('');
    const [selectedFactoryCountry, setSelectedFactoryCountry] = useState('');

    useEffect(() => {
        const getCompanyDetailsById = async () => {
            try {
                if (currentUserCompanyById) {
                    const response = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
                        params: { companyId: currentUserCompanyById }
                    });
                    console.log("getCompanyDetailsFN: ", response.data);
                    // setCompanyData(response.data.data);
                    // Set form values with API data
                    var data = response.data.data;
                    var bankInfo = response.data.companyBankInfo;
                    var addressInfo = response.data.companyAddressInfo;
                    setCompanyData(data);
                    setCompanyBank(bankInfo);
                    setCompanyAddress(addressInfo);
                    // console.log("data: ", data);
                    // console.log("bankInfo: ", bankInfo);
                    // console.log("addressInfo: ", addressInfo);
                    // setCompanyDocs()
                    form.setFieldsValue({
                        companyName: data.companyName,
                        turnOver: data.turnOver,
                        website: data.website,
                        factoryPhone: data.factoryPhone,
                        factoryMobile: data.factoryMobile,
                        facSTDCode: data.facSTDCode,
                        factoryEmail: data.factoryEmail,
                        majorCustomersServed: data.majorCustomersServed,

                        iso14001: data.ISO14001Cert === true ? 'yes' : data.ISO14001Cert === false ? 'no' : data.ISO14001Cert,
                        isoCert: data.ISOCert === true ? 'yes' : data.ISOCert === false ? 'no' : data.ISOCert,
                        TSCert: data.TSCert === true ? 'yes' : data.TSCert === false ? 'no' : data.TSCert,
                        offPhone: data.offPhone,
                        offMobile: data.offMobile,
                        offEmail: data.offEmail,
                        offSTDCode: data.offSTDCode
                    });

                    addressForm.setFieldsValue({
                        factoryState: addressInfo.factoryState,
                        facPinCode: addressInfo.factoryPin,
                        factoryAddress: addressInfo.factoryAddr,
                        factoryArea: addressInfo.factoryArea,
                        factoryCity: addressInfo.factoryCity,
                        factoryCountry: addressInfo.factoryCountry,
                        // factoryLatitude: addressInfo.factoryLatitude,
                        // factoryLongitude: addressInfo.factoryLongitude,

                        officeState: addressInfo.officeState,
                        officePin: addressInfo.officePin,
                        officeAddress: addressInfo.officeAddr,
                        officeArea: addressInfo.officeArea,
                        officeCity: addressInfo.officeCity,
                        officeCountry: addressInfo.officeCountry,
                        // officeLatitude: addressInfo.officeLatitude,
                        // officeLongitude: addressInfo.officeLongitude,
                    });

                    docForm.setFieldsValue({
                        PAN: data.PAN,
                        GSTIN: data.GSTIN,
                        indLicenseNum: data.indLicenseNum,
                        ownership: data.ownership
                    });

                    // Set form values for Bank Information
                    bankForm.setFieldsValue({
                        bankAccountNumber: bankInfo.bankAccountNumber,
                        accountType: bankInfo.accountType,
                        bankContactNumber: bankInfo.bankContactNumber,
                        bankIFSC: bankInfo.bankIFSC,
                        bankMICR: bankInfo.bankMICR,
                        nameAddressOfBank: bankInfo.nameAddressOfBank,
                        titleOfBankAccount: bankInfo.titleOfBankAccount,
                    });
                }
                // else {
                //     message.warning("Company ID is missing!");
                // }
            } catch (error) {
                console.log("getCompanyDetailsFN error: ", error);
                message.error("Error fetching Company Details");
            }
        };

        const getAllCountries = async () => {
            // console.log("Countries: ", Countries);
            const countriesData = await Countries;
            setListsOfCountries(countriesData);
        }

        getAllCountries();

        const filteredCountries = Countries.filter((country) => (country.iso2 || country.iso3) == companyAddress?.factoryCountry);
        // console.log("filteredCountries: ", filteredCountries);
        if (filteredCountries && filteredCountries.length > 0) {
            setListsOfStates(filteredCountries[0].states);
        }

        getCompanyDetailsById();
    }, [form, docForm, bankForm, addressForm, currentUserCompanyById])

    // Handle Edit Button Click
    const handleEdit = (tab) => {
        setEditable((prev) => ({ ...prev, [tab]: true }));
    };

    const handleCancelEdit = (tab) => {
        setEditable((prev) => ({ ...prev, [tab]: false }));
    };

    // // Handle Update Button Click
    const handleUpdate = async (tab) => {
        let reqItemVal;
        let updatedValues = {};

        if (tab === "general") {
            updatedValues = form.getFieldsValue();
            reqItemVal = {
                companyId: currentUserCompanyById,
                company: true,
                ...updatedValues,
            };
        } else if (tab === "address") {
            updatedValues = addressForm.getFieldsValue();
            reqItemVal = {
                companyId: currentUserCompanyById,
                companyAddress: true,
                ...updatedValues,
            };
        } else if (tab === "bank") {
            updatedValues = bankForm.getFieldsValue();
            reqItemVal = {
                companyId: currentUserCompanyById,
                companyBank: true,
                ...updatedValues,
            };
        }

        // console.log("Updated Values:", reqItemVal);

        try {
            const response = await axios.patch(UPDATE_COMPANY_DETAILS_BY_ID, reqItemVal);
            // console.log("Updated response:", response);
            if (response.status === 200) {
                message.success(`${tab === "general" ? "Company Information" : tab === "address" ? "Company Address" : tab === "bank" ? "Company Bank Details" : "Company Documents"} updated successfully`);
                if (response.data && response.data.record) {
                    setEditable((prev) => ({ ...prev, general: false, bank: false, address: false, documents: false }));
                    var data = response.data.record;
                    if (tab === "general") {
                        setCompanyData(response.data.record);
                        setTimeout(() => {
                            form.setFieldsValue({
                                companyName: data.companyName,
                                turnOver: data.turnOver,
                                website: data.website,
                                factoryPhone: data.factoryPhone,
                                factoryMobile: data.factoryMobile,
                                facSTDCode: data.facSTDCode,
                                factoryEmail: data.factoryEmail,
                                majorCustomersServed: data.majorCustomersServed,

                                iso14001: data.ISO14001Cert == true ? 'yes' : data.ISO14001Cert == false ? 'no' : data.ISO14001Cert,
                                isoCert: data.ISOCert == true ? 'yes' : data.ISOCert == false ? 'no' : data.ISOCert,
                                TSCert: data.TSCert == true ? 'yes' : data.TSCert == false ? 'no' : data.TSCert,
                                offPhone: data.offPhone,
                                offMobile: data.offMobile,
                                offEmail: data.offEmail,
                                offSTDCode: data.offSTDCode
                            });
                        }, 100);
                    } else if (tab === "address") {
                        setCompanyAddress(response.data.record);
                        setTimeout(() => {
                            addressForm.setFieldsValue(data);
                        }, 100);
                    } else if (tab === "bank") {
                        setCompanyBank(response.data.record);
                        setTimeout(() => {
                            bankForm.setFieldsValue(data);
                        }, 100);
                    }

                }
            }
        } catch (error) {
            message.error("Update failed. Please try again.");
            console.error("Update Error:", error);
        }
    };

    const confirmUpdate = (tab) => {
        Modal.confirm({
            title: "Confirm Update",
            content: `Are you sure you want to update ${tab === "general" ? "Company Information" : tab === "address" ? "Company Address" : tab === "bank" ? "Company Bank Details" : "Company Documents"}?`,
            async onOk() {
                await handleUpdate(tab);
            },
        });
    };

    const validateIfscCode = (_, value) => {
        const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!value || ifscPattern.test(value)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Invalid IFSC code. It must be 11 characters, in the format SBIN0005943 (or) IDIB000A090.'));
    };

    const onChangeAccountType = (e) => {
        console.log("onChangeAccountType: ", e);
    }


    const onChangeFactoryState = async (value) => {
        setSelectedFactoryState(value);
    };

    const filterFactoryOptionState = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)


    const onChangeFactoryCountry = (value) => {
        setSelectedFactoryCountry(value);
        // set states as per the country value
        const filteredCountries = Countries.filter((country) => (country.iso2 || country.iso3 || selectedFactoryCountry) == value);
        console.log("filteredCountries: ", filteredCountries);
        setListsOfStates(filteredCountries[0].states)
    };

    const filterFactoryOptionCountry = (input, option) =>
        (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0)


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

    const items = [
        {
            key: "1",
            label: "General Information",
            children: (
                <Form form={form} layout="vertical"> {/* 🔹 Correct form usage */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="companyName" label="Company Name"
                                rules={[
                                    { required: true, message: 'Please enter your Company Name' }]}
                            >
                                {editable.general ? <Input placeholder="Please enter your company name" maxLength={100} /> : companyData?.companyName}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="turnOver" label="Turnover"
                                rules={[
                                    { required: true, message: 'Please enter Company Turn over (In Lakhs)' },
                                    {
                                        pattern: /^\d{1,10}$/, // Regex pattern to match 10 digits
                                        message: 'Please enter a valid turnover (upto 10 digits)',
                                    },]}
                            >
                                {editable.general ? <Input prefix={'Rs'} placeholder="Company Turn over (In Lakhs)" /> : "Rs." + companyData?.turnOver}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="website" label="Company Website" rules={[
                                {
                                    type: 'url',
                                    warningOnly: true,
                                },
                                {
                                    type: 'string',
                                    min: 6,
                                },
                            ]}>
                                {editable.general ? <Input placeholder="www.abc.co.in" /> : companyData?.website}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="iso14001" label="Choose ISO 4001 Certified">
                                {editable.general ? <Select
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
                                /> : companyData?.ISO14001Cert ? "Yes" : "No"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="isoCert" label="Choose ISO Certified">
                                {editable.general ? <Select
                                    placeholder="Choose ISO Certified"
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
                                /> : companyData?.ISOCert ? "Yes" : "No"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="TSCert" label="Choose TS Certified">
                                {editable.general ? <Select
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
                                /> : companyData?.TSCert ? "Yes" : "No"}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="facSTDCode" label="Factory STD Code (Optional)"
                                rules={[
                                    {
                                        message: 'Please enter factory STD code!',
                                    },
                                    {
                                        pattern: /^(\d{2,7})$/, // Regex pattern to match between 2 to 7 digits
                                        message: 'Please enter a valid Factory telephone STD code!',
                                    },
                                ]}>
                                {editable.general ? <Input prefix={'+'} placeholder="Enter STD Code" maxLength={7} /> : companyData?.facSTDCode ? companyData.facSTDCode : "Not Available"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryPhone" label="Factory Telephone (Optional)"
                                rules={[
                                    {
                                        warningOnly: true,
                                        message: 'Please enter factory telephone!',
                                    },
                                    {
                                        pattern: /^(\d{2,12})$/, // Regex pattern to match between 2 to 12 digits
                                        message: 'Please enter a valid factory telephone number!',
                                    },
                                ]}>
                                {editable.general ? <Input placeholder="Enter Telephone Number" maxLength={12} /> : companyData?.factoryPhone ? companyData.factoryPhone : "Not Available"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryMobile" label="Factory Mobile" rules={[
                                {
                                    required: true,
                                    message: 'Please enter your mobile number!',
                                },
                                {
                                    pattern: /^[0-9]{10}$/, // Regex pattern to match exactly 10 digits
                                    message: 'Please enter a valid 10-digit mobile number!',
                                },
                            ]}>
                                {editable.general ? <Input placeholder="Enter your 10-digit mobile number" maxLength={10} /> : companyData?.factoryMobile}
                            </Form.Item>
                        </Col>


                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryEmail" label="Factory Email Address (This is your login Username)"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'Please enter a valid factory email!',
                                    }
                                ]} >
                                {editable.general ? <Input placeholder="Enter factory email address" autoComplete="off" /> : companyData?.factoryEmail}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="offSTDCode" label="Office STD Code"
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
                                {editable.general ? <Input prefix={'+'} placeholder="Enter STD Code" maxLength={7} /> : companyData?.offSTDCode ? companyData.offSTDCode : "Not Available"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="offPhone" label="Office Telephone (Optional)"
                                rules={[
                                    {
                                        warningOnly: true,
                                        message: 'Please enter office telephone!',
                                    },
                                    {
                                        pattern: /^(\d{2,12})$/, // Regex pattern to match between 2 to 12 digits
                                        message: 'Please enter a valid office telephone number!',
                                    },
                                ]}>
                                {editable.general ? <Input /> : companyData?.offPhone ? companyData.offPhone : "Not Available"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="offMobile" label="Office Mobile"
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
                                {editable.general ? <Input placeholder="Enter your 10-digit mobile number" maxLength={10} /> : companyData?.offMobile}
                            </Form.Item>
                        </Col>


                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="offEmail" label="Office Email Address"
                                rules={[
                                    {
                                        required: true,
                                        type: 'email',
                                        message: 'Please enter a valid office email!',
                                    }
                                ]}>
                                {editable.general ? <Input placeholder="Enter office email address" autoComplete="off" /> : companyData?.offEmail}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button onClick={() => handleEdit("general")} disabled={editable.general} type="primary">
                        Edit
                    </Button>
                    {editable.general && (
                        <>
                            <div className="row">
                                <div className="col-auto">
                                    <Button onClick={() => confirmUpdate("general")} type="primary">
                                        Update
                                    </Button>
                                </div>
                                <div className="col-auto">
                                    <Button onClick={() => handleCancelEdit("general")} danger>
                                        Cancel Edit
                                    </Button>
                                </div>
                            </div>


                        </>
                    )}
                </Form>
            ),
        },
        {
            key: "2",
            label: "Company Address Information",
            children: (
                <Form form={addressForm} layout="vertical"> {/* 🔹 Correct form usage */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryAddress" label="Factory Address"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your factory address"
                                    }
                                ]}
                            >
                                {editable.address ? <Input.TextArea rows={4} placeholder="Enter your factory address (100 words)" maxLength={100} showCount /> : companyAddress?.factoryAddr}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryCountry" label="Select your Factory Country" rules={[
                                {
                                    required: true,
                                    message: "Please select your factory country"
                                }
                            ]}>
                                {editable.address ? <Select
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
                                </Select> : companyAddress?.factoryCountry}
                                {/* <Input readOnly={!editable.address} /> */}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryState" label="Factory State">
                                {editable.address ? <Select
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
                                </Select> : companyAddress?.factoryState}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryCity" label="Enter your Factory City" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory city"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid factory city (Allowed only characters)"
                                }
                            ]}>
                                {editable.address ? <Input placeholder='Enter your factory city' autoComplete="off" maxLength={60} /> : companyAddress?.factoryCity}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="factoryArea" label="Enter your Factory Area" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory area"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid factory area (Allowed only characters)"
                                }
                            ]}>
                                {editable.address ? <Input name={'factoryArea'} placeholder='Enter your factory area' autoComplete="off" maxLength={60} /> : companyAddress?.factoryArea}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="facPinCode" label="Enter your Factory PIN code" rules={[
                                {
                                    required: true,
                                    message: "Please enter your factory PIN code"
                                },
                                {
                                    pattern: /^[0-9]{6}$/, // Regex pattern to match exactly 6 digits
                                    message: 'Please enter a valid 6-digit pin code number!',
                                },
                            ]}
                            >
                                {editable.address ? <Input name={'facPinCode'} placeholder='Enter your factory PIN code' /> : companyAddress?.factoryPin}
                            </Form.Item>
                        </Col>
                    </Row>

                    <hr />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="officeAddress" label="Office Address"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your Office address"
                                    }
                                ]}
                            >
                                {editable.address ? <Input.TextArea rows={4} placeholder="Enter your office address (100 words)" maxLength={100} showCount /> : companyAddress?.officeAddr}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="officeCountry" label="Select your Office Country" rules={[
                                {
                                    required: true,
                                    message: "Please select your office country"
                                }
                            ]}>
                                {editable.address ? <Select
                                    showSearch
                                    placeholder="Select your Office Country (or) Enter your Office Country"
                                    optionFilterProp="children"
                                    onChange={onChangeOfficeCountry}
                                    filterOption={filterOfficeOptionCountry}
                                    style={{ width: "90%" }}
                                    value={selectedFactoryCountry}
                                >
                                    {listsOfCountries.map((country) => (
                                        <Select.Option key={country.name} value={country.iso2}>
                                            {country.name}
                                        </Select.Option>
                                    ))}
                                </Select> : companyAddress?.officeCountry ? companyAddress?.officeCountry : "Not Available"}

                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="officeState" label="Office State">
                                {editable.address ? <Select
                                    showSearch
                                    placeholder="Select your office State (or) Enter your office State"
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
                                </Select> : companyAddress?.officeState ? companyAddress?.officeState : "Not Available"}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="officeCity" label="Enter your Office City" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office city"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid office city (Allowed only characters)"
                                }
                            ]}>
                                {editable.address ? <Input placeholder='Enter your office city' autoComplete="off" maxLength={60} /> : companyAddress?.officeCity}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="officeArea" label="Enter your Office Area" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office area"

                                },
                                {
                                    pattern: /^[a-zA-Z]+$/, // valid string
                                    message: "Please enter a valid office area (Allowed only characters)"
                                }
                            ]}>
                                {editable.address ? <Input placeholder='Enter your office area' autoComplete="off" maxLength={60} /> : companyAddress?.officeArea}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="officePin" label="Enter your Office PIN code" rules={[
                                {
                                    required: true,
                                    message: "Please enter your office PIN code"
                                },
                                {
                                    pattern: /^[0-9]{6}$/, // Regex pattern to match exactly 6 digits
                                    message: 'Please enter a valid 6-digit pin code number!',
                                },
                            ]}
                            >
                                {editable.address ? <Input placeholder='Enter your office PIN code' /> : companyAddress?.officePin}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button onClick={() => handleEdit("address")} disabled={editable.address} type="primary">
                        Edit
                    </Button>
                    {editable.address && (
                        <>
                            <div className="row">
                                <div className="col-auto">
                                    <Button onClick={() => confirmUpdate("address")} type="primary">
                                        Update
                                    </Button>
                                </div>
                                <div className="col-auto">
                                    <Button onClick={() => handleCancelEdit("address")} danger>
                                        Cancel Edit
                                    </Button>
                                </div>
                            </div>


                        </>
                    )}
                </Form>
            ),
        },
        {
            key: "3",
            label: "Document Verification",
            children: (
                <Form form={docForm} layout="vertical"> {/* 🔹 Correct form usage */}
                    <h5>You can't modify this section. Please contact support team for further updates.</h5>
                    <hr />
                    <div className="row">
                        <div className="col">
                            <Form.Item name="ownership" label="Ownership">
                                <p>{companyData && companyData.ownership}</p>
                            </Form.Item>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <Form.Item name="PAN" label="PAN">
                                <p>{companyData && companyData.PAN}</p>
                            </Form.Item>
                        </div>
                        <div className="col">
                            <Link to={companyData && companyData.panPdf} target="_blank">View PAN File</Link>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <Form.Item name="GSTIN" label="GSTIN">
                                <p>{companyData && companyData.GSTIN}</p>
                            </Form.Item>
                        </div>
                        <div className="col">
                            <Link to={companyData && companyData.gstInPdf} target="_blank">View GSTIN File</Link>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <Form.Item name="indLicenseNum" label="CIN">
                                <p>{companyData && companyData.indLicenseNum}</p>
                            </Form.Item>
                        </div>
                        <div className="col">
                            <Link to={companyData && companyData.cinPdf} target="_blank">View CIN File</Link>
                        </div>
                    </div>
                    {/* <Button onClick={() => handleEdit("documents")} disabled={editable.documents} type="primary">
                        Edit
                    </Button>
                    {editable.documents && (
                        <Button onClick={() => handleUpdate("documents")} type="primary" style={{ marginLeft: 10 }}>
                            Update
                        </Button>
                    )} */}
                </Form>
            ),
        },
        {
            key: "4",
            label: "Bank Information",
            children: (
                <Form form={bankForm} layout="vertical"> {/* 🔹 Correct form usage */}

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="bankAccountNumber"
                                label="Bank Account Number" rules={[
                                    {
                                        required: true,
                                        message: "Please enter bank account number"
                                    },
                                    {
                                        pattern: /^[0-9]{11,16}$/,
                                        message: "Please provide a valid bank account number"
                                    }
                                ]}
                            >
                                {editable.bank ? <Input placeholder="Enter bank account number" maxLength={16} /> : companyBank?.bankAccountNumber}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item name="accountType"
                                label="Account Type" rules={[
                                    {
                                        required: true,
                                        message: "Please select account type"
                                    }
                                ]}
                            >
                                {/* <Input readOnly={!editable.bank} /> */}
                                {editable.bank ? <Select
                                    placeholder="Select your account type"
                                    onChange={onChangeAccountType}
                                    style={{ width: "90%" }}
                                >
                                    {accountTypeLists.map((account) => (
                                        <Select.Option key={account.id} value={account.value}>
                                            {account.value}
                                        </Select.Option>
                                    ))}
                                </Select> : companyBank?.accountType ? companyBank.accountType : "Not Available"}

                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item label="Bank Contact (Optional)"
                                rules={[
                                    {
                                        message: 'Please enter bank mobile number!',
                                    },
                                    {
                                        pattern: /^[0-9]{10}$/, // Regex pattern to match exactly 10 digits
                                        message: 'Please enter a valid bank mobile number!',
                                    },
                                ]} name="bankContactNumber">
                                {editable.bank ? <Input placeholder="Enter Mobile Number" maxLength={10} /> : companyBank?.bankContactNumber ? companyBank.bankContactNumber : "Not Available"}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item label="Bank IFSC" name="bankIFSC" rules={[
                                {
                                    required: true,
                                    message: 'Please enter your bank IFSC code (Ex: IDIB000A090 or SBIN0005943)',
                                },
                                { validator: validateIfscCode },
                            ]}>
                                {editable.bank ? <Input placeholder="Enter your bank branch IFSC Code (Ex: IDIB000A090 or SBIN0005943)" maxLength={11} /> : companyBank?.bankIFSC ? companyBank.bankIFSC : "Not Available"}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item label="Bank Branch MICR Code" name="bankMICR" rules={[
                                {
                                    required: true,
                                    message: 'Please enter your bank MICR code (Ex: 600002025)',
                                },
                                {
                                    pattern: /^[0-9]{1,9}$/,
                                    message: 'Please enter a valid bank MICR code! (Ex: 600002025)',
                                },
                            ]}>
                                {editable.bank ? <Input readOnly={!editable.bank} /> : companyBank?.bankMICR ? companyBank.bankMICR : "Not Available"}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item label="Bank Account Name" rules={[
                                {
                                    required: true,
                                    message: "Please enter bank account name"
                                },
                            ]} name="titleOfBankAccount">
                                {editable.bank ? <Input placeholder="Enter title of account in the bank" maxLength={150} /> : companyBank?.titleOfBankAccount ? companyBank.titleOfBankAccount : "Not Available"}
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Form.Item label="Bank Address (optional)" rules={[
                                {
                                    message: "Please enter bank address"
                                }
                            ]} name="nameAddressOfBank">
                                {editable.bank ? <Input.TextArea rows={4} placeholder="Enter your bank address (100 words)" maxLength={100} showCount /> : companyBank?.nameAddressOfBank ? companyBank.nameAddressOfBank : "Not Available"}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button onClick={() => handleEdit("bank")} disabled={editable.bank} type="primary">
                        Edit
                    </Button>
                    {editable.bank && (
                        <>
                            <div className="row">
                                <div className="col-auto">
                                    <Button onClick={() => confirmUpdate("bank")} type="primary">
                                        Update
                                    </Button>
                                </div>
                                <div className="col-auto">
                                    <Button onClick={() => handleCancelEdit("bank")} danger>
                                        Cancel Edit
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            ),
        },
    ];

    if (!companyData) return <p>Loading...</p>;

    return (
        <div className="container">
            {/* <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button> */}
            <h3 className='text-center'>Company Profile</h3>
            <hr />
            <Tabs defaultActiveKey="1" size='large' items={items} />
        </div>
    )
}

export default Profile