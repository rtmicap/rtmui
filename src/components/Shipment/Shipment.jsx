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
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import { CREATE_SHIPMENT_URL, FILE_UPLOAD_URL, GET_SHIPMENT_BY_ORDERID_URL, UPDATE_SHIPMENT_URL } from '../../api/apiUrls';
import dayjs from 'dayjs';
import { receiptConfirmation, typesOfGoods, uomChoices } from '../Orders/OrderUtils';
import { formattedDateTime } from '../../utils/utils';
import moment from 'moment/moment';
import HirerShipmentPage from './Details Page/HirerShipmentPage';
import RenterShipmentPage from './Details Page/RenterShipmentPage';

function Shipment() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewShipment } = location.state || {};
    const navigate = useNavigate();

    const currentUserCompanyId = authUser.CompanyId;

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
          

            {authUser && currentUserCompanyId == order.hirer_company_id ?
                <HirerShipmentPage />
                : authUser && currentUserCompanyId == order.renter_company_id ?
                    <RenterShipmentPage />
                    : <h4 className='text-center'>Something went wrong</h4>
            }
        </>
    )
}

export default Shipment