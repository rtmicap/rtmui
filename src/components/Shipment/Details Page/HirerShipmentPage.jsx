import { Button, DatePicker, Form, message, Select, Spin, Upload, Input, notification, Tooltip, Flex, Collapse } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    MinusCircleOutlined,
    SyncOutlined,
    ReloadOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    CloseOutlined,
    PaperClipOutlined,
    UploadOutlined,
    LoadingOutlined
} from '@ant-design/icons';
const { TextArea } = Input;
import React, { useEffect, useState } from 'react';
import { LeftCircleOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import { useAuth } from '../../../contexts/AuthContext';
import axios from '../../../api/axios';
import { formattedDateTime } from '../../../utils/utils';
import { CREATE_SHIPMENT_URL, FILE_UPLOAD_URL, GET_SHIPMENT_BY_ORDERID_URL, UPDATE_SHIPMENT_URL } from '../../../api/apiUrls';
import { typesOfGoods, uomChoices } from '../../../utils/selectOptionUtils';
import ShipmentDetails from '../ShipmentDetails/ShipmentDetails';

function HirerShipmentPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewShipment } = location.state || {};
    const navigate = useNavigate();

    const currentUserCompanyId = authUser && authUser.CompanyId;

    const [form] = Form.useForm();
    const [shipmentDateTime, setShipmentDateTime] = useState('');
    // edit the materials
    const [isReview, setIsReview] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    // Note: fileUrls will be [url1, url2 ....]
    const [fileUrls, setFileUrls] = useState({});
    const [invoiceFile, setInvoiceFile] = useState('');
    const [invoiceFileLoading, setInvoiceFileLoading] = useState(false);
    const [invoiceFileList, setInvoiceFileList] = useState([]);
    // shipment data
    const [shipmentData, setShipmentData] = useState([]);

    const [imageFileIsLoading, setImageFileIsLoading] = useState(false);
    const [fileIsLoading, setFileIsLoading] = useState(false);

    // if (!order) {
    //     return <div>No order data found!</div>;
    // }

    const getShipmentByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${order.order_id}`);
            console.log("getShipmentByOrderId: ", response.data);
            setShipmentData(response.data.result);
        } catch (error) {
            message.error("Something error while fetching shipment data!");
            console.log("shipment data err: ", error);
            setShipmentData([]);
        }
    }

    const fetchShipmentDetails = async (orderId) => {
        try {
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${orderId}`);
            console.log("fetchShipmentDetails: ", response.data);
            if (response && response.data && response.data.result.length > 0) {
                // Initialize an empty object to store the file URLs
                let newFileUrls = {};
                // Format the shipment details and populate fileUrls
                const formattedDetails = response.data.result.map((detail, index) => {
                    // Check if an image is available and set it in fileUrls
                    if (detail.image) {
                        newFileUrls[index] = detail.image;
                    }

                    // Optional: If you want to store invoices in a separate index or field, uncomment this
                    // if (detail.invoice) {
                    //     newFileUrls[`invoice_${index}`] = detail.invoice;
                    // }

                    // Return the formatted shipment detail
                    return {
                        shipment_id: detail.shipment_id, // Remap the field for form compatibility
                        typeofgoods: detail.type_of_goods, // Remap the field for form compatibility
                        quantity: detail.quantity,
                        description: detail.description,
                        UOM: detail.UOM,
                        image: detail.image,  // Ensure the form field has the image URL
                        invoice: detail.invoice, // Add invoice URL to the form if needed
                    };
                });

                // Set the file URLs for the images
                setFileUrls(newFileUrls);
                console.log("newFileUrls: ", newFileUrls);

                // Set the formatted shipment details and datetime in the form
                form.setFieldsValue({
                    shipment_details: formattedDetails,
                    shipment_datetime: moment(response.data.result[0].shipment_date), // Assuming shipment_date exists
                    invoice: response.data.result[0].invoice// Assuming shipment_date exists
                });

                console.log("formattedDetails: ", formattedDetails);
            }
        } catch (error) {
            console.error("Error fetching shipment details:", error);
        }
    };


    // Set review mode and trigger shipment fetching when reviewShipment is true
    useEffect(() => {
        if (reviewShipment && !isReview) {
            setIsReview(true);
        }
    }, [reviewShipment]);

    useEffect(() => {
        if (!reviewShipment) {
            getShipmentByOrderId();
        }
    }, []);

    // Fetch shipment details when isReview becomes true
    useEffect(() => {
        if (isReview) {
            fetchShipmentDetails(order.order_id);
        }
    }, [isReview, order.order_id]);

    const resetForm = () => {
        form.resetFields();
    }

    const onOk = (value) => {
        console.log('onOk: ', value);
    };

    // File Upload API
    const uploadFileToServer = async (file, name) => {
        const formData = new FormData();
        formData.append('fileName', file);
        try {
            const response = await axios.post(FILE_UPLOAD_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // console.log("response. file backblazedata: ", response.data);
            setFileUrls((prev) => ({
                ...prev,
                [name]: response.data.fileUrl,
            }));

            return response.data.fileUrl;
        } catch (error) {
            console.error("Error uploading file: ", error);
            message.error('File upload failed');
            return null;
        }
    };

    const handleInvoiceChange = async (info, name) => {
        console.log("handleInvoiceChange: ", info);
        try {
            setInvoiceFileLoading(true);
            const fileUrl = await uploadFileToServer(info.fileList[0].originFileObj);
            const isPdf = info.fileList[0].type === 'application/pdf';
            const isLt2M = info.fileList[0].size / 1024 / 1024 < 2;

            if (!isPdf) {
                // Show error message for non-PDF files
                message.warning('You can only upload PDF file!');
                console.warn('You can only upload PDF file!');
                setInvoiceFileLoading(false);
            } else if (!isLt2M) {
                // Show error message for files larger than 2MB
                message.warning('File must be smaller than 2MB!');
                console.warn('File must be smaller than 2MB!');
                setInvoiceFileLoading(false);
            } else {
                setInvoiceFileList(info.fileList);
                setInvoiceFile(fileUrl);
                setInvoiceFileLoading(false);
                message.success("Invoice File Uploaded!");
            }

        } catch (error) {
            console.error('File upload error:', error);
            message.error('File upload failed. Please try again.');
            setInvoiceFileLoading(false);
        }
    };

    const handleImageChange = async (info, name) => {
        console.log("handleInvoiceChange: ", info);
        try {
            setImageFileIsLoading(true);
            // const isImageFormat = info.fileList[0].type === 'application/jpg' || 'application/jpeg' || 'application/png';
            const isImageFormat = ['image/jpeg', 'image/jpg', 'image/png'].includes(info.fileList[0].type);
            const isLt2M = info.fileList[0].size / 1024 / 1024 < 2;

            if (!isImageFormat) {
                // Show error message for non-PDF files
                message.warning('You can only upload JPEG, JPG, PNG files!');
                console.warn('You can only upload JPEG, JPG, PNG files!');
                setImageFileIsLoading(false);
            } else if (!isLt2M) {
                // Show error message for files larger than 2MB
                message.warning('File must be smaller than 2MB!');
                console.warn('File must be smaller than 2MB!');
                setImageFileIsLoading(false);
            } else {
                const fileUrl = await uploadFileToServer(info.fileList[0].originFileObj, name);
                setFileUrls((prev) => ({
                    ...prev,
                    [name]: fileUrl,
                }));
                setImageFileIsLoading(false);
                message.success(`Image File Uploaded!`);
            }
        } catch (error) {
            console.error('File upload error:', error);
            message.error('File upload failed. Please try again.');
            setImageFileIsLoading(false);
        }
    };

    const handleFileRemove = (name) => {
        setFileUrls((prev) => {
            const updatedUrls = { ...prev };
            delete updatedUrls[name];
            return updatedUrls;
        });
    };


    const notifyMissingInvoice = () => {
        notification.error({
            message: 'Invoice is Required',
            description: 'Please attach an invoice file when selecting "Invoice" as the type of goods.',
            duration: 4,
        });
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    const updateShipmentFn = async () => {
        try {
            const data = form.getFieldsValue();
            data.orderid = order.order_id;
            data.shipment_details = form.getFieldValue(['shipment_details'])
            console.log("updateShipmentFn: ", data);
            const response = await axios.patch(UPDATE_SHIPMENT_URL, data);
            console.log("response update ship: ", response);
            message.success(response.data.message);
            setIsReview(false);
            navigate(-1); // redirect to previous page
        } catch (error) {
            message.error("There is some error while updating the shipment!");
            console.log("shipment update err: ", error);
        }

    }

    const onFinish = async (values) => {
        values.orderid = order.order_id;
        values.shipment_datetime = shipmentDateTime;
        values.goods_status = "goods_in_transit";
        values.invoice = invoiceFile;
        values.received_quantity = values.quantity
        try {
            console.log('Success:', values);
            // ... handle form submission
            const updatedShipmentDetails = await Promise.all(
                values.shipment_details.map(async (detail, index) => {
                    let updatedDetail = { ...detail };
                    if (fileUrls[index]) {
                        updatedDetail.image = fileUrls[index];
                    }
                    return updatedDetail;
                })
            );
            const finalValues = { ...values, shipment_details: updatedShipmentDetails };
            const shipmentRes = await axios.post(CREATE_SHIPMENT_URL, finalValues);
            console.log("shipmentRes: ", shipmentRes);
            message.success(shipmentRes.data.message);
            navigate(-1); // redirect to previous page

        } catch (error) {
            console.error('Shipment error:', error);
            message.error('Shipment failed. Please try again.');
            resetForm(); // clear the form data
        }
    };

    const handleSelectChange = (value, name) => {
        console.log("handleSelectChange name: ", name);
        console.log("handleSelectChange value: ", value);
        form.setFieldsValue({ [name]: value });
    };

    const disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().startOf('day');
    };

    const handleInvoiceRemove = () => {
        setInvoiceFileList([]);
        setInvoiceFile('');
        form.setFieldsValue({
            invoice: '',  // Reset the specific field by setting it to an empty string
        });
    };

    const collapseItems = shipmentData.map((item, index) => ({
        key: item.id,
        label: `Shipment ID: ${item.shipment_id}`,
        children: (
            <div className='row'>
                <div className="col">
                    <p><strong>Types of Goods:</strong> {item.type_of_goods}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>UOM:</strong> {item.UOM}</p>
                    <p><strong>Shipment Date:</strong> {formattedDateTime(item.shipment_date)}</p>
                    {item.image && (
                        <p><strong>Invoice Report:</strong> <Link to={item.invoice} target={'_blank'}>View Invoice</Link></p>
                    )}
                    {item.image && (
                        <p><strong>Image:</strong> <Link to={item.image} target={'_blank'}>View Image</Link></p>
                    )}
                </div>
            </div>
        ),
    }));

    return (
        <>
            <h3 className='text-center'>Hirer shipment page</h3>
            <hr />
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <h5 className='text-center'>Shipment for (ID: {order.quote_id})</h5>
                <hr />
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout='vertical'
                    form={form}
                    initialValues={{
                        shipment_details: [
                            {
                                typeofgoods: 'raw_material', // Default type of goods
                            },
                        ],
                    }}
                >
                    {/* Shipment Date Time */}
                    <div className='row'>
                        <div className="col">
                            <Form.Item
                                label="Shipment Date Time"
                                name="shipment_datetime"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your shipment date & time!',
                                    },
                                ]}
                                required
                            >
                                <DatePicker
                                    disabledDate={disabledDate}
                                    showTime={{
                                        format: 'hh:mm A',
                                        use12Hours: true,
                                    }}
                                    name='shipment_date'
                                    onChange={(value, dateString) => {
                                        console.log('Selected Time: ', value);
                                        console.log('Formatted Selected Time: ', dateString);
                                        setShipmentDateTime(dateString);
                                    }}
                                    onOk={onOk}
                                    placeholder="Select shipment date"
                                />
                            </Form.Item>
                        </div>

                        <div className="col">
                            <Form.Item
                                label="Attach Invoice File"
                                name={'invoice'}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Invoice file is required!',
                                    },
                                ]}
                            >
                                <Flex gap="small" wrap>
                                    {!invoiceFile && (
                                        <Upload
                                            fileList={invoiceFileList}
                                            onChange={(info) => handleInvoiceChange(info, 'invoice')}
                                            beforeUpload={() => false}
                                            accept=".pdf"
                                            maxCount={1}
                                        >
                                            <Button loading={invoiceFileLoading} type={'primary'} icon={<PlusCircleOutlined />}>{invoiceFileLoading ? 'Uploading...' : 'Attach invoice'} </Button>
                                            <p>Max: 2 MB (Only PDF Format)</p>
                                        </Upload>
                                    )}

                                    {invoiceFile && (
                                        <div className='col-auto'>
                                            <div>
                                                <Link to={invoiceFile} target={'_blank'}>View Invoice File</Link>
                                                <Button type="link" onClick={handleInvoiceRemove}>Remove</Button>
                                            </div>
                                        </div>
                                    )}

                                </Flex>
                            </Form.Item>

                        </div>
                    </div>

                    {/* Other Data to update */}
                    <div className="row">
                        <div className="col">
                            <Form.List name="shipment_details">
                                {(fields, { add, remove }) => {
                                    // const typeOfGoods = form.getFieldValue(['shipment_details', name, 'typeofgoods']);
                                    // const isInvoice = typeOfGoods === 'invoice';
                                    return (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => {
                                                return (
                                                    <div className='row' key={key}>
                                                        <h6>Shipment Details - {name + 1}</h6>
                                                        <div className="col">
                                                            <Form.Item
                                                                label="Type of Goods"
                                                                {...restField}
                                                                name={[name, 'typeofgoods']}
                                                                value={selectedItems}
                                                                onChange={setSelectedItems}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: 'Please input your type of goods!',
                                                                    },
                                                                ]}
                                                            >
                                                                <Select
                                                                    placeholder='Choose type of goods'
                                                                    style={{
                                                                        width: 'auto'
                                                                    }}
                                                                    onChange={handleSelectChange}
                                                                    options={typesOfGoods}
                                                                />
                                                            </Form.Item>
                                                        </div>

                                                        <>
                                                            <div className="col">
                                                                <Form.Item
                                                                    label="Description"
                                                                    {...restField}
                                                                    name={[name, 'description']}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: 'Please input your description!',
                                                                        },
                                                                    ]}
                                                                    required
                                                                >
                                                                    <TextArea rows={3} placeholder="Enter your description (max: 200 words)" maxLength={200} showCount />
                                                                </Form.Item>
                                                            </div>

                                                            <div className="col">
                                                                <Form.Item
                                                                    label="Shipment Qty"
                                                                    {...restField}
                                                                    name={[name, 'quantity']}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: 'Please input your shipment quantity!',
                                                                        },
                                                                        {
                                                                            pattern: /^\d{1,5}$/, // Regex pattern to match 10 digits
                                                                            message: 'Please enter a valid number! (upto 5 digits)',
                                                                        },
                                                                    ]}
                                                                    required
                                                                >
                                                                    <Input placeholder='Enter shipment quantity' />
                                                                </Form.Item>
                                                            </div>

                                                            <div className="col">
                                                                <Form.Item
                                                                    label={"UOM"}
                                                                    {...restField}
                                                                    name={[name, 'UOM']}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: 'Please input your UOM!',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Select placeholder='Choose UOM' style={{ width: '100%' }} options={uomChoices} />
                                                                </Form.Item>
                                                            </div>

                                                            {!fileUrls[name] && <div className="col-auto mt-4">
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'image']}
                                                                >
                                                                    <Upload
                                                                        valuePropName="file"
                                                                        getValueFromEvent={(e) => {
                                                                            if (Array.isArray(e)) {
                                                                                return e;
                                                                            }
                                                                            return e && e.file;
                                                                        }}
                                                                        onChange={(info) => handleImageChange(info, name)}
                                                                        beforeUpload={() => false}
                                                                        accept=".jpg,.jpeg,.png"
                                                                        maxCount={1}
                                                                        showUploadList={false}
                                                                    >
                                                                        <Button loading={imageFileIsLoading} type={'primary'} icon={<PlusCircleOutlined />}>{imageFileIsLoading ? 'Uploading...' : 'Attach Image'} </Button>
                                                                        <p>Max: 2 MB (Accept jpg,jpeg,png Formats)</p>
                                                                    </Upload>
                                                                </Form.Item>

                                                            </div>
                                                            }

                                                            {fileUrls[name] && (
                                                                <div className='col-auto mt-4'>
                                                                    <div>
                                                                        <Link to={fileUrls[name]} target={'_blank'}>View File</Link>
                                                                        <Button type="link" onClick={() => handleFileRemove(name)}>Remove</Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>

                                                        <div className="col-auto mt-4">
                                                            {fields.length > 1 && (
                                                                <Tooltip title="Remove this shipment detail">
                                                                    <Button type="primary" danger icon={<CloseOutlined />} onClick={() => remove(name)} />
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <Form.Item>
                                                {fields.length < 4 && (
                                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                        Add more shipment details (Upto 4)
                                                    </Button>
                                                )}
                                            </Form.Item>
                                        </>
                                    )
                                }}
                            </Form.List>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="row">
                        <div className="col">
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
                {/* Lists of shipment details */}
                <>
                    <ShipmentDetails order_id={order.order_id} />
                </>
            </div>
        </>
    )
}

export default HirerShipmentPage