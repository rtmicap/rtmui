import React, { useState } from 'react';
import { Button, Descriptions, message, Modal, Space, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from "../../api/axios";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    MinusCircleOutlined,
    SyncOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formattedDateTime } from '../../utils/utils';
import { GET_ALL_QUOTES_URL, UPDATE_QUOTE_URL } from '../../api/apiUrls';

const dummyData = [
    {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        tags: ['nice', 'developer'],
    },
    {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
        tags: ['loser'],
    },
    {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sydney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
    },
];

function Quotes() {
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

    const getAllQuotes = async () => {
        const response = await axios.get(GET_ALL_QUOTES_URL);
        return response.data.result;
    };

    const { isPending, error, data } = useQuery({
        queryKey: ['allQuotes'], queryFn: getAllQuotes
    })

    console.log("isPending: ", isPending);
    console.log("error: ", error);
    console.log("data: ", data);

    if (isPending) return 'Loading Your Quotes...'

    if (error) return message.error('An error has occurred: ' + error.message);

    const columns = [
        {
            title: 'Quote ID',
            dataIndex: 'quote_id',
            key: 'quote_id',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Order Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Machine ID',
            dataIndex: 'machine_id',
            key: 'machine_id',
        },
        {
            title: 'Quote Status',
            key: 'quote_status',
            dataIndex: 'quote_status',
            render: (_, { quote_status }) => {
                let color;
                let icon;
                if (quote_status === "pending") {
                    color = "geekblue";
                    icon = <SyncOutlined />
                } else if (quote_status === "accepted") {
                    color = "green";
                    icon = <CheckCircleOutlined />
                } else {
                    color = "red";
                    icon = <CloseCircleOutlined />
                }
                return (
                    <>
                        <Tag color={color} icon={icon} key={quote_status}>
                            <b>{quote_status.toUpperCase()}</b>
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
        getAllQuotes();
    }



    return (
        <>
            <div className="container-fluid">
                <div className='row'>
                    <h5 class="card-title">Quotes</h5>
                    <div className="col text-end">
                        <Button type='link' onClick={refreshData} icon={<ReloadOutlined />}>Refresh Quotes</Button>
                    </div>
                    <div className="col-md-12">
                        <Table columns={columns} dataSource={data} />
                        {
                            isModalOpen && <ViewModal isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} items={passData} refreshData={refreshData} />
                        }
                    </div>

                </div>


            </div>
        </>
    )
}

const ViewModal = ({ isModalOpen, handleOk, handleCancel, items }) => {
    console.log("items vie", items);
    const navigate = useNavigate();
    const { authUser } = useAuth();
    console.log("items authUser", authUser);
    const [isLoading, setIsLoading] = useState(false);
    // const [items, setItems] = useState(items);

    let color;
    let icon;
    if (items.quote_status === "pending") {
        color = "geekblue";
        icon = <SyncOutlined />
    } else if (items.quote_status === "accepted") {
        color = "green";
        icon = <CheckCircleOutlined />
    } else {
        color = "red";
        icon = <CloseCircleOutlined />
    }

    const acceptAndRejectOrder = async (value) => {
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
                quotestatus: value,
                quantity: items.quantity,
                hirerCompanyId: items.hirer_company_id
            }


            const response = await axios.patch(UPDATE_QUOTE_URL, (reqItem));
            console.log("accepted: ", response);
            message.success(`${items.quote_id} Quote Accepted!`);
            // setItems(response.data);
            handleOk();
            refreshData();
            setIsLoading(false);
        } catch (error) {
            console.log("accepted error: ", error);
            message.error("Something error while accepting the quote!");
            setIsLoading(false);
        }
    }

    const bookingPage = () => {
        navigate("/my-bookings");
    }

    const quoteItems = [
        {
            label: 'Quote ID',
            children: items.quote_id,
        },
        {
            label: 'Quote Status',
            children: (
                <>
                    <Tag color={color} icon={icon} key={items.quote_status}>
                        <b>{items.quote_status.toUpperCase()}</b>
                    </Tag>
                </>
            )
        },
        {
            label: 'Order Quantity',
            children: items.quantity,
        },
        {
            label: 'Machine ID',
            children: items.machine_id,
        },
        {
            label: 'Planned Start Date Time',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formattedDateTime(items.planned_start_date_time),
        },
        {
            label: 'Planned End Date Time',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: formattedDateTime(items.planned_end_date_time),
        },
        {
            label: 'Hirer Company ID',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: items.hirer_company_id,
        },
        {
            label: 'Files',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: (
                <>
                    <ol>
                        <li><Link to={items.order_drawing} target="_blank">View Part Drawing File</Link></li>
                        {items.order_program_sheet && <li><Link to={items.order_program_sheet} target="_blank">View Program Sheet File</Link></li>}
                        {items.order_process_sheet && <li><Link to={items.order_process_sheet} target="_blank">View Process Sheet File</Link></li>}
                        {items.order_spec && <li><Link to={items.order_spec} target="_blank">View Specs/Standard File</Link></li>}
                        {items.other_attachments && <li><Link to={items.other_attachments} target="_blank">View Others File</Link></li>}
                    </ol>
                </>
            )
        },
        authUser.CompanyId == items.renter_company_id && items.quote_status == "pending" &&
        {
            label: 'Action',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: (
                <>
                    <div className='row'>
                        {/* display accept order button when pending status */}
                        <div className="col">
                            <Button type='primary' onClick={() => acceptAndRejectOrder('accepted')}>{isLoading ? 'Accepting your quote...' : 'Accept Order'}</Button>
                        </div>
                        {/* <div className="col">
                            <Button type="dashed">Change Booking Dates</Button>
                        </div> */}
                        <div className="col">
                            <Button type="primary" danger onClick={() => acceptAndRejectOrder('rejected')}>Reject Order</Button>
                        </div>
                    </div>
                </>
            )
        },
        items.quote_status == "accepted" &&
        {
            label: 'Note:',
            span: {
                xl: 2,
                xxl: 2,
            },
            children: (
                <>
                    <div className='row'>
                        <div className="col">
                            <strong>You can check your bookings page<Button type='link' onClick={bookingPage}>here</Button></strong>
                        </div>
                    </div>
                </>
            )
        }

    ];

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

export default Quotes;