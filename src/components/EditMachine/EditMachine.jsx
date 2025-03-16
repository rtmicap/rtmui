import { Button, Col, Drawer, Modal, Flex, Form, Input, message, Row, Select, Space, Spin, Upload, Tooltip, Image,Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FILE_UPLOAD_URL, GET_MACHINES_BY_MACHONE_ID } from '../../api/apiUrls';
import axios from '../../api/axios';
import { Cutting } from '../Machine Variable Fields/Cutting';
import { Drilling } from '../Machine Variable Fields/Drilling';
import { Milling } from '../Machine Variable Fields/Milling';
import { Grinding } from '../Machine Variable Fields/Grinding';
import { Turning } from '../Machine Variable Fields/Turning';
import { LoadingOutlined, LeftCircleOutlined, UploadOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
const { TextArea } = Input;
const { Text } = Typography;

function EditMachine({ machineId, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [singleMachineData, setSingleMachineData] = useState({});
    const [fileLoading, setFileLoading] = useState(false);
    const [machineImageList, setMachineImageList] = useState([]);
    const [viewUploadedImage, setViewUploadedImage] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [isFieldDisabled, setIsFieldDisabled] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const machineCategories = { Cutting, Drilling, Milling, Grinding, Turning }; // Add all your machine categories

    const { machineData } = location.state || {};

    const [uploadedFileUrl, setUploadedFileUrl] = useState(machineData.Machine_Photo || "");

    const nonEditable = ["brand", "model", "yearOfPurchase", "type", "noOfMachines", "Category", "Machine_Type"];

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
            const filteredFields = selectedFields.filter(field => nonEditable.includes(field.name));
            setIsFieldDisabled(filteredFields.length > 0);
            console.log("selectedFields: ", selectedFields);
            console.log("machineData.Comments ", machineData.Comments == "undefined");
            // console.log("filteredFields: ", filteredFields);
            // add other fields apart from json fields
            form.setFieldsValue({
                Category: machineData.Category,
                Machine_Type: machineData.Machine_Type,
                Comments: (machineData.Comments == undefined || machineData.Comments == "undefined") ? '' : machineData.Comments,
                noOfMachines: machineData.variable_fields?.noOfMachines, // Include only noOfMachines
            });
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

    // const fileUpload = async (file) => {
    //     try {
    //         const configHeaders = {
    //             headers: { "content-type": "multipart/form-data" },
    //         };
    //         const formData = new FormData();
    //         formData.append("fileName", file.originFileObj);
    //         var response = await axios.post(FILE_UPLOAD_URL, formData, configHeaders);
    //         // console.log("responseFileData: ", response);
    //         return response.data;
    //     } catch (error) {
    //         return error;
    //     }
    // }

    const handlePreviewFileChange = (info) => {
        const file = info.fileList[0]?.originFileObj; // Get selected file

        if (!file) {
            setPreviewFile(null);
            setPreviewUrl(null);
            return;
        }

        if (file.size / 1024 / 1024 >= 2) { // File size validation (Max 2MB)
            message.error('File size must be less than 2MB');
            setPreviewFile(null);
            setPreviewUrl(null);
            return;
        }

        setPreviewFile(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const fileReader = new FileReader();
            fileReader.onload = () => setPreviewUrl(fileReader.result);
            fileReader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }

        message.success("File ready to upload. Click 'Upload' to confirm.");
    };


    const handleUploadFile = async () => {
        if (!previewFile) {
            message.error("No file selected for upload");
            return;
        }

        setFileLoading(true);
        setIsSubmitDisabled(true);

        try {
            const configHeaders = { headers: { "content-type": "multipart/form-data" } };
            const formData = new FormData();
            formData.append("fileName", previewFile);

            const response = await axios.post(FILE_UPLOAD_URL, formData, configHeaders);
            setUploadedFileUrl(response.data.fileUrl);
            message.success("File uploaded successfully!");
        } catch (error) {
            message.error("File upload failed");
        }

        setFileLoading(false);
        setIsSubmitDisabled(false);
        setPreviewFile(null); // Clear the preview after upload
    };

    const handleRemoveFile = () => {
        setPreviewFile(null);
        message.info("File removed. Select a new file.");
    };


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
            Machine_Photo: viewUploadedImage,
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

    const showConfirm = async () => {
        try {
            // Validate form fields first
            await form.validateFields();
            // If validation passes, show confirmation modal
            Modal.confirm({
                title: "Are you sure you want to update?",
                content: "This action will save the changes.",
                okText: "Yes, Update",
                cancelText: "Cancel",
                onOk() {
                    form.submit(); // Submit the form if confirmed
                },
            });
        } catch (error) {
            console.error("Validation failed:", error);
        }
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
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    name={"Category"}
                                    label={"Category"}
                                    tooltip={{
                                        title: `You can't update the field`,
                                        icon: <InfoCircleOutlined />,
                                    }}
                                >
                                    <Input readOnly={nonEditable.includes("Category")} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name={"Machine_Type"}
                                    label={"Machine Type"}
                                    tooltip={{
                                        title: `You can't update the field`,
                                        icon: <InfoCircleOutlined />,
                                    }}
                                >
                                    <Input readOnly={nonEditable.includes("Machine_Type")} />
                                </Form.Item>
                            </Col>
                        </Row>
                        {fields.map((field) => (
                            <Form.Item
                                key={field.name}
                                name={field.name}
                                label={field.label}
                                rules={[{ required: true, message: `Please enter ${field.label}` }]}
                                tooltip={nonEditable.includes(field.name) ? {
                                    title: `You can't update the field`,
                                    icon: <InfoCircleOutlined />,
                                } : ''}
                            >
                                {field.type === "text" || field.type === "number" ? (
                                    <Input placeholder={field.placeholder} maxLength={field.maxLength} readOnly={nonEditable.includes(field.name)} />
                                ) : field.type === "select" ? (
                                    <Select placeholder={field.placeholder} disabled={nonEditable.includes(field.name)}>
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
                                <Form.Item label={'Comments (optional)'} name={'Comments'} rules={[{ message: `Please input the comments` }]}>
                                    <TextArea rows={4} placeholder="Enter Comments (Max 100 words)" maxLength={100} showCount allowClear />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item label="Upload Machine Image" name={'Machine_Photo'} tooltip={{
                                    title: 'Image size must be max 2MB',
                                    icon: <InfoCircleOutlined />,
                                }} rules={[
                                    {
                                        message: 'Please upload machine image!',
                                    },
                                ]}>
                                    {/* <Flex gap="small" wrap>
                                        <Upload
                                            fileList={machineImageList}
                                            onChange={handleImageFileChange}
                                            maxCount={1}
                                            accept=".png,.jpeg,.jpg,.pdf"
                                            beforeUpload={() => false}
                                            onRemove={handleImageRemove}
                                            data={(file) => file.fileName = "FOO"}
                                        >
                                            <Button loading={fileLoading} icon={<UploadOutlined />}>{fileLoading ? 'Uploading..' : 'Update Machine Image'}</Button>
                                        </Upload>
                                        {viewUploadedImage &&
                                            <Link to={viewUploadedImage} target={'_blank'}>View Uploaded Image</Link>
                                        }
                                    </Flex><br /> */}
                                    {/* <Flex gap="small" wrap>
                                        <Upload
                                            fileList={previewFile ? [{ uid: '-1', name: previewFile.name }] : []}
                                            onChange={handlePreviewFileChange}
                                            maxCount={1}
                                            accept=".png,.jpeg,.jpg,.pdf"
                                            beforeUpload={() => false}  // Prevent auto-upload
                                            onRemove={handleRemoveFile}
                                        >
                                            <Button icon={<UploadOutlined />}>Update Image/File</Button>
                                        </Upload>

                                       
                                        {previewFile && (
                                            <div style={{ marginTop: 15 }}>
                                                {previewUrl ? (
                                                    <Image width={100} src={previewUrl} alt="Preview" />
                                                ) : (
                                                    <p>{previewFile.name}</p>
                                                )}

                                                <Button icon={<DeleteOutlined />} onClick={handleRemoveFile} danger>
                                                    Remove
                                                </Button>

                                                <Button
                                                    type="primary"
                                                    onClick={handleUploadFile}
                                                    loading={fileLoading}
                                                    disabled={isSubmitDisabled}
                                                    style={{ marginLeft: 10 }}
                                                >
                                                    {fileLoading ? 'Uploading...' : 'Upload'}
                                                </Button>
                                            </div>
                                        )}


                                        {uploadedFileUrl && (
                                            <Link to={uploadedFileUrl} target={'_blank'}>View Existing File</Link>
                                        )}
                                    </Flex> */}
                                    <Flex gap="small" wrap align="center">
                                        {/* File Upload Button */}
                                        <Upload
                                            fileList={previewFile ? [{ uid: '-1', name: previewFile.name }] : []}
                                            onChange={handlePreviewFileChange}
                                            maxCount={1}
                                            accept=".png,.jpeg,.jpg,.pdf"
                                            beforeUpload={() => false}  // Prevent auto-upload
                                            onRemove={handleRemoveFile}
                                        >
                                            <Button icon={<UploadOutlined />}>Update Image/File</Button>
                                        </Upload>

                                        {/* Preview Section */}
                                        {previewFile && (
                                            <Flex vertical gap="small" style={{ marginTop: 10 }}>
                                                {previewUrl ? (
                                                    <Image width={100} src={previewUrl} alt="Preview" />
                                                ) : (
                                                    <Text strong>{previewFile.name}</Text>
                                                )}

                                                <Flex gap="small">
                                                    <Button icon={<DeleteOutlined />} onClick={handleRemoveFile} danger>
                                                        Remove
                                                    </Button>

                                                    <Button
                                                        type="primary"
                                                        onClick={handleUploadFile}
                                                        loading={fileLoading}
                                                        disabled={isSubmitDisabled}
                                                    >
                                                        {fileLoading ? 'Uploading...' : 'Upload'}
                                                    </Button>
                                                </Flex>
                                            </Flex>
                                        )}

                                        {/* Show Uploaded File Link */}
                                        {uploadedFileUrl && (
                                            <Text>
                                                <Link to={uploadedFileUrl} target="_blank">View Existing File</Link>
                                            </Text>
                                        )}
                                    </Flex>
                                    {/* {machineData.Machine_Photo && <Link to={machineData.Machine_Photo} target={'_blank'}>View Existing File</Link>} */}
                                </Form.Item>

                                {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                                </div> */}
                            </Col>
                        </Row>
                        {!loading &&
                            <Button type="primary" onClick={showConfirm} disabled={isSubmitDisabled ? true : false}>
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