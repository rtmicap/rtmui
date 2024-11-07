import { Button, DatePicker, Form, message, Select, Spin, Upload, Input, notification, Tooltip, Flex, Collapse, Table, Space, Modal } from 'antd';
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
import { receiptConfirmation } from '../../../utils/selectOptionUtils';

function RenterShipmentPage() {
    const location = useLocation();
    const { authUser } = useAuth();
    const { order, reviewShipment } = location.state || {};
    const navigate = useNavigate();
    // shipment data
    const [shipmentData, setShipmentData] = useState([]);
    const [form] = Form.useForm();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(false);

    const getShipmentByOrderId = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${order.order_id}`);
            console.log("Renter getShipmentByOrderId: ", response.data);
            setShipmentData(response.data.result);
            setLoading(false);
        } catch (error) {
            message.error("Something error while fetching shipment data!");
            console.log("shipment data err: ", error);
            setShipmentData([]);
            setLoading(false);
        }
    }

    const handleStatusChange = (value, shipmentId) => {
        const selectedOption = receiptConfirmation.find(option => option.value === value);
        const selectedLabel = selectedOption ? selectedOption.label : '';
        let content;
        if (value == "reject_goods_quality_issue" || value == "return_goods_wrong_parts") {
            content = "This action will cancel the order and cannot be reverted";
        } else {
            content = `Are you sure you want to update the ${selectedLabel} status?`;
        }
        Modal.confirm({
            title: 'Confirm Status Change',
            content: content,
            okText: 'Yes',
            cancelText: 'No',
            cancelButtonProps: { danger: true },
            onOk: () => {
                // Update shipment data only if user confirms
                const updatedShipments = shipmentData.map((shipment) =>
                    shipment.shipment_id === shipmentId
                        ? { ...shipment, received_status: value }
                        : shipment
                );
                setShipments(updatedShipments);
            },
            onCancel: () => {
                console.log('Status change canceled');
            },
        });
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
                    options={receiptConfirmation}
                    placeholder={'Select status'}
                    style={{ width: 150 }}
                />
            ),
        },
    ];

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
        // console.error('shipments:', shipments);
        // const hasEmptyStatus = shipments.some((shipment) => shipment.received_status == "");
        // console.error('hasEmptyStatus:', hasEmptyStatus);
        // if (hasEmptyStatus) {
        //     message.info("Please update the Received Status!");
        // } else {
        // }
        try {
            const resp = await axios.patch(UPDATE_SHIPMENT_URL, { shipment_details: shipments, orderid: order.order_id });
            message.success(resp.data.message);
            navigate(-1); // redirect to previous page
        } catch (error) {
            console.error('Failed to update shipments:', error);
            message.error("There is some error while updating the shipment!");
        }
    };

    return (
        <>
            <h4 className='text-center'>Renter shipment page</h4>
            <hr />
            <div className="container">
                <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
                <br />
                <div className="row">
                    <div className="col">
                        <p><span style={{ fontWeight: 'bold' }}>Note:</span>&nbsp;<span style={{ color: "red" }}>You can't modify any of the below fields except receipt confirmation</span></p>
                    </div>
                </div>

                <Table columns={columns} dataSource={shipmentData} pagination={false} loading={loading} />

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