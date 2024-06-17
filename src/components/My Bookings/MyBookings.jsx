import React, { useState } from 'react';
import { Button, DatePicker, Descriptions, Drawer, Form, Input, message, Modal, Select, Space, Table, Tag, Tooltip, Typography, Upload } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from "../../api/axios";
import { UploadOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    MinusCircleOutlined,
    SyncOutlined,
    ReloadOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment/moment';
import { useAuth } from '../../contexts/AuthContext';
import { typesOfGoods, uomChoices } from './utils';
const { TextArea } = Input;

function MyBookings() {
    const getAllBookingsUrl = "/booking/getAllBooking";
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passData, setPassData] = useState(null);
    const showModal = (data) => {
        setIsModalOpen(true);
        setPassData(data);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const getAllBookings = async () => {
        const response = await axios.get(getAllBookingsUrl);
        console.log("res", response);
        return response.data.results;
    };

    const { isPending, error, data } = useQuery({
        queryKey: ['allBookings'], queryFn: getAllBookings
    })

    console.log("isPending: ", isPending);
    console.log("error: ", error);
    console.log("data: ", data);

    if (isPending) return 'Loading Your Bookings...'

    if (error) return message.error('An error has occurred: ' + error.message);
    const formattedDateTime = (data) => {
        return moment(data).format('MMMM Do YYYY, h:mm a');
    }
    const columns = [
        {
            title: 'Booking ID',
            dataIndex: 'booking_id',
            key: 'booking_id',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Actual Start Date Time',
            dataIndex: 'actual_start_date_time',
            key: 'actual_start_date_time',
            render: (text) => <a>{text ? formattedDateTime(text) : '-'}</a>,
        },
        {
            title: 'Actual Start End Time',
            dataIndex: 'actual_end_date_time',
            key: 'actual_end_date_time',
            render: (text) => <a>{text ? formattedDateTime(text) : '-'}</a>,
        },
        {
            title: 'Machine ID',
            dataIndex: 'machine_id',
            key: 'machine_id',
        },
        {
            title: 'Booking Status',
            key: 'booking_status',
            dataIndex: 'booking_status',
            render: (_, { booking_status }) => {
                let color;
                let icon;
                if (booking_status === "pending") {
                    color = "geekblue";
                    icon = <SyncOutlined />
                } else if (booking_status === "accepted") {
                    color = "green";
                    icon = <CheckCircleOutlined />
                } else {
                    color = "red";
                    icon = <CloseCircleOutlined />
                }
                return (
                    <>
                        <Tag color={color} icon={icon} key={booking_status}>
                            <b>{booking_status ? booking_status.toUpperCase() : '-'}</b>
                        </Tag>
                    </>
                )
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type='primary' onClick={() => showModal(record)}>View</Button>
                    <Button type='primary' danger>Cancel</Button>
                </Space>
            ),
        },
    ];

    const refreshData = () => {
        getAllBookings();
    }



    return (
        <>
            <div className="container-fluid">
                <div className='row'>
                    <h5 class="card-title">My Bookings</h5>
                    <div className="col text-end">
                        <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Bookings</Button>
                    </div>
                    <div className="col-md-12">
                        <Table columns={columns} dataSource={data} />
                        {
                            isModalOpen && <ViewModal isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} items={passData} />
                        }
                    </div>

                </div>


            </div>
        </>
    )
}

// View details 

const ViewModal = ({ isModalOpen, handleOk, handleCancel, items }) => {
    console.log("items vie", items);

    const { authUser } = useAuth();
    console.log("items authUser", authUser);
    const formattedDateTime = (data) => {
        return moment(data).format('MMMM Do YYYY, h:mm a');
    }

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState();
    const [form] = Form.useForm();
    const [shipmentDateTime, setShipmentDateTime] = useState('');
    // const [items, setItems] = useState(items);

    // const showDefaultDrawer = () => {
    //     setSize('default');
    //     setOpen(true);
    // };
    const showLargeDrawer = () => {
        setSize('large');
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    const UPDATE_QUOTE_URL = "/booking/updatequote";

    let color;
    let icon;
    if (items.booking_status === "pending") {
        color = "geekblue";
        icon = <SyncOutlined />
    } else if (items.booking_status === "accepted") {
        color = "green";
        icon = <CheckCircleOutlined />
    } else {
        color = "red";
        icon = <CloseCircleOutlined />
    }

    const acceptOrder = async () => {
        try {
            setIsLoading(true);
            var reqItem = {
                quoteid: items.quote_id,
                plannedstartdatetime: items.planned_start_date_time,
                plannedenddatetime: items.planned_end_date_time,
                machineid: items.machine_id,
                orderprocesssheet: items.order_process_sheet,
                orderspec: items.order_spec,
                orderdrawing: items.order_drawing,
                orderprogramsheet: items.order_program_sheet,
                otherattachments: items.other_attachments,
                quotestatus: 'accepted',
                quantity: items.quantity
            }


            const response = await axios.patch(UPDATE_QUOTE_URL, reqItem);
            console.log("accepted: ", response);
            message.success("Quote Accepted!");
            // setItems(response.data);
            setIsLoading(false);
        } catch (error) {
            console.log("accepted error: ", error);
            message.error("Something error while accepting the quote!");
            setIsLoading(false);
        }
    }

    const quoteItems = [
        {
            label: 'Booking ID',
            children: items.booking_id,
        },
        {
            label: 'Booking Status',
            children: (
                <>
                    <Tag color={color} icon={icon} key={items.booking_status}>
                        <b>{items.booking_status.toUpperCase()}</b>
                    </Tag>
                </>
            )
        },
        {
            label: 'Machine ID',
            children: items.machine_id,
        },
        {
            label: 'Actual Start Date Time',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formattedDateTime(items.actual_start_date_time),
        },
        {
            label: 'Actual End Date Time',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formattedDateTime(items.actual_end_date_time),
        },
        {
            label: 'Renter Company ID',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: items.renter_company_id,
        },
        {
            label: 'Hirer Company ID',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: items.hirer_company_id,
        },

        items.cancelled_reason &&
        {
            label: 'Cancelled Reason',
            children: items.cancelled_reason
        },
        items.rescheduled_reason &&
        {
            label: 'Note:',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: items.rescheduled_reason
        },
        authUser.CompanyId == items.hirer_company_id &&
        {
            label: 'Action',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: (
                <>
                    <div className="row">
                        <div className="col">
                            <Button type="primary" onClick={showLargeDrawer}>
                                Add My Materials
                            </Button>
                        </div>
                    </div>
                </>
            )
        }

    ];

    const mockData = {
        "orderid": 6,
        "goods_status": "goods_in_transit",
        "shipment_datetime": "2024-06-24 11:00:00",
        "shipment_details": [
            {
                "typeofgoods": "raw_material",
                "quantity": 25,
                "description": "test",
                "uom": "pieces",
                "invoice": "https://b2url/rawinvoice.pdf"
            },
            {
                "typeofgoods": "tools",
                "quantity": 1,
                "description": "tools test",
                "uom": "pieces",
                "invoice": "https://b2url/tools.pdf"
            }
        ]
    }

    const onOk = (value) => {
        console.log('onOk: ', value);
    };

    const onFinish = (values) => {
        values.shipment_datetime = shipmentDateTime;
        values.goods_status = "goods_in_transit";
        var data = [{
            quantity: values.quantity,
            description: values.description,
            uom: values.uom,
            typeofgoods: values.typeofgoods
        }];
        // values.shipment_details.push(data)

        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const props = {
        beforeUpload: (file) => {
            console.log("file type: ", file);
            const isPNG = file.type === 'application/pdf';
            if (!isPNG) {
                message.error(`${file.name} is not a pdf file`);
            }

            const isSizeLimit = file.size / (1024 * 1024) > 2;
            console.log("isSizeLimit: ", isSizeLimit);
            if (isSizeLimit) {
                message.error(`"File size is too large (max 2 MB)`);
            }

            return isPNG || isSizeLimit || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            console.log(info.fileList);
        },
    };



    return (
        <>
            <Modal open={isModalOpen} width={1300}
                footer={[
                    <Button type='primary' onClick={handleOk}>
                        Okay
                    </Button>
                ]} onCancel={handleCancel} style={{ width: '100%' }}>
                <Descriptions
                    title='Quote Details'
                    bordered
                    column={{
                        xs: 1,
                        sm: 2,
                        md: 3,
                        lg: 3,
                        xl: 4,
                        xxl: 4,
                    }}
                    items={quoteItems}
                />
            </Modal>

            <Drawer
                title={`Shipment Details Update Sheet - (Hirer) - Order ID: `}
                placement="top"
                size={size}
                onClose={onClose}
                open={open}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" onClick={onClose}>
                            Add
                        </Button>
                    </Space>
                }
            >
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout='vertical'
                    form={form}
                >
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
                            >
                                <DatePicker
                                    showTime
                                    onChange={(value, dateString) => {
                                        console.log('Selected Time: ', value);
                                        console.log('Formatted Selected Time: ', dateString);
                                        setShipmentDateTime(dateString);
                                    }}
                                    onOk={onOk}
                                    required
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col">
                            <Form.Item
                                label="Type of Goods"
                                name="typeofgoods"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your type of goods!',
                                    },
                                ]}
                            >
                                <Select placeholder='Choose type of goods' style={{ width: '100%' }} options={typesOfGoods} />
                            </Form.Item>
                        </div>

                        <div className="col">
                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your description!',
                                    },
                                ]}
                            >
                                {/* <Input /> */}
                                <TextArea rows={3} placeholder="Enter your description (max: 200 words)" maxLength={200} showCount required />
                            </Form.Item>
                        </div>

                        <div className="col">
                            <Form.Item
                                label="Shipment Qty"
                                name="quantity"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your shipment quantity!',
                                    },
                                ]}
                            >
                                <Input placeholder='Enter shipment quantity' required />
                            </Form.Item>
                        </div>

                        <div className="col">
                            <Form.Item
                                label="UOM"
                                name="uom"
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
                    </div>

                    <div className="row">
                        <div className="col">
                            <Form.List name="shipment_details">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => {
                                            console.log("key: ", key);
                                            console.log("name: ", name);
                                            return (
                                                <>
                                                    <h6>Shipment Details - {name + 1}</h6>
                                                    <div className='row' key={key}>
                                                        <div className="col">
                                                            <Form.Item
                                                                label="Type of Goods"
                                                                // name="typeofgoods"
                                                                {...restField}
                                                                name={[name, 'typeofgoods']}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: 'Please input your type of goods!',
                                                                    },
                                                                ]}
                                                            >
                                                                <Select placeholder='Choose type of goods' style={{ width: '100%' }} options={typesOfGoods} />
                                                            </Form.Item>
                                                        </div>

                                                        <div className="col">
                                                            <Form.Item
                                                                label="Description"
                                                                // name="description"
                                                                {...restField}
                                                                name={[name, 'description']}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: 'Please input your description!',
                                                                    },
                                                                ]}
                                                            >
                                                                {/* <Input /> */}
                                                                <TextArea rows={3} placeholder="Enter your description (max: 200 words)" maxLength={200} showCount required />
                                                            </Form.Item>
                                                        </div>

                                                        <div className="col">
                                                            <Form.Item
                                                                label="Shipment Qty"
                                                                // name="quantity"
                                                                {...restField}
                                                                name={[name, 'quantity']}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: 'Please input your shipment quantity!',
                                                                    },
                                                                ]}
                                                            >
                                                                <Input placeholder='Enter shipment quantity' required />
                                                            </Form.Item>
                                                        </div>

                                                        <div className="col">
                                                            <Form.Item
                                                                label="UOM"
                                                                // name="uom"
                                                                {...restField}
                                                                name={[name, 'uom']}
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
                                                        <div className='col-auto mt-4'>
                                                            <Tooltip title={`Remove Shipment - ${name + 1}`}>
                                                                <Button danger shape="circle" onClick={() => remove(name)} icon={<CloseOutlined />} />
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        }

                                        )}
                                        {/* maximum four fields can be use so total 5 details */}
                                        {fields.length < 4 && (
                                            <div className='row'>
                                                <div className="col-auto">
                                                    <Form.Item>
                                                        <Button type="primary" onClick={() => add()} block icon={<PlusOutlined />}>
                                                            Add more shipment details
                                                        </Button>
                                                        {/* <button className='btn btn-secondary'>+ Add more shipment details</button> */}
                                                    </Form.Item>
                                                </div>
                                            </div>

                                        )}
                                    </>
                                )}
                            </Form.List>
                            {/* <Button type='secondary' icon={<PlusOutlined />}>Add More Shipment Details</Button> */}
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col text-center">
                            <Upload {...props}>
                                <Button type='primary' icon={<PlusCircleOutlined />}>Attach Invoice</Button>
                                <p>Max: 2 MB (Only PDF Format)</p>
                            </Upload>
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col text-center">
                            <Button htmlType='submit' type='primary'>Submit</Button>
                        </div>
                    </div>
                </Form>
            </Drawer>
        </>
    )
}

export default MyBookings;