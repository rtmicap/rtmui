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
import { useAuth } from '../../contexts/AuthContext';
import { formattedDateTime } from '../../utils/utils';
const { TextArea } = Input;

function MyBookings() {
    const { authUser } = useAuth();
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
        console.log("res", response.data);
        const filteredData = response.data.results.filter((item) => item.hirer_company_id == authUser.CompanyId)
        return filteredData;
    };

    const { isPending, error, data, refetch } = useQuery({
        queryKey: ['allBookings'], queryFn: getAllBookings
    })

    console.log("isPending: ", isPending);
    console.log("error: ", error);
    console.log("data: ", data);

    if (isPending) return 'Loading Your Bookings...'

    if (error) return message.error('An error has occurred: ' + error.message);

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
        refetch();
    }



    return (
        <>
            <div className="container-fluid">
                <div className='row'>
                    <h3 class="card-title">My Bookings</h3>
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
        // authUser.CompanyId == items.hirer_company_id &&
        // {
        //     label: 'Action',
        //     span: {
        //         xl: 2,
        //         xxl: 2,
        //     },
        //     children: (
        //         <>
        //             <div className="row">
        //                 <div className="col">
        //                     <Button type="primary" onClick={showLargeDrawer}>
        //                         Add My Materials
        //                     </Button>
        //                 </div>
        //             </div>
        //         </>
        //     )
        // }

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
        </>
    )
}

export default MyBookings;