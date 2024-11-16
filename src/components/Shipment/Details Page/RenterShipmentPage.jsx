import { Button, DatePicker, Form, message, Select, Spin, Upload, Input, notification, Tooltip, Flex, Collapse, Table, Space, Modal, InputNumber } from 'antd';
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
    const [receivedQuantity, setReceivedQuantity] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(false);

    const getShipmentByOrderId = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${GET_SHIPMENT_BY_ORDERID_URL}/${order.order_id}`);
            console.log("Renter getShipmentByOrderId: ", response.data);
            if (response && response.data.result.length > 0) {
                // display only those updated the status 
                const filteredDataByStatus = response.data.result.filter((data) => !data.received_status);
                // setShipmentData(response.data.result);
                setShipmentData(filteredDataByStatus);
                setLoading(false);
            } else {
                setShipmentData([]);
                setLoading(false);
            }
        } catch (error) {
            message.error("Something error while fetching shipment data!");
            console.log("shipment data err: ", error);
            setShipmentData([]);
            setLoading(false);
        }
    }


    const handleSaveChanges = (record, newStatus) => {
        const selectedOption = receiptConfirmation.find(option => option.value === newStatus);
        const selectedLabel = selectedOption ? selectedOption.label : '';
        let content;
        if (record.type_of_goods === 'raw_material') {
            if (newStatus === 'reject_goods_quality_issue' || newStatus === 'return_goods_wrong_parts') {
                content = "This action will cancel the order and cannot be reverted";
            } else {
                content = `You are changing the received status as ${selectedLabel}. Please confirm`;
            }
        } else {
            content = `You are changing the received status as ${selectedLabel}. Please confirm`;
        }

        if (record.type_of_goods === "raw_material" && newStatus === "received_short") {
            // Show modal to input new order quantity
            Modal.confirm({
                title: "Enter New Order Quantity",
                content: (
                    <>
                        <div className='row'>
                            <div className="col">
                                <b> UOM:</b>  {record.UOM}
                            </div>
                            <div className="col">
                                <b>Order Quantity:</b>  {order.quantity}
                            </div>
                        </div><br />
                        <div className="row">
                            <div className="col">
                                <b>Shipment Quantity:</b> {record.quantity}
                            </div>
                            <div className="col">
                                <label htmlFor=""><b>Enter new order quantity</b></label>
                                <InputNumber
                                    placeholder="Enter New Order Quantity"
                                    style={{
                                        width: '100%',
                                    }}
                                    required
                                    name={'new_order_quantity'}
                                    // prefix="Enter New Order Quantity"
                                    onChange={(value) => {
                                        record.new_order_quantity = value;
                                    }}
                                />
                            </div>
                        </div>

                    </>
                ),
                okText: "Save",
                width: "60%", // Adjust width to 60% of the viewport
                centered: true, // Center modal horizontally
                onOk: () => {
                    if (record.new_order_quantity) {
                        if (record.new_order_quantity > order.quantity) {
                            message.error(`New order quantity should not more than ${order.quantity}.`);
                        } else {
                            updateShipment(record, newStatus);
                        }
                    } else {
                        message.error("Please enter a valid quantity.");
                    }
                },
            });
        } else {
            // Show confirmation modal for other statuses/types
            Modal.confirm({
                title: "Confirm Status Change",
                // content: `Are you sure you want to change the status to "${selectedLabel}"?`,
                content: content,
                okText: "Yes",
                cancelText: "No",
                onOk: () => updateShipment(record, newStatus),
            });
        }
    };

    const updateShipment = (record, newStatus) => {
        // console.log("updatedShipments: ", shipmentData)
        const updatedShipments = shipmentData.map((shipment) =>
            shipment.shipment_id === record.shipment_id
                ? { ...shipment, received_quantity: record.quantity, received_status: newStatus, typeofgoods: shipment.type_of_goods }
                : shipment
        );

        console.log("updatedShipments2: ", updatedShipments);
        setShipmentData(updatedShipments);
        // message.success("Shipment updated successfully!");
    };

    const columns = [
        // {
        //     title: 'Shipment ID',
        //     dataIndex: 'shipment_id',
        //     key: 'shipment_id',
        //     //   render: (text) => <a>{text}</a>,
        // },
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
                    // value={received_status || null}  // Set current value for controlled component
                    onChange={(value) => handleSaveChanges(record, value)}
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
        try {
            // console.log('shipmentData:', shipmentData);
            const hasEmptyStatus = shipmentData.filter((shipment) => shipment && !shipment.received_status);
            console.log('hasEmptyStatus:', hasEmptyStatus);
            if (hasEmptyStatus && hasEmptyStatus.length > 0) {
                message.info("Please update the Received Status!");
            }
            console.log('shipments2:', shipmentData);
            const resp = await axios.patch(UPDATE_SHIPMENT_URL, { shipment_details: shipmentData, orderid: order.order_id });
            message.success(resp.data.message ? resp.data.message : 'Shipment Updated!');
            navigate(-1); // redirect to previous page
        } catch (error) {
            console.error('Failed to update shipments:', error);
            message.error("There is some error while updating the shipment!");
        }
    };


    return (
        <>
            <Button icon={<LeftCircleOutlined />} type='link' onClick={() => navigate(-1)}>Back</Button>
            <h3 className='text-center'>Shipment Review</h3>
            <p className='text-center'>(Order Id: {order.quote_id})</p>
            <hr />
            <div className="container">
                <div className="row">
                    <div className="col">
                        <p><span style={{ fontWeight: 'bold' }}>Note:</span>&nbsp;<span style={{ color: "red" }}>You can't modify any of the below fields except receipt confirmation</span></p>
                    </div>
                </div>

                <Table columns={columns} dataSource={shipmentData} pagination={false} loading={loading} locale={{
                    emptyText: loading ? "Loading data..." : "No shipment records available or status have been updated already",
                }} />

                <Space style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Space>

                {/* Change Quantity for received shorts */}
                {/* {selectedRecord && (
                    <Modal
                        title={`Received Short Status Update`}
                        open={openModal}
                        onCancel={handleQuantityCancel}
                        footer={[
                            <Button key="cancel" onClick={handleQuantityCancel}>
                                Cancel
                            </Button>,
                            <Button key="update" type="primary" onClick={() => handleQuantityChange(selectedRecord)}>
                                Update
                            </Button>,
                        ]}
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item
                                label="UOM"
                                name="UOM"
                            >
                                {selectedRecord.UOM}
                            </Form.Item>
                            <Form.Item
                                label="Enter new order quantity"
                                name="new_order_quantity"
                                rules={[{ required: true, message: 'Please enter new order quantity!' }]}
                            >
                                <Input
                                    placeholder="Enter new order quantity"
                                    onChange={(e) => setReceivedQuantity(e.target.value)}
                                />
                            </Form.Item>
                        </Form>
                    </Modal>)} */}
            </div>
        </>
    )
}

export default RenterShipmentPage