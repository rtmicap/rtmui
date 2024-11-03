import { Button, DatePicker, Form, message, Select, Spin, Upload, Input, notification, Tooltip, Flex, Collapse, Table, Space } from 'antd';
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
import { receiptConfirmation, typesOfGoods, uomChoices } from '../../Orders/OrderUtils';
import { CREATE_SHIPMENT_URL, FILE_UPLOAD_URL, GET_SHIPMENT_BY_ORDERID_URL, UPDATE_SHIPMENT_URL } from '../../../api/apiUrls';

function RenterShipmentPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewShipment } = location.state || {};
    const navigate = useNavigate();
    // shipment data
    const [shipmentData, setShipmentData] = useState([]);
    const [form] = Form.useForm();
    const [shipments, setShipments] = useState([]);

    const getShipmentByOrderId = async () => {
        try {
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${order.order_id}`);
            console.log("Renter getShipmentByOrderId: ", response.data);
            setShipmentData(response.data.result);
        } catch (error) {
            message.error("Something error while fetching shipment data!");
            console.log("shipment data err: ", error);
            setShipmentData([]);
        }
    }

    const handleStatusChange = (value, shipmentId) => {
        const updatedShipments = shipmentData.map((shipment) =>
            shipment.shipment_id === shipmentId
                ? { ...shipment, received_status: value }
                : shipment
        );
        setShipments(updatedShipments);
    };

    const columns = [
        {
            title: 'Shipment ID',
            dataIndex: 'shipment_id',
            key: 'shipment_id',
            //   render: (text) => <a>{text}</a>,
        },
        {
            title: 'Type of Goods',
            dataIndex: 'type_of_goods',
            key: 'type_of_goods',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'UOM',
            key: 'UOM',
            dataIndex: 'UOM',
        },
        {
            title: 'Quantity',
            key: 'quantity',
            dataIndex: 'quantity',
        },
        {
            title: 'Image',
            key: 'image',
            dataIndex: 'image',
            render: (img) => <> {img ? <Link target={'_blank'} to={img}>View Image</Link> : <p>Image not uploaded</p>}</>,
        },
        {
            title: 'Invoice',
            key: 'invoice',
            dataIndex: 'invoice',
            render: (inv) => <><Link target={'_blank'} to={inv}>View Invoice</Link></>,
        },
        {
            title: 'Shipment Date',
            key: 'shipment_date',
            dataIndex: 'shipment_date',
            render: (date) => <>{formattedDateTime(date)}</>,
        },
        {
            title: 'Received Status',
            dataIndex: 'received_status',
            key: 'received_status',
            render: (received_status, record) => (
                <Select
                    name={'received_status'}
                    // value={received_status}
                    onChange={(value) => handleStatusChange(value, record.shipment_id)}
                    options={[
                        { value: 'received_in_full', label: 'Received in Full' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'partial', label: 'Partial' },
                        { value: 'other_status', label: 'Other Status' },
                    ]}
                    placeholder={'Select status'}
                    style={{ width: 150 }}
                />
            ),
        },
    ];



    const updateShipmentFn = async (data) => {
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

    useEffect(() => {
        getShipmentByOrderId();
    }, []);

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    const handleSave = async () => {
        const updatedShipments = shipments.filter(shipment => shipment.received_status);
        try {
            await axios.put(UPDATE_SHIPMENT_URL, { shipment_details: updatedShipments, orderid: order.order_id });
            console.log('Shipments updated successfully', updatedShipments);
        } catch (error) {
            console.error('Failed to update shipments:', error);
        }
    };

    return (
        <>
            <h4 className='text-center'>Renter shipment page</h4>
            <hr />
            <div className="container">
                <div className="row">
                    <div className="col">
                        <p><span style={{ fontWeight: 'bold' }}>Note:</span>&nbsp;<span style={{ color: "red" }}>You can't modify any of the below fields except receipt confirmation</span></p>
                    </div>
                </div>
                <Table columns={columns} dataSource={shipmentData} pagination={false} />
                {/* <Form
                    name="basic"
                    // onFinish={isReview ? updateShipmentFn : onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout='vertical'
                    form={form}
                >
                    <Form.Item
                        label="Receipt Confirmation"
                        name={'received_status'}
                        rules={[
                            {
                                required: true,
                                message: 'Please input receipt confirmation!',
                            },
                        ]}
                    >
                        <Select placeholder='Choose Receipt Confirmation' style={{ width: '100%' }} options={receiptConfirmation} />
                    </Form.Item>
                </Form> */}
                <Space style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Space>
            </div>
        </>
    )
}

export default RenterShipmentPage